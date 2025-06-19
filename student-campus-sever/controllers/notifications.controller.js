const notifications = require('../schemas/notification.model')


 const getUserNotifications = async (req ,res) => {
    const {id} = req.params;
    try {
        const res =  await notifications.find({})
    } catch (error) {
        
    }

 }