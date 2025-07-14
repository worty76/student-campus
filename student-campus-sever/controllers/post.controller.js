const multer = require('multer');
const cloudinary = require('../utils/cloudiary');
const Post = require('../schemas/Post.model')
const fs = require('fs');
const { ObjectId } = require('mongodb');
const client = require('../DTB/mongoconnection');
const User = require('../schemas/user.model')
const Group = require('../schemas/group.model');
const { default: mongoose } = require('mongoose');

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
const createPostGroup = async (req, res) => {
    
    try {
        console.debug('Received request body:', req.body);
        console.debug('Received files:', req.files);
        const { userId, text ,groupid} = req.body;
        console.debug('Connected to MongoDB');
        console.log(groupid);
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

            const newPost = new Post({
                userId: new ObjectId(userId),
                text: text || '',
                attachments,
                createdAt: new Date(),
                likes: [],
                comments: [],
            });

            const savedPost = await newPost.save();

            const test = await Group.updateOne(
                { _id: new mongoose.Types.ObjectId(groupid) },
                { $push: { posts: savedPost._id } }
            );

            console.debug('Update group with post result:', test);

res.status(201).json({ success: true, post: savedPost });
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
        const cleanid = id.trim();
        if (!cleanid) {
            console.log('there is no user id');
            return res.status(400).json({ success: false, message: 'No user id provided' });
        }
        const user = await User.findById(cleanid);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Chỉ trả về post của user
        const userPosts = await Post.find({ userId: cleanid }).sort({ createdAt: -1 });
        const postsWithUser = await Promise.all(
            userPosts.map(async (post) => {
                const userInfo = await User.findById(post.userId).select('_id username avatar_link').lean();
                const likes = Array.isArray(post.likes)
                    ? post.likes.map(like => (like._id ? String(like._id) : String(like)))
                    : [];
                return {
                    ...post.toObject(),
                    likes,
                    userInfo: userInfo
                        ? {
                            _id: userInfo._id,
                            username: userInfo.username,
                            avatar_link: userInfo.avatar_link
                        }
                        : null
                };
            })
        );

        res.status(200).json({ success: true, posts: postsWithUser });
    } catch (error) {
        console.error('Error in getUserPosts:', error);
        res.status(500).json({ message: 'Error fetching user posts', error: error.message });
    }
};

