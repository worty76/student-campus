const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subject: { type: String, required: true },
    lecturer: { type: String, required: true },
    faculty: { type: String, required: true },
    academicYear: { type: String, required: true },
    file: {
        url: { type: String, required: true },
        name: { type: String, required: true },     
        type: { type: String, required: true },      // đổi mimetype thành type
        size: { type: Number, required: true },      // thêm size
       
    },
    downloads: { type: Number, default: 0 },
    uploadedBy: { type: String, ref: 'User', required: true },
});

documentSchema.virtual('isHot').get(function() {
    return this.downloads >= 100;
});

module.exports = mongoose.model('Document', documentSchema);
