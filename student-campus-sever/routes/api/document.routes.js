const express = require('express');
const router = express.Router();

const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Temporary storage for uploaded files
const { uploadDocument ,renderallDocuments,updateDocumentDowload} = require('../../controllers/document.model');
const {authenticateToken} = require('../../utils/auth')
const { onDeleteDocuments } = require('../../controllers/document.model');
router.post('/upload/document',authenticateToken, upload.single('file'), uploadDocument);
router.get('/get/documents', authenticateToken, renderallDocuments);
router.put('/update/document/:documentId', authenticateToken, updateDocumentDowload);
router.delete('/delete/doc/:docid', authenticateToken, onDeleteDocuments);

module.exports = router;