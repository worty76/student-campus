console.log("user.controller.js loaded");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const client = require("../DTB/mongoconnection");
const { ObjectId } = require("mongodb");
const JWT_SECRET = process.env.JWT_SECRET_KEY;
const cloudinary = require("../utils/cloudiary");
const fs = require("fs");
const User = require("../schemas/user.model");
const friend_request = require("../schemas/friend_rq.model");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "hidrabula@gmail.com",
    pass: "dgkg ruas hkqd nxmn",
  },
});

function generateSixDigitCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const setCodeAsNewPassword = async (req, res) => {
  const { email } = req.body;
  const code = generateSixDigitCode();
  if (!email || !code) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    // Hash the code to use as the new password
    const hashedPassword = await bcrypt.hash(code, 10);
    const updatedUser = await User.findOneAndUpdate(
      { email: email },
      { $set: { password: hashedPassword } },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Send email to user with the new password (code)
    await transporter.sendMail({
      from: '"Student Campus" <hidrabula@gmail.com>',
      to: email,
      subject: "Your New Password",
      text: `Your new password is: ${code}`,
      html: `<p>Your new password is: <b>${code}</b></p>`,
    });

    return res.json({
      message: "Password has been updated and sent to your email successfully",
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: "Failed to update password", details: error.message });
  }
};
const sendVerification = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Missing email" });
  }
  // Validate email domain
  const emailRegex = /^[a-zA-Z0-9._%+-]+@fpt\.edu\.vn$/i;
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ error: "Email must be from fpt.edu.vn domain" });
  }
  const code = generateSixDigitCode();
  try {
    await transporter.sendMail({
      from: '"Student Campus" <hidrabula@gmail.com>',
      to: email,
      subject: "Mã xác nhận đăng ký tài khoản",
      text: `Mã xác nhận đăng ký của bạn là: ${code}`,
      html: `<p>Mã xác nhận đăng ký của bạn là: <b>${code}</b></p>`,
    });
    return res.json({ message: "Verification code sent successfully", code });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Failed to send verification code",
      details: error.message,
    });
  }
};
const createAccount = async (req, res) => {
  const { items } = req.body;
  console.log(items);
  const email = items.email;
  const username = items.username;
  const password = items.password;
  const faculty = items.faculty;
  const major = items.major;
  const year = items.year;

  try {
    const existinggmail = await User.findOne({ email: email });

    if (existinggmail) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = new User({
      username: username,
      email: email,
      password: hashedPassword,
      createtime: new Date(),
      friends: [],
      Faculty: faculty,
      Major: major,
      Year: year,
      avatar_link: "",
    });

    await result.save();

    if (result) {
      return res.status(201).json({
        message: "Account created successfully",
        userId: result.insertedId,
      });
    } else {
      return res.status(500).json({ message: "Failed to create account" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const LoginRequest = async (req, res) => {
  const { items } = req.body;
  const email = items.email;
  const password = items.password;
  console.log(items);

  try {
    const foundUser = await User.findOne({ email: email });
    if (!foundUser) {
      console.log("Invalid email or password");
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, foundUser.password);
    if (!isMatch) {
      console.log("not match");
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: foundUser._id, email: foundUser.email },
      JWT_SECRET,
      { expiresIn: "72h" }
    );

    // friends có thể là mảng ObjectId, khi trả về JSON cần chuyển sang string
    const friends = foundUser.friends
      ? foundUser.friends.map((f) => f.toString())
      : [];

    const logindata = {
      token: token,
      user: {
        _id: foundUser._id,
        username: foundUser.username,
        email: foundUser.email,
        Faculty: foundUser.Faculty,
        Major: foundUser.Major,
        Year: foundUser.Year,
        friends: friends,
        createtime: foundUser.createtime,
        avatar_link: foundUser.avatar_link,
      },
    };

    return res.status(200).json({ message: "Login successful", logindata });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const getUserData = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  try {
    const findid = new ObjectId(id);
    const user = await User.findOne({ _id: findid });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    let friends = user.friends;

    const reswithFriendName = await Promise.all(
      friends.map(async (fr) => {
        const user = await User.findOne({ _id: fr }, "username avatar_link");
        return user; // Trả về kết quả
      })
    );
    const resUser = {
      username: user.username,
      Year: user.Year,
      Major: user.Major,
      Faculty: user.Faculty,
      friends: reswithFriendName,
      email: user.email,
      avatar_link: user.avatar_link,
      profilePrivacy: user.profilePrivacy,
      messagePrivacy: user.messagePrivacy,
      notifcationSettings: user.notifcationSettings,
      isPremium: user.isPremium,
    };

    res.status(200).json({ success: true, resUser });
  } catch (error) {
    console.error("Error getting user data:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getusername = async (from) => {
  if (!from) {
    console.debug('[getusername] No "from" parameter provided.');
    return null;
  }
  if (!mongoose.Types.ObjectId.isValid(from)) {
    console.error("[getusername] Invalid ObjectId:", from);
    return null;
  }
  console.debug("[getusername] Looking up user by id:", from);
  try {
    const user = await User.findById(from).select("username");
    if (user) {
      console.debug("[getusername] Found user:", user.username);
      return user.username;
    } else {
      console.warn("[getusername] No user found for id:", from);
      return null;
    }
  } catch (error) {
    console.error("[getusername] Error in getusername:", error);
    return null;
  }
};

const editUserInfo = async (req, res) => {
  console.log("--- [DEBUG] Bắt đầu xử lý editUserInfo ---");
  console.log("[DEBUG] req.body:", req.body);
  let info;

  try {
    info = JSON.parse(req.body.info);
  } catch (e) {
    return res
      .status(400)
      .json({ success: false, message: "Dữ liệu info không hợp lệ" });
  }

  const { id, username, email, Faculty, Major, Year, interest } = info;

  // Validate id trước khi tạo ObjectId
  if (!id || !ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ success: false, message: "ID người dùng không hợp lệ" });
  }

  let avatarLink = null;

  if (req.file) {
    console.log("[DEBUG] Có file được gửi:", req.file);
    try {
      console.log("[DEBUG] Bắt đầu upload Cloudinary:", req.file.path);
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "auto",
      });
      console.debug("[DEBUG] Kết quả Cloudinary upload:", result);

      avatarLink = result.secure_url;
      fs.unlinkSync(req.file.path);
      console.log("[DEBUG] Đã xóa file tạm thành công:", req.file.path);
    } catch (error) {
      console.error("[ERROR] Lỗi upload Cloudinary:", error);
      return res
        .status(500)
        .json({ success: false, message: "Lỗi upload ảnh" });
    }
  } else {
    console.log("[DEBUG] Không có file được gửi.");
  }

  try {
    await client.connect();
    console.log("[DEBUG] Kết nối DB thành công");

    const db = client.db("student_campus");
    const doc = db.collection("User");

    const updateId = new ObjectId(id);
    console.log("[DEBUG] Đang update user với _id:", updateId);

    const updateFields = {
      username: username,
      email: email,
      Faculty: Faculty,
      Major: Major,
      Year: Year,
      interest: interest || [],
    };

    if (avatarLink) {
      updateFields.avatar_link = avatarLink;
    }

    console.log("[DEBUG] Các trường sẽ được update:", updateFields);

    const result = await User.findOneAndUpdate(
      { _id: updateId },
      { $set: updateFields },
      { returnDocument: "after" }
    );

    if (result) {
      // ✅ Kiểm tra cả result và result.value
      console.log("[DEBUG] Update thành công:");
      res.status(200).json({
        success: true,
        message: "Cập nhật thành công",
        user: result,
      });
    } else {
      console.warn("[WARN] Không tìm thấy người dùng cần cập nhật với ID:", id);
      res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng" });
    }
  } catch (error) {
    console.error("[ERROR] Lỗi trong quá trình cập nhật:", error);

    if (error.code === 11000) {
      const dupField = Object.keys(error.keyPattern)[0];
      console.error("[ERROR] Lỗi trùng lặp:", dupField);
      return res.status(409).json({
        success: false,
        message: `${dupField} đã tồn tại.`,
      });
    }

    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi cập nhật người dùng",
    });
  } finally {
    // ✅ Thêm: Đóng connection sau khi xử lý xong
    await client.close();
    console.log("[DEBUG] Đã đóng kết nối DB");
  }
};

const renderFriendyouKnow = async (req, res) => {
  const { id } = req.params;
  console.log("User ID:", id);

  try {
    const foundUser = await User.findById(id);
    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const alluser = await User.aggregate([
      {
        $match: {
          _id: { $ne: foundUser._id },
          $or: [
            { Faculty: foundUser.Faculty },
            { Major: foundUser.Major },
            { Year: foundUser.Year },
          ],
        },
      },
      { $sample: { size: 10 } },
      {
        $project: {
          _id: 1,
          username: 1,
          Faculty: 1,
          Major: 1,
          Year: 1,
        },
      },
    ]);

    const resultNotInFriendRq = [];

    for (const user of alluser) {
      // Kiểm tra đã là bạn bè chưa
      const isFriend = foundUser.friends.some(
        (friendId) => friendId.toString() === user._id.toString()
      );
      if (isFriend) continue;

      // Kiểm tra đã có friend request chưa
      const existingFr = await friend_request.findOne({
        $or: [
          { senderId: id, receiverId: user._id },
          { senderId: user._id, receiverId: id },
        ],
      });

      if (!existingFr) {
        resultNotInFriendRq.push(user);
      }
    }

    // Trả về tối đa 3 người đã lọc
    const finalSuggestions = resultNotInFriendRq.slice(0, 3);

    return res.status(200).json({ suggestions: finalSuggestions });
  } catch (error) {
    console.error("Error rendering friends you may know:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const SearchFriend = async (req, res) => {
  const { query, id } = req.body;
  console.log("Searching by:", id);

  try {
    if (!query) {
      return res.status(400).json({ message: "Missing search query" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const userId = new mongoose.Types.ObjectId(id);

    // Tìm người dùng khác khớp từ khóa
    const results = await User.find({
      _id: { $ne: userId },
      $or: [
        { username: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    })
      .select("_id username Faculty Major Year")
      .limit(10);

    // Với mỗi user tìm được, kiểm tra trạng thái friend_request
    const resultsWithType = await Promise.all(
      results.map(async (user) => {
        // DEBUG: Kiểm tra collection và tất cả dữ liệu
        console.log("Collection name:", friend_request.collection.name);

        // DEBUG: Lấy tất cả friend requests trong collection
        const allFriendRequests = await friend_request.find({}).limit(5);
        console.log(
          "All friend requests in collection (first 5):",
          allFriendRequests
        );

        // DEBUG: Đếm tổng số documents
        const count = await friend_request.countDocuments({});
        console.log("Total friend requests count:", count);

        // DEBUG: In ra thông tin để kiểm tra
        console.log("Current userId:", userId.toString());
        console.log("Target user._id:", user._id.toString());

        const existingFr = await friend_request.findOne({
          // type: 'friend_request', // BỎ dòng này
          $or: [
            {
              senderId: new mongoose.Types.ObjectId(userId),
              receiverId: new mongoose.Types.ObjectId(user._id),
            },
            {
              senderId: new mongoose.Types.ObjectId(user._id),
              receiverId: new mongoose.Types.ObjectId(userId),
            },
          ],
        });

        console.log(
          `Friend request between ${userId} and ${user._id}:`,
          existingFr
        );

        let type = null;
        let rqid = null;
        let status = null;
        if (existingFr) {
          rqid = existingFr._id;
          status = existingFr.status; // Lấy trạng thái từ friend_request
          if (userId.equals(existingFr.senderId)) {
            type = "sender";
          } else if (userId.equals(existingFr.receiverId)) {
            type = "receiver";
          }
        }

        return {
          ...user.toObject(),
          type,
          rqid,
          status,
        };
      })
    );

    return res.status(200).json({ results: resultsWithType });
  } catch (error) {
    console.error("SearchFriend error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const updatePassword = async (req, res) => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid user ID" });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Kiểm tra mật khẩu cũ
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Old password is incorrect" });
    }

    // Cập nhật mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

const updatePrivacySettings = async (req, res) => {
  const { id } = req.params;
  const { profileVisibility, messagePermission, notifications } = req.body;
  console.log("Updating privacy settings for user ID:", id);
  console.log("New settings:", {
    profileVisibility,
    messagePermission,
    notifications,
  });
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid user ID" });
  }

  const updateFields = {};
  if (profileVisibility !== undefined)
    updateFields.profilePrivacy = profileVisibility;
  if (messagePermission !== undefined)
    updateFields.messagePrivacy = messagePermission;
  if (notifications !== undefined)
    updateFields.notifcationSettings = notifications;

  if (Object.keys(updateFields).length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "No privacy settings provided" });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    ).select("profilePrivacy messagePrivacy notifcationSettings");

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Privacy settings updated",
      settings: updatedUser,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = {
  createAccount,
  LoginRequest,
  getUserData,
  editUserInfo,
  renderFriendyouKnow,
  SearchFriend,
  getusername,
  updatePrivacySettings,
  updatePassword,
  setCodeAsNewPassword,
  sendVerification,
};
