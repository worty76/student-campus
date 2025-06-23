const friend_request = require('../schemas/friend_rq.model')
const User = require('../schemas/user.model');

const acceptUserRequest = async (rqid, from, to) => {
  console.log(rqid,from,to)
  try {
    if (!rqid || !from || !to) {
      return { message: "Missing required parameters" };
      
    }

    const updatedRequest = await friend_request.findByIdAndUpdate(
      rqid,
      { $set: { status: 'accepted' } },
      { new: true }
    );

    if (!updatedRequest) {
      return { message: "Friend request not found" };
    }

    // Dùng $addToSet để tránh thêm trùng
    await User.findByIdAndUpdate(
      from,
      { $addToSet: { friends: to } }
    );

    await User.findByIdAndUpdate(
      to,
      { $addToSet: { friends: from } }
    );

    return { message: "Friend request accepted", data: updatedRequest };
  } catch (error) {
    console.error("Error accepting friend request:", error);
    return { message: "Internal server error" };
  }
};


const denyUserRequest = async (rqid) => {
  try {
    if (!rqid) {
      return { success: false, message: "Missing request ID" };
    }

    const deletedRequest = await friend_request.findByIdAndDelete(rqid);

    if (!deletedRequest) {
      return { success: false, message: "Friend request not found" };
    }

    return { success: true, data: deletedRequest };
  } catch (error) {
    console.error("Error deleting friend request:", error);
    return { success: false, message: "Internal server error" };
  }
};

const getUserFriendRequest = async (req, res) => {
  const { id } = req.body;
  console.log(id)
  try {
    if (!id) {
      return res.status(400).json({ message: "Missing user ID" });
    }

    const requests = await friend_request.find({
      receiverId: id
    }).populate("senderId", "username avatar"); // nếu muốn lấy thêm thông tin người gửi
    
    const resultWithUserData = await Promise.all(
      requests.map(async (request) => {
        const sender = await User.findById(request.senderId).select("username avatar_link");
        return {
          _id: request._id,
          senderId: request.senderId,
          receiverId: request.receiverId,
          createdAt: request.createdAt,
          username: sender.username,
          avatar_link: sender.avatar_link,
          status: request.status
        };
      })
);
    return res.status(200).json({
      message: "Friend requests fetched successfully",
      data: resultWithUserData
    });
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};



module.exports = {acceptUserRequest,denyUserRequest,getUserFriendRequest}