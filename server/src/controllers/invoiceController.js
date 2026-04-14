const Invoice = require('../models/Invoice');
const Template = require('../models/Template');

// GET /api/invoices
const getInvoices = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { clientName: { $regex: search, $options: 'i' } },
        { clientEmail: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Invoice.countDocuments(query);
    const invoices = await Invoice.find(query)
      .populate('templateId', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: invoices,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/invoices/stats
const getStats = async (req, res) => {
  try {
    const total = await Invoice.countDocuments();
    const paid = await Invoice.countDocuments({ status: 'paid' });
    const pending = await Invoice.countDocuments({ status: { $in: ['draft', 'sent'] } });
    const overdue = await Invoice.countDocuments({ status: 'overdue' });

    const revenueResult = await Invoice.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    const pendingResult = await Invoice.aggregate([
      { $match: { status: { $in: ['draft', 'sent'] } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    const pendingRevenue = pendingResult[0]?.total || 0;

    res.json({ success: true, data: { total, paid, pending, overdue, totalRevenue, pendingRevenue } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/invoices/:id
const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('templateId');
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/invoices
const createInvoice = async (req, res) => {
  try {
    const {
      templateId, companyName, companyAddress, companyEmail, companyPhone, companyLogo,
      clientName, clientEmail, clientAddress, clientPhone,
      invoiceDate, dueDate, items, taxRate = 0, discountRate = 0,
      currency = 'USD', notes, terms, status = 'draft',
    } = req.body;

    if (!clientName) return res.status(400).json({ success: false, message: 'Client name is required' });
    if (!items || items.length === 0) return res.status(400).json({ success: false, message: 'At least one item is required' });

    // Calculate financials
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
    const discountAmount = (subtotal * discountRate) / 100;
    const taxAmount = ((subtotal - discountAmount) * taxRate) / 100;
    const total = subtotal - discountAmount + taxAmount;

    // Compute amounts on items
    const processedItems = items.map(item => ({
      ...item,
      amount: item.quantity * item.rate,
    }));

    // Get layout snapshot from template if provided
    let layoutSnapshot = {};
    if (templateId) {
      const template = await Template.findById(templateId);
      if (template) {
        layoutSnapshot = template.layout || {};
        await Template.findByIdAndUpdate(templateId, { $inc: { usageCount: 1 } });
      }
    }

    const invoice = await Invoice.create({
      templateId,
      companyName, companyAddress, companyEmail, companyPhone, companyLogo,
      clientName, clientEmail, clientAddress, clientPhone,
      invoiceDate, dueDate,
      items: processedItems,
      subtotal, taxRate, taxAmount, discountRate, discountAmount, total,
      currency, notes, terms, status, layoutSnapshot,
    });

    res.status(201).json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/invoices/:id
const updateInvoice = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Recalculate financials if items changed
    if (updateData.items) {
      const subtotal = updateData.items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
      const discountAmount = (subtotal * (updateData.discountRate || 0)) / 100;
      const taxAmount = ((subtotal - discountAmount) * (updateData.taxRate || 0)) / 100;
      updateData.subtotal = subtotal;
      updateData.discountAmount = discountAmount;
      updateData.taxAmount = taxAmount;
      updateData.total = subtotal - discountAmount + taxAmount;
      updateData.items = updateData.items.map(item => ({ ...item, amount: item.quantity * item.rate }));
    }

    const invoice = await Invoice.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/invoices/:id/status
const updateInvoiceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/invoices/:id
const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getInvoices, getStats, getInvoiceById, createInvoice, updateInvoice, updateInvoiceStatus, deleteInvoice };
