const Chat = require('../schemas/chat.model')
const User = require('../schemas/user.model')
const cloudiary = require('../utils/cloudiary')
const multer = require('multer');
const fs = require('fs')

const renderUserChat = async (req, res) => {
    try {
        const { userId } = req.params;
        console.log("Fetching chats for user:", userId);

        // Validate userId
        if (!userId) {
            return res.status(400).json({ error: "Missing userId parameter" });
        }

        // Fetch chats where user is a participant
        const chats = await Chat.find({ participants: userId })
            .populate({
                path: 'participants',
                select: 'username avatar_link'
            });

        const result = chats.map(chat => {
            const otherParticipants = chat.participants.filter(
                participant => participant._id !== userId
            );
            
            return {
                ...chat.toObject(),
                participants: otherParticipants
            };
        });
        console.log(result)
        res.status(200).json(result);
    } catch (error) {
        console.error("Error fetching user chats:", error);
        res.status(500).json({ error: error.message });
    }
}

const uploadChatFile = async (req, res) => {
  try {
    const filePath = req.file.path;

    const result = await cloudiary.uploader.upload(filePath, {
      folder: 'chats',
      resource_type: 'raw',  
      type: 'upload'             
    });

    const fileInfo = {
      url: result.secure_url,
      type: req.file.mimetype,
      name: req.file.originalname,
      size: req.file.size
    };

    fs.unlinkSync(filePath); 

    res.json({ file: fileInfo }); 

  } catch (err) {
    console.error('Cloudinary upload error:', err);
    res.status(500).json({ error: 'Không thể upload file' });
  }
};

const createNewChat = async () =>{

    try {
        const userIDs = req.body
        
    } catch (error) {
        
    }
}


module.exports = {renderUserChat,uploadChatFile}