const multer = require('multer');
const cloudinary = require('../utils/cloudiary');
const Post = require('../schemas/Post.model')
const fs = require('fs');
const { ObjectId } = require('mongodb');
const client = require('../DTB/mongoconnection');
const User = require('../schemas/user.model')

// Temporary local storage for file
const upload = multer({ dest: 'uploads/' });

const createPost = async (req, res) => {
    try {
        console.debug('Received request body:', req.body);
        console.debug('Received files:', req.files);

        const { userId, text } = req.body;
        
        console.debug('Connected to MongoDB');

        let attachments = [];

        // Handle multiple file uploads
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const ext = file.originalname.split('.').pop().toLowerCase();
                let resourceType = 'auto';
                if (ext === 'pdf' || ext === 'doc' || ext === 'docx' || ext === 'ppt' || ext === 'pptx' || ext === 'xls' || ext === 'xlsx' || ext === 'txt') {
                    resourceType = 'raw';
                }
                console.debug('Uploading file to Cloudinary:', file.path);
                const result = await cloudinary.uploader.upload(file.path, {
                    resource_type: resourceType,
                });
                console.debug('Cloudinary upload result:', result);

                fs.unlinkSync(file.path);
                console.debug('Deleted local file:', file.path);

                let filetype = 'document';
                

                if (result.resource_type === 'image') {
                    filetype = 'image';
                } else if (result.resource_type === 'video') {
                    filetype = 'video';
                } else if (ext === 'txt') {
                    filetype = 'txt';
                } else if (ext === 'pdf') {
                    filetype = 'pdf';
                } else if (ext === 'pptx') {
                    filetype = 'pptx';
                }

                attachments.push({
                    file: {
                        url: result.secure_url,
                        filename: result.original_filename,
                        mimetype: file.mimetype,
                        filetype,
                    }
                });
                console.debug('Attachment info:', attachments[attachments.length - 1]);
            }
        }

        const post = {
            userId: new ObjectId(userId),
            text: text || '',
            attachments,
            createdAt: new Date(),
            likes: [],
            comments: [],
        };

        console.debug('Post object to insert:', post);

        const result = await Post.insertOne(post);
        console.debug('MongoDB insert result:', result);

        res.status(201).json({ success: true, post: { _id: result.insertedId, ...post } });
    } catch (error) {
        console.error('Error in createPost:', error);
        res.status(500).json({ message: 'Error creating post', error: error.message });
    }
};

const RenderPost = async (req, res) => {
  try {
    
    const posts = await Post.find({})
      .populate('userId', 'username avatar') 
      .populate('comments.userId', 'username avatar') 
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, posts });
  } catch (error) {
    console.error('Error in RenderPost:', error);
    res.status(500).json({ message: 'Error fetching posts', error: error.message });
  }
};





const getUserPosts = async (req, res) => {
    try {   
        const { id } = req.params;
        
        console.debug('Fetching posts for user:', id);
        const posts = await Post.find({ userId: new ObjectId(id) }).sort({ createdAt: -1 });
        console.debug('Fetched posts:', posts);
        res.status(200).json({ success: true, posts });
    } catch (error) {
        console.error('Error in getUserPosts:', error); 
        res.status(500).json({ message: 'Error fetching user posts', error: error.message });
    }
};

