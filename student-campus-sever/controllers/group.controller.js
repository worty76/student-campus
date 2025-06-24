
const group = require('../schemas/group.model')
const User = require('../schemas/user.model');
const Post = require('../schemas/Post.model');

const { default: mongoose } = require('mongoose');
const { ObjectId } = require('mongoose').Types;

const joinGroup = async (req, res) => {
    try {
        const { groupId, userId } = req.body;

        if (!groupId || !userId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const result = await group.updateOne(
            { _id: new ObjectId(groupId) },
            { $addToSet: { members: userId } }
        );

        if (result.modifiedCount > 0) {
            return res.status(200).json({ message: 'User added to group' });
        } else if (result.matchedCount > 0) {
            return res.status(200).json({ message: 'User already in group' });
        } else {
            return res.status(404).json({ message: 'Group not found' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Error joining group', error: error.message });
    }
};


const createGroup = async (req, res) => {
    try {
        const { group: groupData } = req.body;
        if (!groupData || !groupData.name || !groupData.creater || !groupData.icon) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const newGroup = new group({
            name: groupData.name,
            creater: groupData.creater,
            icon: groupData.icon,
            desc: groupData.desc || '',
            members: groupData.members && groupData.members.length > 0
            ? groupData.members
            : [groupData.creater], 
            posts:[],
            createAt: new Date(),
            tags: groupData.tags || []
        });

        const savedGroup = await newGroup.save();
        res.status(201).json(savedGroup);
    } catch (error) {
        res.status(500).json({ message: 'Error creating group', error: error.message });
    }
};

const renderGroup = async (req, res) => {
    try {
        const groups = await group.find({});
        res.status(200).json(groups);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching groups', error: error.message });
    }
};

const renderUserGroups = async (req, res) => {
    try {
        const { userId } = req.params;
        console.log(userId)

        if (!userId) {
            return res.status(400).json({ message: 'Missing  user id' });
        }

        const groups = await group.find({ members: userId });

        if (!groups) {
            return res.status(404).json({ message: 'Group not found or user not a member' });
        }

        res.status(200).json(groups);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching group', error: error.message });
    }
};

const rendergrouppost = async (req, res) => {
  try {
    const groupid = req.params.groupid;
    console.log('Group ID:', groupid);
    
    const foundGroup = await group.findOne({ _id: new ObjectId(groupid) });
    
    if (!foundGroup) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    const groups = foundGroup.posts;
    console.log('Groups (post IDs):', groups);
    
    if (!Array.isArray(groups)) {
      return res.status(400).json({
        message: 'Group posts is not an array',
        actualType: typeof groups,
        value: groups
      });
    }
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    

    
    const resposts = await Promise.all(
        groups.map(async (postId) => {
            try {
                const docs = await Post.find({
                    _id: new ObjectId(postId),
                    createdAt: { $gte: sevenDaysAgo }
                })
                .sort({ createdAt: -1 })
                .lean();

                // For each post, populate the username from User collection
                const postsWithUser = await Promise.all(
                    docs.map(async (post) => {
                        const user = await User.findById(post.userId).select('_id username avatar_link').lean();
                        return {
                            ...post,
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

                return postsWithUser;
            } catch (error) {
                console.error(`Error processing post ${postId}:`, error);
                return [];
            }
        })
    );
    
  
    
    // Flatten array
    const flattenedPosts = resposts.flat();

    
    return res.status(200).json({ posts: flattenedPosts });
    
  } catch (error) {
    console.error('Main error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const renderPostsFromGroups = async (req, res) => {
    try {
        const { groupIds } = req.body;
        if (!Array.isArray(groupIds) || groupIds.length === 0) {
            return res.status(400).json({ message: 'groupIds must be a non-empty array' });
        }

        const result = [];

        for (const groupId of groupIds) {
            const foundGroup = await group.findOne({ _id: new ObjectId(groupId) });
            if (!foundGroup || !Array.isArray(foundGroup.posts)) {
                result.push({ groupId, posts: [] });
                continue;
            }

            // Get up to 5 most recent post IDs
            const postIds = foundGroup.posts.slice(-5).reverse();

            const posts = await Promise.all(
                postIds.map(async (postId) => {
                    const post = await Post.findOne({ _id: new ObjectId(postId) })
                        .sort({ createdAt: -1 })
                        .lean();
                    if (!post) return null;
                    const user = await User.findById(post.userId).select('_id username avatar_link').lean();
                    return {
                        ...post,
                        username: user ? user.username : null
                    };
                })
            );

            result.push({
                groupId,
                posts: posts.filter(Boolean)
            });
        }

        return res.status(200).json({ groups: result });
    } catch (error) {
        console.error('Error in renderPostsFromGroups:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


module.exports = {createGroup,joinGroup,renderUserGroups,renderGroup,rendergrouppost,renderPostsFromGroups}