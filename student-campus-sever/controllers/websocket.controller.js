const WebSocket = require('ws');
const mongoose = require('mongoose');
const mongodbconnection = require('../DTB/mongoconnection');
const clients = new Map();

const Friend_rq = require('../schemas/friend_rq.model');
const Notifications = require('../schemas/notification.model');
const User = require('../schemas/user.model'); 
const Chat = require('../schemas/chat.model')
const {acceptUserRequest,denyUserRequest}  = require('../controllers/friendrequest.controller.routes')
const {likePost,unlikePost,addcomment} = require('../controllers/post.controller')
const {getusername} = require('../controllers/user.controller');
const { default: axios } = require('axios');
const onConnection = (ws, req) => {
    ws.on('message', async (data) => {
        const message = JSON.parse(data);

        if (message.type === 'init') {
            const id = message.id;
            clients.set(id, ws);
            console.log(`New connection from: ${id}`);
            return;
        }

     
        async function getUserNameById(userId) {
            try {
                const user = await getusername(userId);
                return user || 'Ai đó';
            } catch {
                return 'Ai đó';
            }
        }

        if (message.type === 'friend_request') {
            const { from, to } = message;
            const fromSocket = clients.get(from);
            const toSocket = clients.get(to);

            const res = await sendFriendRequest(from, to);

            if (res.message === 'Friend request already sent' || res.message === 'Already friends with this person') {
                fromSocket?.send(JSON.stringify({
                    type: 'Friend_request_exist',
                    message: res.message
                }));
                return;
            }

            // Lấy username từ from
            const fromName = await getUserNameById(from);

            if (toSocket?.readyState === WebSocket.OPEN) {
                toSocket.send(JSON.stringify({
                    type: 'Friend_request',
                    message: `Bạn có lời mời kết bạn từ ${fromName}`,
                    from,
                    fromName
                }));
            }

            const notires = await logNotifications(from, to, message.type);
            console.log('notifications result:', notires);
            console.log('Friend request result:', res);
        }

        if (message.type === 'accept_request') {
            const { reqid, from, to } = message;
            const fromSocket = clients.get(from);
            const toSocket = clients.get(to);
            console.log('test:' ,from,to)
            const res = await acceptUserRequest(reqid, from, to);
            const users = [from, to];
            const createChatBetween = await CreateChatRoom(users);
            if (res === 'Friend request not found' || res === 'Missing request ID') {
                fromSocket?.send(JSON.stringify({
                    type: 'accept_404',
                    message: res
                }));
                return;
            }

            const fromName = await getUserNameById(to);

            if (toSocket?.readyState === WebSocket.OPEN) {
                toSocket.send(JSON.stringify({
                    type: 'accept_request',
                    message: `${fromName} đã chấp nhận lời mời kết bạn`,
                    from,
                    fromName
                }));
            }

            const notires = await logNotifications(from, to, message.type);
            console.log(createChatBetween)
        }

        if (message.type === 'deny_request') {
            const { reqid, from, to } = message;
            const fromSocket = clients.get(from);
            const toSocket = clients.get(to);
            const res = await denyUserRequest(reqid);

            if (res === 'Friend request not found' || res === 'Missing request ID') {
                fromSocket?.send(JSON.stringify({
                    type: 'accept_404',
                    message: res
                }));
                return;
            }

            const fromName = await getUserNameById(from);

            if (toSocket?.readyState === WebSocket.OPEN) {
                toSocket.send(JSON.stringify({
                    type: 'deny_request',
                    message: `${fromName} đã từ chối lời mời kết bạn`,
                    from,
                    fromName
                }));
            }
        }

        if (message.type === 'likes_post') {
            const { postid, from, to } = message;
            const fromSocket = clients.get(from);
            const toSocket = clients.get(to);
            const res = await likePost(postid, from);

            if (res === 'postid and userId are required' || res === 'User already liked this post or post not found') {
                fromSocket?.send(JSON.stringify({
                    type: 'accept_404',
                    message: res
                }));
                return;
            }

            const fromName = await getUserNameById(from);

            if (toSocket?.readyState === WebSocket.OPEN) {
                toSocket.send(JSON.stringify({
                    type: 'likes_post',
                    message: `${fromName} đã thích bài viết của bạn`,
                    from,
                    fromName
                }));
            }
            const notires = await logNotificationsPost(from, to, postid, message.type);
            console.log('notifications result:', notires);
        }

        if (message.type === 'unlike_post') {
            const { postid, from, to } = message;
            const fromSocket = clients.get(from);
            const toSocket = clients.get(to);
            const res = await unlikePost(postid, from);

            if (res === 'postid and userId are required' || res === 'User has not liked this post or post not found') {
                fromSocket?.send(JSON.stringify({
                    type: 'accept_404',
                    message: res
                }));
                return;
            }
        }

        if (message.type === 'Comment') {
            const { postid, from, to, context } = message;
            const fromSocket = clients.get(from);
            const toSocket = clients.get(to);
            const res = await addcomment(postid, from, context);

            if (res === 'postid and userId are required' || res === 'User has not liked this post or post not found') {
                fromSocket?.send(JSON.stringify({
                    type: 'accept_404',
                    message: res
                }));
                return;
            }

            const fromName = await getUserNameById(from);

            if (toSocket?.readyState === WebSocket.OPEN) {
                toSocket.send(JSON.stringify({
                    type: 'Comment',
                    message: `${fromName} đã bình luận về bài viết của bạn`,
                    from,
                    fromName
                }));
            }
            const notires = await logNotificationsPost(from, to, postid, message.type);
            console.log('notifications result:', notires);
        }

       if (message.type === 'online_friend') {
            const friends = message.friends;
            const from = message.from;

            if (Array.isArray(friends)) {
                // Debug: In ra để kiểm tra
                console.log('=== DEBUG ONLINE FRIENDS ===');
                console.log('friends array:', friends);
                console.log('clients keys:', Array.from(clients.keys()));
                
                // Kiểm tra clients có chứa ID nào không
                const onlineFriends = friends.filter(id => {
                    const hasId = clients.has(id);
                    const hasIdStr = clients.has(id.toString());
                    console.log(`ID ${id} - has: ${hasId}, hasStr: ${hasIdStr}`);
                    return hasId || hasIdStr;
                });
                
                console.log('onlineFriends:', onlineFriends);
                
                const fromSocket = clients.get(from);
                if (fromSocket && fromSocket.readyState === WebSocket.OPEN) {
                    const resfriends = await getuseronline(friends);
                    console.log('resfriends:', resfriends.map(u => ({ id: u._id, name: u.name || u.username })));
                    
                    const resWithOnline = resfriends.map(user => {
                        const userId = user._id.toString();
                        
                   
                        const isOnline1 = onlineFriends.includes(userId);
                        const isOnline2 = onlineFriends.includes(user._id);
                        const isOnline3 = onlineFriends.some(id => id.toString() === userId);
                        const isOnline4 = clients.has(userId);
                        const isOnline5 = clients.has(user._id);
                        
                        console.log(`User ${userId}:`, {
                            isOnline1, isOnline2, isOnline3, isOnline4, isOnline5
                        });
                        
                        return {
                            ...user.toObject(),
                            online: isOnline3 || isOnline4 || isOnline5
                        };
                    });
                    
                    console.log('Final result:', resWithOnline.map(u => ({ id: u._id, online: u.online })));
                    
                    fromSocket.send(JSON.stringify({
                        type: 'online_friend',
                        friends: resWithOnline
                    }));
                }
            } else {
                const fromSocket = clients.get(from);
                if (fromSocket && fromSocket.readyState === WebSocket.OPEN) {
                    fromSocket.send(JSON.stringify({
                        type: 'online_friend',
                        friends: []
                    }));
                }
            }
        }

        if (message.type === 'text_to') {
            const from = message.from;
            const to = message.to;
            const text = message.context;
            const chatid = message.chatid;
            
            console.log(chatid)
            const toSocket = clients.get(to);
            const savetext = await addChatMessage(chatid,from,text);
            
            const fromName = await getusername(from);
            if(savetext){
                console.log(savetext)
                const _id = savetext._id
            
                if (toSocket?.readyState === WebSocket.OPEN) {
                toSocket.send(JSON.stringify({
                    type: 'text_to',
                    message: `${fromName} `,
                    context:text,
                    from,
                    fromName,
                    _id

                }));
            }
            }
        }
       if (message.type === 'file_to') {
            console.log('Received file_to message:', message);
            const { chatid, from, to, context, file } = message;

            let parsedFiles = [];

            // Handle different file input formats
            if (typeof file === 'string') {
                try {
                    parsedFiles = JSON.parse(file);
                } catch (err) {
                    console.error("Invalid file JSON string:", err);
                    parsedFiles = [];
                }
            } else if (Array.isArray(file)) {
                parsedFiles = file;
            } else if (typeof file === 'object' && file !== null) {
                parsedFiles = [file];
            }

            // Validate file objects
            const validFiles = parsedFiles.filter(f => {
                return f && 
                    typeof f === 'object' && 
                    typeof f.name === 'string' && 
                    typeof f.type === 'string' && 
                    typeof f.url === 'string';
            });

            console.log('Processed files:', validFiles);

            const toSocket = clients.get(to);
            const savetext = await addChatMessage(chatid, from, context, validFiles);

            const fromName = await getusername(from);
            if (savetext) {
                const _id = savetext._id;

                if (toSocket?.readyState === WebSocket.OPEN) {
                    toSocket.send(JSON.stringify({
                        type: 'file_to',
                        message: `${fromName} đã gửi cho bạn một đính kèm`,
                        context,
                        from,
                        fromName,
                        _id,
                        files: validFiles // Include the files in the response
                    }));
                }
            }
        }
                    
    });

    ws.on('close', () => {
        for (const [userId, socket] of clients.entries()) {
            if (socket === ws) {
                clients.delete(userId);
                break;
            }
        }
    });

    ws.send(JSON.stringify({
        type: 'welcome',
        message: 'Connected to WebSocket Server',
        online: clients.size
    }));
};