const updatepost = async (req, res) => {
    try {
        const { text, existingAttachments } = req.body;
        const { postid } = req.params;
        const userId = req.user && req.user.id ? req.user.id : req.body.userId;

        // Tìm post với đúng user
        const post = await Post.findOne({ _id: new ObjectId(postid), userId: new ObjectId(userId) });
        if (!post) {
            return res.status(404).json({ message: 'Post not found or user not authorized' });
        }

        // Cập nhật nội dung bài viết
        if (typeof text === 'string') post.text = text;

        // Xử lý attachments
        let finalAttachments = [];
        
        // 1. Thêm existing attachments (không thay đổi) nếu có
        if (existingAttachments) {
            try {
                const parsedExistingAttachments = typeof existingAttachments === 'string' 
                    ? JSON.parse(existingAttachments) 
                    : existingAttachments;
                
                if (Array.isArray(parsedExistingAttachments)) {
                    finalAttachments = [...parsedExistingAttachments];
                }
            } catch (err) {
                console.warn('Error parsing existingAttachments:', err.message);
            }
        }

        // 2. Thêm các file mới được upload
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const ext = file.originalname.split('.').pop().toLowerCase();
                let resourceType = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt'].includes(ext) ? 'raw' : 'auto';

                const result = await cloudinary.uploader.upload(file.path, {
                    resource_type: resourceType,
                });

                fs.unlinkSync(file.path);

                let filetype = 'document';
                if (result.resource_type === 'image') filetype = 'image';
                else if (result.resource_type === 'video') filetype = 'video';
                else if (['txt', 'pdf', 'pptx', 'ppt', 'doc', 'docx', 'xls', 'xlsx'].includes(ext)) filetype = ext;

                finalAttachments.push({
                    file: {
                        url: result.secure_url,
                        filename: result.original_filename,
                        mimetype: file.mimetype,
                        filetype,
                    }
                });
            }
        }

        // 3. Xóa các file cũ không còn trong finalAttachments
        if (post.attachments && post.attachments.length > 0) {
            // Lấy danh sách URL của attachments mới
            const newAttachmentUrls = finalAttachments.map(att => {
                // Handle both structures: {file: {url}} and {url}
                return att.file?.url || att.url;
            }).filter(Boolean);

            // Xóa các file cũ không còn trong danh sách mới
            for (const oldAttachment of post.attachments) {
                const oldUrl = oldAttachment.file?.url || oldAttachment.url;
                if (oldUrl && !newAttachmentUrls.includes(oldUrl)) {
                    // File này đã bị xóa, cần xóa trên Cloudinary
                    try {
                        const urlParts = oldUrl.split('/');
                        const publicIdWithExt = urlParts[urlParts.length - 1];
                        const publicId = publicIdWithExt.split('.')[0];
                        await cloudinary.uploader.destroy(publicId, { resource_type: 'auto' });
                        console.log('Deleted old file from Cloudinary:', publicId);
                    } catch (err) {
                        console.warn('Failed to delete old file on Cloudinary:', err.message);
                    }
                }
            }
        }

        // 4. Cập nhật attachments của post
        post.attachments = finalAttachments;

        // Lưu lại bài viết
        await post.save();

        res.status(200).json({ success: true, post });
    } catch (error) {
        console.error('Error in updatePost:', error);
        res.status(500).json({ message: 'Error updating post', error: error.message });
    }
};

const deletePost = async (req, res) => {
        const id = req.params.id;
        const userId = req.query.userId;

    try {
        // Tìm post với đúng user
        const post = await Post.findOne({ _id: new ObjectId(id), userId: new ObjectId(userId) });
        if (!post) {
            return res.status(404).json({ message: 'Post not found or user not authorized' });
        }

        // Xóa các file đính kèm trên Cloudinary nếu có
        if (post.attachments && post.attachments.length > 0) {
            for (const attachment of post.attachments) {
                if (attachment.file && attachment.file.url) {
                    // Lấy public_id từ url để xóa trên Cloudinary
                    const urlParts = attachment.file.url.split('/');
                    const publicIdWithExt = urlParts[urlParts.length - 1];
                    const publicId = publicIdWithExt.split('.')[0];
                    try {
                        await cloudinary.uploader.destroy(publicId, { resource_type: 'auto' });
                    } catch (err) {
                        // Không dừng lại nếu xóa file trên Cloudinary lỗi
                        console.warn('Failed to delete file on Cloudinary:', err.message);
                    }
                }
            }
        }

        // Xóa post khỏi database
        await Post.deleteOne({ _id: new ObjectId(id), userId: new ObjectId(userId) });

        res.status(200).json({ success: true, message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error in deletePost:', error);
        res.status(500).json({ message: 'Error deleting post', error: error.message });
    }
}

module.exports = {
    createPost,
    RenderPost,
    getUserPosts,
    updatepost,
    deletePost
};