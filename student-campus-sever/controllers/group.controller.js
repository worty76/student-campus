
const group = require('../schemas/group.model')
const User = require('../schemas/user.model');
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



module.exports = {createGroup,joinGroup,renderUserGroups,renderGroup}