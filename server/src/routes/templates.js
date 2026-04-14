const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  getTemplates,
  getTemplateById,
  uploadTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} = require('../controllers/templateController');

router.get('/', getTemplates);
router.get('/:id', getTemplateById);
router.post('/upload', upload.single('file'), uploadTemplate);
router.post('/', createTemplate);
router.put('/:id', updateTemplate);
router.delete('/:id', deleteTemplate);

module.exports = router;
