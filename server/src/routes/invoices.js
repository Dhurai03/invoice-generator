const express = require('express');
const router = express.Router();
const {
  getInvoices,
  getStats,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  updateInvoiceStatus,
  deleteInvoice,
} = require('../controllers/invoiceController');

router.get('/stats', getStats);
router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
router.post('/', createInvoice);
router.put('/:id', updateInvoice);
router.patch('/:id/status', updateInvoiceStatus);
router.delete('/:id', deleteInvoice);

module.exports = router;