const logNotifications = async (from, to, type) => {
    try {
        let message;
        switch (type) {
            case 'friend_request':
                message = `Bạn có một lời mời kết bạn mới từ ${from}`;
                break;
            case 'accept_request':
                message = `${from} đã chấp nhận lời mời kết bạn của bạn`;
                break;
            case 'likes_post':
                message = `${from} đã thích bài viết của bạn.`;
                break;
            case 'Comment':
                message = `${from} đã bình luận bài viết của bạn.`;
                break;
            default:
                message = 'Thông báo mới.';
        }

        if (type === 'friend_request') {
            const existingFr = await Notifications.findOne({
                type: 'friend_request',
                $or: [
                    { senderId: from, receiverId: to },
                    { senderId: to, receiverId: from }
                ]
            });

            if (existingFr) {
                return { message: 'Đã tồn tại lời mời kết bạn giữa hai người dùng' };
            }
        }

        if (type === 'accept_request') {
            const existingAccept = await Notifications.findOne({
                type: 'accept_request',
                $or: [
                    { senderId: from, receiverId: to },
                    { senderId: to, receiverId: from }
                ]
            });

            if (existingAccept) {
                return { message: 'Đã tồn tại thông báo chấp nhận kết bạn giữa hai người dùng' };
            }
        }

        const doc = new Notifications({
            senderId: from,
            receiverId: to,
            createAt: new Date(),
            status: 'unread',
            type: type,
            context: message
        });

        return await doc.save();
    } catch (error) {
        console.error('[Notification Error]', error);
        return { message: 'Internal error' };
    }
};

