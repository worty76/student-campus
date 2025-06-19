const mongoose =  require('mongoose')
const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');
const client = require('../DTB/mongoconnection')
const { ObjectId } = require("mongodb");
const JWT_SECRET = process.env.JWT_SECRET_KEY; 
const cloudinary = require('../utils/cloudiary');
const fs = require('fs');
const User = require('../schemas/user.model');
const friend_request = require('../schemas/friend_rq.model')


const createAccount = async (req, res) => {
      const { items } = req.body;
      console.log(items)
      const email = items.email;
      const username = items.username;
      const password = items.password;
      const faculty = items.faculty;
      const major = items.major;
      const year = items.year;

      try { 
             

   
            const existinggmail = await User.findOne({ email: email });

            if (existinggmail) {
                  return res.status(409).json({ message: 'Email already exists' });
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
                    Year:year,
                    avatar_link: '',
                    
            })

            await result.save();

            if (result) {
                  return res.status(201).json({ message: 'Account created successfully', userId: result.insertedId });
            } else {
                  return res.status(500).json({ message: 'Failed to create account' });
            }
      } catch (error) {
            console.log(error)
            return res.status(500).json({ message: 'Server error', error: error.message });
      } 
};


const LoginRequest = async (req, res) => {
      const { items } = req.body;
      const email = items.email;
      const password = items.password;
      console.log(items)

      try {
            // await client.connect();
            // const db = client.db("student_campus");
            // const doc = db.collection("User");

            // Find user by email using MongoDB
            const foundUser = await User.findOne({ email: email });
            if (!foundUser) {
                  console.log('Invalid email or password')
                  return res.status(401).json({ message: 'Invalid email or password' });
            }

            // Compare password
            const isMatch = await bcrypt.compare(password, foundUser.password);
            if (!isMatch) {
                  console.log('not match')
                  return res.status(401).json({ message: 'Invalid email or password' });
            }

            // Generate JWT token
            const token = jwt.sign(
                  { userId: foundUser._id, email: foundUser.email },
                  JWT_SECRET,
                  { expiresIn: '72h' }
            );
            
            const logindata = {
                  token:token,
                  user: {
                        _id: foundUser._id,
                        username: foundUser.username,
                        email: foundUser.email,
                        Faculty: foundUser.Faculty,
                        Major: foundUser.Major,
                        Year: foundUser.Year,
                        interest: foundUser.interest,
                        createtime: foundUser.createtime,
                        avatar_link: foundUser.avatarLink
                  }
            }

            return res.status(200).json({ message: 'Login successful', logindata });
      } catch (error) {
            return res.status(500).json({ message: 'Server error', error: error.message });
      }
}

const getUserData = async (req, res) => {
    
      const { id } = req.params;
      console.log(id)
      try {
         
           const findid = new ObjectId(id); 
           const user = await User.findOne({ _id: findid });

            if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
            }
           const resUser = {
            username: user.username,
            Year: user.Year,
            Major: user.Major,
            Faculty: user.Faculty,
            email: user.email,
            avatar_link: user.avatar_link

           }
           console.log(user.avatarLink)
           res.status(200).json({ success: true, resUser });
      } catch (error) {
            console.error("Error getting user data:", error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
      }
}



