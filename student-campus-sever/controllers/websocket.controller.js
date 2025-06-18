const WebSocket = require('ws');
const mongodbconnection = require('../DTB/mongoconnection')
const clients = new Map();
const {ObjectId} = require('mongodb');
const { now } = require('mongoose');

const onConnection = (ws, req) => {
    ws.on('message', async (data) => {
        const message = JSON.parse(data);

        if (message.type === 'init') {
            const id = message.id;
            clients.set(id, ws); // userId -> ws
            console.log(`New connection from: ${id}`);
            
            return;
        }

        if (message.type === 'friend_request') {
            const from = message.from;
            const to = message.to;

            const fromSocket = clients.get(from);
            const toSocket = clients.get(to);

            if (fromSocket?.readyState === WebSocket.OPEN) {
                console.log(`${from} is online`);
            }
            if (toSocket?.readyState === WebSocket.OPEN) {
                console.log(`${to} is online`);
                toSocket.send(JSON.stringify({
                    type: 'notification',
                    message: `Bạn có lời mời kết bạn từ ${from}`,
                    from
                }));
            const notires = await logNotifications(from,to,message.type)
            if(notires.message === 'Friend request already sent'){
                 fromSocket.send(JSON.stringify({
                    type: 'notification',
                    message:'Friend request already sent'
                 }))
            }
            const res = await sendFriendRequest(from, to);
            console.log('notifications result: ',notires)
            console.log('Friend request result:', res);
            }else{
            const res = await sendFriendRequest(from, to);
            console.log('Friend request result:', res);
            }

            
        }
    });

    ws.on('close', () => {
        // Xóa user tương ứng ra khỏi Map
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


const logNotifications = async (from,to,type) => {
    try {
        await mongodbconnection.connect();
        const db = mongodbconnection.db('student_campus');
        
        const offline_noti = db.collection('notifications'); 
        let message ;
         switch (type) {
            case 'friend_request':
            message = 'Bạn có một lời mời kết bạn mới từ ',from;
            break;

            case 'like':
            message =  from,' đã thích bài viết của bạn.';
            break;

            case 'Comment':
            message =  from,' đã bình luận bài viết của bạn.';
            break;
            
            default:
            message = 'Thông báo mới.';
        }
        const res = await offline_noti.insertOne({
            senderId:from,
            receiverId:to,
            createAt: new Date(),
            status:'unread',
            type:type,
            context:message
        })
         return res;
    } catch (error) {
        console.error('[FriendRequest Error]', error);
        return { message: 'Internal error' };
    }
}

const sendFriendRequest = async (from, to) => {
    try {
        await mongodbconnection.connect();
        const db = mongodbconnection.db('student_campus');
        const user = db.collection('User');
        const friend = db.collection('Friend_rq');

        const fromid = new ObjectId(from);
        

        const fromUser = await user.findOne({ _id: fromid });
        if (fromUser?.friends?.includes(to)) {
            return { message: 'Already friends with this person' };
        }

        const existing = await friend.findOne({ senderId: from, receiverId: to, status: 'pending' });
        if (existing) {
            return { message: 'Friend request already sent' };
        }

        const res = await friend.insertOne({
            senderId: from,
            receiverId: to,
            status: 'pending',
            sendAt: new Date(),
            respondedAt: null,
        });

        return res;
    } catch (error) {
        console.error('[FriendRequest Error]', error);
        return { message: 'Internal error' };
    }
};



module.exports = {onConnection}