const logNotificationsPost = async (from, to, postid, type) => {
    try {
        let message;
        switch (type) {
            case 'friend_request':
                message = `Bạn có một lời mời kết bạn mới từ ${from}`;
                break;
            case 'accept_request':
                message = `${from} đã chấp nhận lời mời kết bạn của bạn`;
                break;
            case 'likes_post':
                message = `${from} đã thích bài viết của bạn.`;
                break;
            case 'Comment':
                message = `${from} đã bình luận bài viết của bạn.`;
                break;
            default:
                message = 'Thông báo mới.';
        }

        // Kiểm tra đã tồn tại thông báo like từ người dùng này cho bài viết này chưa
        if (type === 'likes_post') {
            const existingLike = await Notifications.findOne({
                type: 'likes_post',
                senderId: from,
                receiverId: to,
                post: postid
            });

            if (existingLike) {
                return { message: 'Đã tồn tại thông báo like từ người dùng này cho bài viết này' };
            }
        }

        if (type === 'friend_request') {
            const existingFr = await Notifications.findOne({
                type: 'friend_request',
                $or: [
                    { senderId: from, receiverId: to },
                    { senderId: to, receiverId: from }
                ]
            });

            if (existingFr) {
                return { message: 'Đã tồn tại lời mời kết bạn giữa hai người dùng' };
            }
        }

        const doc = new Notifications({
            senderId: from,
            receiverId: to,
            post: postid,
            createAt: new Date(),
            status: 'unread',
            type: type,
            context: message
        });

        return await doc.save();
    } catch (error) {
        console.error('[Notification Error]', error);
        return { message: 'Internal error' };
    }
};

