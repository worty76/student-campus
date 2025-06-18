const mongoose =  require('mongoose')
const bcrypt = require('bcrypt');
const UserSchema = require('../schemas/user.model')
const jwt = require('jsonwebtoken');
const client = require('../DTB/mongoconnection')
const { ObjectId } = require("mongodb");
const JWT_SECRET = process.env.JWT_SECRET_KEY; 
const cloudinary = require('../utils/cloudiary');
const fs = require('fs');

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
              await client.connect();
              const db = client.db("student_campus");
              const doc = db.collection("User");

   
            const existinggmail = await doc.findOne({ email: email });

            if (existinggmail) {
                  return res.status(409).json({ message: 'Email already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const result = await doc.insertOne({
                    username: username,
                    email: email,
                    password: hashedPassword,
                    createtime: new Date(),
                    friends: [],
                    Faculty: faculty,
                    Major: major,
                    Year: year
            })

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
            await client.connect();
            const db = client.db("student_campus");
            const doc = db.collection("User");

            // Find user by email using MongoDB
            const foundUser = await doc.findOne({ email: email });
            if (!foundUser) {
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
                        createtime: foundUser.createtime
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
          await client.connect();
           const db = client.db("student_campus");
           const doc = db.collection("User");
           const findid = new ObjectId(id); 
           const user = await doc.findOne({ _id: findid });

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

   
    const result = await doc.findOneAndUpdate(
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


module.exports = {createAccount,LoginRequest,getUserData,editUserInfo}
