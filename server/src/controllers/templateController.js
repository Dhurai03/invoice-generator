const Template = require('../models/Template');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');
const fs = require('fs');
const path = require('path');

// GET /api/templates
const getTemplates = async (req, res) => {
  try {
    const templates = await Template.find().sort({ createdAt: -1 });
    res.json({ success: true, data: templates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/templates/:id
const getTemplateById = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) return res.status(404).json({ success: false, message: 'Template not found' });
    res.json({ success: true, data: template });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/templates/upload
const uploadTemplate = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const { name, description } = req.body;
    const mimeType = req.file.mimetype;
    let fileType = 'image';
    if (mimeType === 'application/pdf') fileType = 'pdf';
    else if (mimeType === 'text/html') fileType = 'html';

    // Check if Cloudinary is configured
    const isCloudinaryConfigured = process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_KEY !== 'YOUR_API_KEY';

    let secure_url = '';

    if (isCloudinaryConfigured) {
      // Upload to Cloudinary
      const result = await uploadToCloudinary(req.file.buffer, {
        folder: 'invoice-generator/templates',
        resource_type: fileType === 'pdf' ? 'raw' : 'image',
      });
      secure_url = result.secure_url;
    } else {
      // Local fallback
      const uploadDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const fileName = `${Date.now()}-${req.file.originalname}`;
      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, req.file.buffer);
      // Construct local URL
      secure_url = `${process.env.PORT ? `http://localhost:${process.env.PORT}` : 'http://localhost:5000'}/uploads/${fileName}`;
    }

    // Extract placeholders if HTML template
    let fields = [];
    if (fileType === 'html') {
      const content = req.file.buffer.toString('utf-8');
      const regex = /\{\{(\w+)\}\}/g;
      const matches = [...content.matchAll(regex)];
      const uniqueKeys = [...new Set(matches.map(m => m[1]))];
      fields = uniqueKeys.map(key => ({
        key,
        label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        type: key.includes('date') ? 'date' : key.includes('email') ? 'email' : 'text',
        section: 'custom',
      }));
    }

    const template = await Template.create({
      name: name || req.file.originalname.replace(/\.[^/.]+$/, ''),
      description,
      fields,
      uploadedFileUrl: secure_url,
      uploadedFileType: fileType,
    });

    res.status(201).json({ success: true, data: template });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/templates (create from builder)
const createTemplate = async (req, res) => {
  try {
    const { name, description, fields, layout } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Template name is required' });

    const template = await Template.create({ name, description, fields, layout });
    res.status(201).json({ success: true, data: template });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/templates/:id
const updateTemplate = async (req, res) => {
  try {
    const template = await Template.findByIdAndUpdate(
      req.params.id,
  