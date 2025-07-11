const Document = require('../schemas/document.model');
const path = require('path');
const fs = require('fs');
const cloudiary = require('../utils/cloudiary');


const uploadDocument = async (req, res) => {
    try {
        const {userId, title, subject, lecturer, faculty, academicYear } = req.body;

        // Handle file upload
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Upload file to Cloudinary
        const result = await cloudiary.uploader.upload(req.file.path, {
            folder: 'documents',
            resource_type: 'raw',
            access_mode: 'public'
        });
        const file = {
            url: result.secure_url,
            name: path.basename(req.file.originalname),
            type: req.file.mimetype,
            size: req.file.size
        }
        
        fs.unlinkSync(req.file.path);

        const newDocument = new Document({
            title,
            subject,
            lecturer,
            faculty,
            academicYear,
            file: file,
            uploadedBy: userId,
            uploadedAt: new Date()
        });

        await newDocument.save();
        res.status(201).json({ message: 'Document uploaded successfully', document: newDocument });
    } catch (error) {
        console.error('Error uploading document:', error);
        res.status(500).json({ message: 'Error uploading document', error });
    }
}

const renderallDocuments = async (req, res) => {
    try {
        const documents = await Document.find().populate('uploadedBy', 'username _id');
        res.status(200).json(documents);
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({ message: 'Error fetching documents', error });
    }
}
const onDeleteDocuments = async (req, res) => {
    try {
        const { docid } = req.params;
        const { userId } = req.body;
        const document = await Document.findById(docid);

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        if (document.uploadedBy.toString() !== userId) {
            return res.status(404).json({ message: 'Not Uploader' });
        }

        await cloudiary.uploader.destroy(document.file.url, { resource_type: 'raw', type: 'upload', invalidate: true });
        await Document.findByIdAndDelete(docid);
        res.status(200).json({ message: 'Document deleted successfully' });
    } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({ message: 'Error deleting document', error });
    }
}


const updateDocumentDowload = async (req, res) => {
    try {
        const { documentId } = req.params;
        const document = await Document.findById(documentId);
        
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        document.downloads = (document.downloads || 0) + 1;
        await document.save();

        res.status(200).json({ message: 'Download count updated', document });
    } catch (error) {
        console.error('Error updating download count:', error);
        res.status(500).json({ message: 'Error updating download count', error });
    }
}

module.exports = { uploadDocument, renderallDocuments, updateDocumentDowload ,onDeleteDocuments};