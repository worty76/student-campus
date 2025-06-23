const WebSocket = require('ws');
const mongoose = require('mongoose');
const mongodbconnection = require('../DTB/mongoconnection');
const clients = new Map();

const Friend_rq = require('../schemas/friend_rq.model');
const Notifications = require('../schemas/notification.model');
const User = require('../schemas/user.model'); // Đảm bảo bạn có schema này
const {acceptUserRequest,denyUserRequest}  = require('../controllers/friendrequest.controller.routes')
const onConnection = (ws, req) => {
    ws.on('message', async (data) => {
        const message = JSON.parse(data);

        if (message.type === 'init') {
            const id = message.id;
            clients.set(id, ws);
            console.log(`New connection from: ${id}`);
            return;
        }

        if (message.type === 'friend_request') {
            const { from, to } = message;
            const fromSocket = clients.get(from);
            const toSocket = clients.get(to);

            // Gọi gửi lời mời trước
            const res = await sendFriendRequest(from, to);

            // Nếu lời mời đã tồn tại
            if (res.message === 'Friend request already sent' || res.message === 'Already friends with this person') {
                fromSocket?.send(JSON.stringify({
                    type: 'Friend_request_exist',
                    message: res.message
                }));
                return;
            }

            // Nếu gửi lời mời thành công, gửi WebSocket + log thông báo
            if (toSocket?.readyState === WebSocket.OPEN) {
                toSocket.send(JSON.stringify({
                    type: 'Friend_request',
                    message: `Bạn có lời mời kết bạn từ ${from}`,
                    from
                }));
            }

            const notires = await logNotifications(from, to, message.type);
            console.log('notifications result:', notires);
            console.log('Friend request result:', res);
        }

        if (message.type === 'accept_request') {
            const { reqid, from ,to } = message;
            const fromSocket = clients.get(from);
            const toSocket = clients.get(to);
            console.log(reqid)
            // Gọi gửi lời mời trước
            const res = await acceptUserRequest(reqid,from,to);

            // Nếu lời mời đã tồn tại
            if (res === 'Friend request not found' || res  === 'Missing request ID') {
                fromSocket?.send(JSON.stringify({
                    type: 'accept_404',
                    message: res
                }));
                return;
            }

            if (toSocket?.readyState === WebSocket.OPEN) {
                toSocket.send(JSON.stringify({
                    type: 'accept_request',
                    message: `${from} đã chấp nhận lời mời kết bạn`,
                    from
                }));
            }

            const notires = await logNotifications(from, to, message.type);
            console.log('notifications result:', notires);
            console.log('Friend request result:', res);
        }

         if (message.type === 'deny_request') {
            const { reqid, from ,to } = message;
            const fromSocket = clients.get(from);
            const toSocket = clients.get(to);
            console.log(reqid)
            // Gọi gửi lời mời trước
            const res = await denyUserRequest(reqid);

            // Nếu lời mời đã tồn tại
            if (res === 'Friend request not found' || res  === 'Missing request ID') {
                fromSocket?.send(JSON.stringify({
                    type: 'accept_404',
                    message: res
                }));
                return;
            }

            if (toSocket?.readyState === WebSocket.OPEN) {
                toSocket.send(JSON.stringify({
                    type: 'deny_request',
                    message: `${from} đã chấp nhận lời mời kết bạn`,
                    from
                }));
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
            case 'like':
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

module.exports = { onConnection };
