const notifications = require('../schemas/notification.model')


 const getUserNotifications = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await notifications.find({ receiverId: id , status: 'unread'}).sort({ createAt: -1 }); 

        if (!result || result.length === 0) {
            return res.status(404).json({ message: 'Không có thông báo nào.' });
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error('[Get Notifications Error]', error);
        return res.status(500).json({ message: 'Lỗi máy chủ khi lấy thông báo.' });
    }
};


module.exports = {getUserNotifications}