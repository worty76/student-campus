const notifications = require('../schemas/notification.model')


 const getUserNotifications = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await notifications
            .find({ receiverId: id })
            .sort({ createAt: -1 })
            .populate('senderId', 'username avatar_link _id');

        if (!result || result.length === 0) {
            return res.status(404).json({ message: 'Không có thông báo nào.' });
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error('[Get Notifications Error]', error);
        return res.status(500).json({ message: 'Lỗi máy chủ khi lấy thông báo.' });
    }
};
const countUnreadNotifications = async (req, res) => {
    const { id } = req.params;

    try {
        const count = await notifications.countDocuments({ receiverId: id, status: 'unread' });
        return res.status(200).json({ unreadCount: count });
    } catch (error) {
        console.error('[Count Unread Notifications Error]', error);
        return res.status(500).json({ message: 'Lỗi máy chủ khi đếm thông báo chưa đọc.' });
    }
};

const markNotificationAsRead = async (req, res) => {
    const { notificationId } = req.params;

    try {
        const updatedNotification = await notifications.findByIdAndUpdate(
            notificationId,
            { status: 'read' },
            { new: true }
        );

        if (!updatedNotification) {
            return res.status(404).json({ message: 'Notification not found.' });
        }

        return res.status(200).json({ message: 'Notification marked as read.', notification: updatedNotification });
    } catch (error) {
        console.error('[Mark Notification As Read Error]', error);
        return res.status(500).json({ message: 'Server error while updating notification.' });
    }
};


const markAllNotificationsAsRead = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await notifications.update(
            { receiverId: id, status: 'unread' },
            { $set: { status: 'read' } },
            { multi: true }
        );
        if (result.nModified === 0) {
            return res.status(404).json({ message: 'Không có thông báo nào để đánh dấu là đã đọc.' });
        }
        return res.status(200).json({ message: 'Tất cả thông báo đã được đánh dấu là đã đọc.' });
    } catch (error) {
        console.error('[Mark All Notifications As Read Error]', error);
        return res.status(500).json({ message: 'Lỗi máy chủ khi đánh dấu tất cả thông báo là đã đọc.' });
    }
};


// const getAllUserNotifications = async (req, res) => {
//     const { id } = req.params;
//     try {
//         const result = await notifications.find({ receiverId: id }).sort({ createAt: -1 });

//         if (!result || result.length === 0) {
//             return res.status(404).json({ message: 'Không có thông báo nào.' });
//         }

//         return res.status(200).json(result);
//     } catch (error) {
//         console.error('[Get All Notifications Error]', error);
//         return res.status(500).json({ message: 'Lỗi máy chủ khi lấy tất cả thông báo.' });
//     }
// };
module.exports = {getUserNotifications,markNotificationAsRead,markAllNotificationsAsRead,countUnreadNotifications}