const getPostById = async (req, res) => {
    try {
        const { postId } = req.params;
        if (!postId) {
            return res.status(400).json({ success: false, message: 'No post id provided' });
        }
        const post = await Post.findById(postId)
            .populate('userId', '_id username avatar_link')
            .populate('comments.userId', '_id username avatar_link');
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }
        // Format userInfo for post and comments
        const postObj = post.toObject();
        postObj.userInfo = postObj.userId
            ? {
                _id: postObj.userId._id,
                username: postObj.userId.username,
                avatar_link: postObj.userId.avatar_link
            }
            : null;
        if (Array.isArray(postObj.comments)) {
            postObj.comments = postObj.comments.map(comment => ({
                ...comment,
                userInfo: comment.userId
                    ? {
                        _id: comment.userId._id,
                        username: comment.userId.username,
                        avatar_link: comment.userId.avatar_link
                    }
                    : null
            }));
        }
        res.status(200).json({ success: true, post: postObj });
    } catch (error) {
        console.error('Error in getPostById:', error);
        res.status(500).json({ message: 'Error fetching post', error: error.message });
    }
};
const updatepost = async (req, res) => {
    try {
        const { text, existingAttachments } = req.body;
        const { postid } = req.params;
        const userId = req.user && req.user.id ? req.user.id : req.body.userId;

       
        const post = await Post.findOne({ _id: new ObjectId(postid), userId: new ObjectId(userId) });
        if (!post) {
            return res.status(404).json({ message: 'Post not found or user not authorized' });
        }


        if (typeof text === 'string') post.text = text;

 
        let finalAttachments = [];
        
     
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

        if (post.attachments && post.attachments.length > 0) {
        
            const newAttachmentUrls = finalAttachments.map(att => {
                
                return att.file?.url || att.url;
            }).filter(Boolean);

          
            for (const oldAttachment of post.attachments) {
                const oldUrl = oldAttachment.file?.url || oldAttachment.url;
                if (oldUrl && !newAttachmentUrls.includes(oldUrl)) {
                   
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


        post.attachments = finalAttachments;

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

        const post = await Post.findOne({ _id: new ObjectId(id), userId: new ObjectId(userId) });
        if (!post) {
            return res.status(404).json({ message: 'Post not found or user not authorized' });
        }


        if (post.attachments && post.attachments.length > 0) {
            for (const attachment of post.attachments) {
                if (attachment.file && attachment.file.url) {
                 
                    const urlParts = attachment.file.url.split('/');
                    const publicIdWithExt = urlParts[urlParts.length - 1];
                    const publicId = publicIdWithExt.split('.')[0];
                    try {
                        await cloudinary.uploader.destroy(publicId, { resource_type: 'auto' });
                    } catch (err) {
                    
                        console.warn('Failed to delete file on Cloudinary:', err.message);
                    }
                }
            }
        }


        await Post.deleteOne({ _id: new ObjectId(id), userId: new ObjectId(userId) });

        res.status(200).json({ success: true, message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error in deletePost:', error);
        res.status(500).json({ message: 'Error deleting post', error: error.message });
    }
}

const renderPostBaseOnUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const cleanid = userId.trim();
        if (!cleanid) {
            console.log('there is no user id');
            return res.status(400).json({ success: false, message: 'No user id provided' });
        }

        // Lấy page và limit từ query, mặc định page=1, limit=10
        const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
        const limit = parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 10;
        const skip = (page - 1) * limit;

        const groups = await Group.find({ members: { $in: [cleanid] } });
        const user = await User.findById(cleanid);
        const userFriendsPost = user.friends || [];
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 30);

        // Lấy post của bạn bè (chỉ lấy nếu profilePrivacy của bạn bè là 'public' hoặc 'friends')
        const friends = await User.find({ _id: { $in: userFriendsPost } }).select('_id profilePrivacy');
        const visibleFriendIds = friends
            .filter(f => f.profilePrivacy === 'everyone' || f.profilePrivacy === 'friends')
            .map(f => String(f._id));

        let friendPosts = [];
        if (visibleFriendIds.length > 0) {
            friendPosts = await Post.find({ userId: { $in: visibleFriendIds }, createdAt: { $gte: sevenDaysAgo } }).sort({ createdAt: -1 });
        }

        const postsWithUser = await Promise.all(
            friendPosts.map(async (post) => {
                const user = await User.findById(post.userId).select('_id username avatar_link').lean();
                const likes = Array.isArray(post.likes)
                    ? post.likes.map(like => (like._id ? String(like._id) : String(like)))
                    : [];
                return {
                    ...post.toObject(),
                    likes,
                    userInfo: user
                        ? {
                            _id: user._id,
                            username: user.username,
                            avatar_link: user.avatar_link
                        }
                        : null
                };
            })
        );

        // Lấy post của group
        const groupPosts = await Post.find({ _id: { $in: groups.flatMap(g => g.posts) }, createdAt: { $gte: sevenDaysAgo } }).sort({ createdAt: -1 });
        const postGroupWithUser = await Promise.all(
            groupPosts.map(async (post) => {
                const user = await User.findById(post.userId).select('_id username avatar_link').lean();
                const likes = Array.isArray(post.likes)
                    ? post.likes.map(like => (like._id ? String(like._id) : String(like)))
                    : [];
                return {
                    ...post.toObject(),
                    likes,
                    userInfo: user
                        ? {
                            _id: user._id,
                            username: user.username,
                            avatar_link: user.avatar_link
                        }
                        : null
                };
            })
        );

        // Luôn hiển thị post của chính user
        const userPosts = await Post.find({ userId: cleanid, createdAt: { $gte: sevenDaysAgo } }).sort({ createdAt: -1 });
        
        const userPostsWithUser = await Promise.all(
            userPosts.map(async (post) => {
                const user = await User.findById(post.userId).select('_id username avatar_link').lean();
                const likes = Array.isArray(post.likes)
                    ? post.likes.map(like => (like._id ? String(like._id) : String(like)))
                    : [];
                return {
                    ...post.toObject(),
                    likes,
                    userInfo: user
                        ? {
                            _id: user._id,
                            username: user.username,
                            avatar_link: user.avatar_link
                        }
                        : null
                };
            })
        );

        // Gộp và loại trùng
        const allPosts = [...postsWithUser, ...postGroupWithUser, ...userPostsWithUser];
        const uniquePostsMap = new Map();
        allPosts.forEach(post => {
            uniquePostsMap.set(String(post._id), post);
        });
        const finalPosts = Array.from(uniquePostsMap.values())
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Phân trang
        const paginatedPosts = finalPosts.slice(skip, skip + limit);

        res.status(200).json({ 
            success: true, 
            posts: paginatedPosts,
            page,
            limit,
            total: finalPosts.length,
            hasMore: skip + limit < finalPosts.length
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Error fetching posts', error: error.message });
    }
};

const likePost = async (postid, userId) => {
    try {
        if (!postid || !userId) {
            console.log('postid and userId are required');
            return false;
        }

        const postlike = await Post.updateOne(
            { _id: new mongoose.Types.ObjectId(postid) },
            { $addToSet: { likes: userId } }
        );
        if (postlike.modifiedCount > 0) {
            return true;
        } else {
            console.log('User already liked this post or post not found');
            return false;
        }
    } catch (error) {
        console.error('Error while liking post:', error);
        return false;
    }
};

const unlikePost = async (postid, userId) => {
    try {
        if (!postid || !userId) {
            console.log('postid and userId are required');
            return false;
        }

        const result = await Post.updateOne(
            { _id: new mongoose.Types.ObjectId(postid) },
            { $pull: { likes: userId } }
        );
        if (result.modifiedCount > 0) {
            return true;
        } else {
            console.log('User had not liked this post or post not found');
            return false;
        }
    } catch (error) {
        console.error('Error while unliking post:', error);
        return false;
    }
};


const addcomment = async (postid, userId, context) => {
    try {
        if (!postid || !userId) {
            console.log('postid and userId are required');
            return false;
        }
        const userinfo = await User.findById(userId).select('username avatar_link');
        const comment = {
            userinfo: userinfo,
            context: context
        };
        const result = await Post.updateOne(
            { _id: new mongoose.Types.ObjectId(postid) },
            { $push: { comments: comment } }
        );
        return result;
    } catch (error) {
        console.log(error);
        return false;
    }
}




module.exports = {
    createPost,
    RenderPost,
    getUserPosts,
    updatepost,
    deletePost,
    createPostGroup,
    renderPostBaseOnUser,
    likePost,
    unlikePost,
    addcomment,
    getPostById
};