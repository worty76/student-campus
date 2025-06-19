const multer = require('multer');
const cloudinary = require('../utils/cloudiary');
const Post = require('../schemas/Post.model')
const fs = require('fs');
const { ObjectId } = require('mongodb');
const client = require('../DTB/mongoconnection');

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
                console.debug('Uploading file to Cloudinary:', file.path);
                const result = await cloudinary.uploader.upload(file.path, {
                    resource_type: 'auto',
                });
                console.debug('Cloudinary upload result:', result);

                fs.unlinkSync(file.path);
                console.debug('Deleted local file:', file.path);

                let filetype = 'document';
                const ext = file.originalname.split('.').pop().toLowerCase();

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
    // Lấy toàn bộ bài post, sắp xếp theo thời gian mới nhất
    const posts = await Post.find({})
      .populate('userId', 'username avatar') // populate nếu muốn hiển thị thông tin user
      .populate('comments.userId', 'username avatar') // populate user của từng comment
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, posts });
  } catch (error) {
    console.error('Error in RenderPost:', error);
    res.status(500).json({ message: 'Error fetching posts', error: error.message });
  }
};

module.exports = {
    createPost,
    RenderPost
};          