const mongoose = require('mongoose');

const LineItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  rate: { type: Number, required: true, min: 0 },
  amount: { type: Number, required: true },
});

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Template' },
  // Company info (snapshot at time of creation)
  companyName: { type: String, default: '' },
  companyAddress: { type: String, default: '' },
  companyEmail: { type: String, default: '' },
  companyPhone: { type: String, default: '' },
  companyLogo: { type: String, default: '' },
  // Client info
  clientName: { type: String, required: true },
  clientEmail: { type: String, default: '' },
  clientAddress: { type: String, default: '' },
  clientPhone: { type: String, default: '' },
  // Invoice details
  invoiceDate: { type: Date, default: Date.now },
  dueDate: { type: Date },
  // Line items
  items: [LineItemSchema],
  // Financials
  subtotal: { type: Number, required: true },
  taxRate: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  discountRate: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  // Notes
  notes: { type: String, default: '' },
  terms: { type: String, default: '' },
  // Status
  status: { type: String, enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'], default: 'draft' },
  // Layout snapshot for re-rendering
  layoutSnapshot: { type: Object, default: {} },
}, { timestamps: true });

// Auto-generate invoice number
InvoiceSchema.pre('validate', async function (next) {
  if (!this.invoiceNumber) {
    const count = await mongoose.model('Invoice').countDocuments();
    this.invoiceNumber = `INV-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Invoice', InvoiceSchema);