const editUserInfo = async (req, res) => {
  console.log('--- [DEBUG] Bắt đầu xử lý editUserInfo ---');
  console.log('[DEBUG] req.body:', req.body);
  let info;

  try {
    info = JSON.parse(req.body.info);
  } catch (e) {
    return res.status(400).json({ success: false, message: 'Dữ liệu info không hợp lệ' });
  }

  const { id, username, email, Faculty, Major, Year, interest } = info;
  
  // Validate id trước khi tạo ObjectId
  if (!id || !ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'ID người dùng không hợp lệ' });
  }
 
  let avatarLink = null;

  if (req.file) {
    console.log('[DEBUG] Có file được gửi:', req.file);
    try {
      console.log('[DEBUG] Bắt đầu upload Cloudinary:', req.file.path);
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: 'auto',
      });
      console.debug('[DEBUG] Kết quả Cloudinary upload:', result);

      avatarLink = result.secure_url;
      fs.unlinkSync(req.file.path);
      console.log('[DEBUG] Đã xóa file tạm thành công:', req.file.path);
    } catch (error) {
      console.error('[ERROR] Lỗi upload Cloudinary:', error);
      return res.status(500).json({ success: false, message: 'Lỗi upload ảnh' });
    }
  } else {
    console.log('[DEBUG] Không có file được gửi.');
  }

  try {
    await client.connect();
    console.log('[DEBUG] Kết nối DB thành công');

    const db = client.db("student_campus");
    const doc = db.collection("User");

    const updateId = new ObjectId(id);
    console.log('[DEBUG] Đang update user với _id:', updateId);

    const updateFields = {
      username: username,
      email: email,
      Faculty: Faculty,
      Major: Major,
      Year: Year,
      interest: interest || []
    };

    if (avatarLink) {
      updateFields.avatar_link = avatarLink;
    }

    console.log('[DEBUG] Các trường sẽ được update:', updateFields);

   
    const result = await User.findOneAndUpdate(
      { _id: updateId }, 
      { $set: updateFields },
      { returnDocument: 'after' }
    );

    if (result) { // ✅ Kiểm tra cả result và result.value
      console.log('[DEBUG] Update thành công:');
      res.status(200).json({ 
        success: true, 
        message: 'Cập nhật thành công', 
        user: result
      });
    } else {
      console.warn('[WARN] Không tìm thấy người dùng cần cập nhật với ID:', id);
      res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

  } catch (error) {
    console.error('[ERROR] Lỗi trong quá trình cập nhật:', error);

    if (error.code === 11000) {
      const dupField = Object.keys(error.keyPattern)[0];
      console.error('[ERROR] Lỗi trùng lặp:', dupField);
      return res.status(409).json({ 
        success: false, 
        message: `${dupField} đã tồn tại.` 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Lỗi máy chủ khi cập nhật người dùng' 
    });
  } finally {
    // ✅ Thêm: Đóng connection sau khi xử lý xong
    await client.close();
    console.log('[DEBUG] Đã đóng kết nối DB');
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
            { Year: foundUser.Year }
          ]
        }
      },
      { $sample: { size: 10 } }, // lấy nhiều hơn để có thể lọc sau
      {
        $project: {
          _id: 1,
          username: 1,
          Faculty: 1,
          Major: 1,
          Year: 1
        }
      }
    ]);

    const resultNotInFriendRq = [];

    for (const user of alluser) {
      const existingFr = await friend_request.findOne({
        $or: [
          { senderId: id, receiverId: user._id },
          { senderId: user._id, receiverId: id }
        ]
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
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).select('_id username Faculty Major Year').limit(10);

    // Với mỗi user tìm được, kiểm tra trạng thái friend_request
    const resultsWithType = await Promise.all(
      results.map(async (user) => {
        // DEBUG: Kiểm tra collection và tất cả dữ liệu
        console.log('Collection name:', friend_request.collection.name);
        
        // DEBUG: Lấy tất cả friend requests trong collection
        const allFriendRequests = await friend_request.find({}).limit(5);
        console.log('All friend requests in collection (first 5):', allFriendRequests);
        
        // DEBUG: Đếm tổng số documents
        const count = await friend_request.countDocuments({});
        console.log('Total friend requests count:', count);
        
        // DEBUG: In ra thông tin để kiểm tra
        console.log('Current userId:', userId.toString());
        console.log('Target user._id:', user._id.toString());
        
      
        const existingFr = await friend_request.findOne({
          // type: 'friend_request', // BỎ dòng này
          $or: [
            { 
              senderId: new mongoose.Types.ObjectId(userId), 
              receiverId: new mongoose.Types.ObjectId(user._id) 
            },
            { 
              senderId: new mongoose.Types.ObjectId(user._id), 
              receiverId: new mongoose.Types.ObjectId(userId) 
            }
          ]
        });
        
        console.log(`Friend request between ${userId} and ${user._id}:`, existingFr);

        let type = null;
        let rqid = null;
        rqid =  existingFr._id
        if (existingFr) {
          if (userId.equals(existingFr.senderId)) {
            type = 'sender';
          } else if (userId.equals(existingFr.receiverId)) {
            type = 'receiver';
          }
        } else {
          console.log('No friend request found');
        }

        return {
          ...user.toObject(),
          type,
          rqid
          
          
        };
      })
    );
    
    return res.status(200).json({ results: resultsWithType });
  } catch (error) {
    console.error("SearchFriend error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};




module.exports = {createAccount,LoginRequest,getUserData,editUserInfo ,renderFriendyouKnow,SearchFriend}