const getuseronline = async (friends) => {
    try {
        
        const objectIds = friends.map(f =>
            typeof f === 'object' && f !== null ? f._id : f
        ).map(id => new mongoose.Types.ObjectId(id));
        const users = await User.find({ _id: { $in: objectIds } }, 'username avatar_link _id');
        return users;
    } catch (error) {
        console.error('[getuseronline Error]', error);
        return [];
    }
}

const sendFriendRequest = async (from, to) => {
    try {
        await mongodbconnection.connect();

        const fromId = new mongoose.Types.ObjectId(from);
        const toId = new mongoose.Types.ObjectId(to);

        const fromUser = await User.findById(fromId);
        if (!fromUser) {
            return { message: 'Sender user not found' };
        }

        if (fromUser.friends && fromUser.friends.includes(to)) {
            return { message: 'Already friends with this person' };
        }

        const existing = await Friend_rq.findOne({
            $or: [
                    { senderId: from, receiverId: to },
                    { senderId: to, receiverId: from }
                ],
            status: 'pending'
        });

        if (existing) {
            return { message: 'Friend request already sent' };
        }

        const newRequest = new Friend_rq({
            senderId: from,
            receiverId: to,
            status: 'pending',
            sendAt: new Date(),
            respondedAt: null
        });

        await newRequest.save();
        return { message: 'Friend request sent successfully' };
    } catch (error) {
        console.error('[FriendRequest Error]', error);
        return { message: 'Internal error' };
    }
};

const CreateChatRoom = async (users) => {
  try {
    if (!Array.isArray(users) || users.length < 2) {
      throw new Error('At least 2 users are required to create a chat room');
    }

    const participants = [...users]; 
    const existingChat = await Chat.findOne({
      participants: { $all: participants, $size: participants.length },
      isGroupChat: participants.length > 2
    });

    if (existingChat) {
      return existingChat;
    }

    const newChat = new Chat({
      participants: participants,
      isGroupChat: participants.length > 2,
      chatContext: [],
      lasttext: {},
      isBlock: false
    });

    await newChat.save();
    return newChat;
  } catch (error) {
    console.error('[CreateChatRoom Error]', error);
    throw error;
  }
};



const addChatMessage = async (chatid, from, text, files = null) => {
  try {
    console.log('Adding chat message:', { chatid, from, text, files });

    const message = {
      _id: new mongoose.Types.ObjectId(),
      userid: from,
      text: text || '',
      timestamp: new Date(),
    };

    let validFiles = [];

    if (files) {
      let processedFiles = [];

      if (typeof files === 'string') {
        try {
          processedFiles = JSON.parse(files);
        } catch (parseError) {
          console.error('Error parsing files string:', parseError);
        }
      } else if (Array.isArray(files)) {
        processedFiles = files;
      } else if (typeof files === 'object' && files !== null) {
        processedFiles = [files];
      }

      validFiles = processedFiles
        .filter(file => file && typeof file === 'object')
        .map(file => ({
          name: String(file.name || ''),
          type: String(file.type || ''),
          size: Number(file.size || 0),
          url: String(file.url || '')
        }))
        .filter(file => file.name && file.type && file.url);

      if (validFiles.length > 0) {
        message.files = validFiles;
      }
    }

    console.log('Final message object:', JSON.stringify(message, null, 2));

    const updatedChat = await Chat.findByIdAndUpdate(
      new mongoose.Types.ObjectId(chatid),
      {
        $push: { chatContext: message },
        $set: {
          lasttext: {
            _id: message._id,
            userid: message.userid,
            text: validFiles.length > 0 ? 'gửi cho bạn 1 tệp đính kèm' : message.text,
            timestamp: message.timestamp
          }
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedChat) {
      console.error('Chat not found with ID:', chatid);
      return null;
    }

    console.log('Message saved successfully');
    return message;
  } catch (error) {
    console.error("Error updating chat message:", error);
    if (error.name === 'CastError') {
      console.error('Cast Error Details:', {
        path: error.path,
        value: error.value,
        kind: error.kind
      });
    }
    return null;
  }
};





module.exports = { onConnection };
