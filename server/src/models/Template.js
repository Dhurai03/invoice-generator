const mongoose = require('mongoose');

const FieldSchema = new mongoose.Schema({
  key: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, enum: ['text', 'number', 'date', 'email', 'textarea'], default: 'text' },
  placeholder: String,
  required: { type: Boolean, default: false },
  section: { type: String, enum: ['header', 'client', 'items', 'footer', 'custom'], default: 'custom' },
});

const TemplateSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  fields: [FieldSchema],
  layout: {
    // Company info defaults
    companyName: { type: String, default: '' },
    companyAddress: { type: String, default: '' },
    companyEmail: { type: String, default: '' },
    companyPhone: { type: String, default: '' },
    companyWebsite: { type: String, default: '' },
    // Styling
    primaryColor: { type: String, default: '#6366f1' },
    accentColor: { type: String, default: '#818cf8' },
    fontFamily: { type: String, default: 'Inter' },
    logoUrl: { type: String, default: '' },
  },
  // For uploaded templates
  uploadedFileUrl: { type: String, default: '' },
  uploadedFileType: { type: String, enum: ['pdf', 'image', 'html', 'custom'], default: 'custom' },
  isDefault: { type: Boolean, default: false },
  usageCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Template', TemplateSchema);
