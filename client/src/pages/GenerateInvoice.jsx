import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Download, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { invoiceAPI, templateAPI } from '../services/api';
import toast from 'react-hot-toast';
import LineItemsTable from '../components/LineItemsTable';
import InvoicePreview from '../components/InvoicePreview';
import './GenerateInvoice.css';

const defaultItem = () => ({ description: '', quantity: 1, rate: 0, amount: 0 });

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'JPY', 'SGD'];

export default function GenerateInvoice() {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const previewRef = useRef(null);

  const [template, setTemplate] = useState(null);
  const [showPreview, setShowPreview] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [form, setForm] = useState({
    companyName: '', companyAddress: '', companyEmail: '', companyPhone: '', companyLogo: '',
    clientName: '', clientEmail: '', clientAddress: '', clientPhone: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    currency: 'USD',
    taxRate: 0, discountRate: 0,
    notes: 'Thank you for your business!',
    terms: 'Payment is due within 30 days of the invoice date.',
    status: 'draft',
  });

  const [items, setItems] = useState([defaultItem()]);

  // Load template
  useEffect(() => {
    if (templateId) {
      templateAPI.getById(templateId).then((res) => {
        const t = res.data;
        setTemplate(t);
        if (t.layout) {
          setForm(prev => ({
            ...prev,
            companyName: t.layout.companyName || prev.companyName,
            companyAddress: t.layout.companyAddress || prev.companyAddress,
            companyEmail: t.layout.companyEmail || prev.companyEmail,
            companyPhone: t.layout.companyPhone || prev.companyPhone,
          }));
        }
      }).catch(() => toast.error('Could not load template'));
    }
  }, [templateId]);

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  // Computed financials
  const subtotal = items.reduce((s, item) => s + (item.amount || 0), 0);
  const discountAmount = (subtotal * (parseFloat(form.discountRate) || 0)) / 100;
  const taxAmount = ((subtotal - discountAmount) * (parseFloat(form.taxRate) || 0)) / 100;
  const total = subtotal - discountAmount + taxAmount;

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: form.currency }).format(val || 0);

  const invoicePayload = () => ({
    templateId: templateId || undefined,
    ...form,
    taxRate: parseFloat(form.taxRate) || 0,
    discountRate: parseFloat(form.discountRate) || 0,
    items,
    subtotal, discountAmount, taxAmount, total,
  });

  const handleSave = async () => {
    if (!form.clientName.trim()) return toast.error('Client name is required');
    if (items.length === 0 || items.every(i => !i.description)) return toast.error('Add at least one item');
    setSaving(true);
    try {
      const res = await invoiceAPI.create(invoicePayload());
      toast.success(`Invoice ${res.data.invoiceNumber} saved!`);
      navigate('/invoices');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDF = useCallback(async () => {
    setDownloading(true);
    try {
      // Use browser print-to-PDF
      const printContent = previewRef.current;
      if (!printContent) return;

      const printWindow = window.open('', '_blank', 'width=900,height=700');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Invoice</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
            <style>
              body { margin: 0; padding: 0; font-family: Inter, sans-serif; background: white; }
              @page { margin: 0; size: A4; }
              @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
            </style>
          </head>
          <body>${printContent.innerHTML}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
      toast.success('PDF download dialog opened!');
    } catch (err) {
      toast.error('Failed to generate PDF');
    } finally {
      setDownloading(false);
    }
  }, []);

  const previewData = {
    ...form,
    invoiceDate: form.invoiceDate ? new Date(form.invoiceDate) : undefined,
    dueDate: form.dueDate ? new Date(form.dueDate) : undefined,
    items,
    subtotal, discountAmount, taxAmount, total,
  };

  const layout = template?.layout || {};

  return (
    <div className="page-container animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {template ? `New Invoice — ${template.name}` : 'New Invoice'}
          </h1>
          <p className="page-subtitle">Fill in the details and download your invoice as PDF</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-secondary" onClick={() => setShowPreview(!showPreview)} id="toggle-preview-btn">
            {showPreview ? <><EyeOff size={15} /> Hide Preview</> : <><Eye size={15} /> Show Preview</>}
          </button>
          <button className={`btn btn-secondary ${downloading ? 'btn-loading' : ''}`} onClick={handleDownloadPDF} disabled={downloading} id="download-pdf-btn">
            {downloading ? <><span className="spinner" /> Preparing...</> : <><Download size={15} /> Download PDF</>}
          </button>
          <button className={`btn btn-primary ${saving ? 'btn-loading' : ''}`} onClick={handleSave} disabled={saving} id="save-invoice-btn">
            {saving ? <><span className="spinner" /> Saving...</> : <><Save size={15} /> Save Invoice</>}
          </button>
        </div>
      </div>

      <div className={`generate-invoice-layout ${showPreview ? 'with-preview' : ''}`}>
        {/* Form */}
        <div className="invoice-form-col">
          {/* Company */}
          <div className="section-card">
            <div className="section-title">🏢 Your Company</div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input id="inv-company-name" type="text" className="form-input" placeholder="Acme Corp" value={form.companyName} onChange={(e) => set('companyName', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input id="inv-company-email" type="email" className="form-input" placeholder="hello@company.com" value={form.companyEmail} onChange={(e) => set('companyEmail', e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input id="inv-company-phone" type="text" className="form-input" placeholder="+1 (555) 000-0000" value={form.companyPhone} onChange={(e) => set('companyPhone', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <input id="inv-company-address" type="text" className="form-input" placeholder="123 Business St, City" value={form.companyAddress} onChange={(e) => set('companyAddress', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Client */}
          <div className="section-card">
            <div className="section-title">👤 Bill To (Client)</div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Client Name *</label>
                <input id="inv-client-name" type="text" className="form-input" placeholder="John Doe / Company Ltd" value={form.clientName} onChange={(e) => set('clientName', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Client Email</label>
                <input id="inv-client-email" type="email" className="form-input" placeholder="client@email.com" value={form.clientEmail} onChange={(e) => set('clientEmail', e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input id="inv-client-phone" type="text" className="form-input" placeholder="+1 (555) 000-0000" value={form.clientPhone} onChange={(e) => set('clientPhone', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Client Address</label>
                <input id="inv-client-address" type="text" className="form-input" placeholder="456 Client Ave, City" value={form.clientAddress} onChange={(e) => set('clientAddress', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="section-card">
            <div className="section-title">📋 Invoice Details</div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Invoice Date</label>
                <input id="inv-date" type="date" className="form-input" value={form.invoiceDate} onChange={(e) => set('invoiceDate', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input id="inv-due-date" type="date" className="form-input" value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Currency</label>
                <select id="inv-currency" className="form-select" value={form.currency} onChange={(e) => set('currency', e.target.value)}>
                  {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select id="inv-status" className="form-select" value={form.status} onChange={(e) => set('status', e.target.value)}>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="section-card">
            <div className="section-title">📦 Line Items</div>
            <LineItemsTable items={items} onChange={setItems} currency={form.currency} />
          </div>

          {/* Totals & Tax */}
          <div className="section-card">
            <div className="section-title">💰 Pricing Summary</div>
            <div className="form-row mb-4">
              <div className="form-group">
                <label className="form-label">Tax Rate (%)</label>
                <input id="inv-tax-rate" type="number" className="form-input" min="0" max="100" step="0.1" value={form.taxRate} onChange={(e) => set('taxRate', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Discount (%)</label>
                <input id="inv-discount-rate" type="number" className="form-input" min="0" max="100" step="0.1" value={form.discountRate} onChange={(e) => set('discountRate', e.target.value)} />
              </div>
            </div>
            <div className="totals-summary">
              <div className="total-row">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {parseFloat(form.discountRate) > 0 && (
                <div className="total-row discount-row">
                  <span>Discount ({form.discountRate}%)</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              {parseFloat(form.taxRate) > 0 && (
                <div className="total-row">
                  <span>Tax ({form.taxRate}%)</span>
                  <span>{formatCurrency(taxAmount)}</span>
                </div>
              )}
              <div className="total-row grand-total-row">
                <span>Total Due</span>
                <span className="grand-total-value">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="section-card">
            <div className="section-title">📝 Notes & Terms</div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea id="inv-notes" className="form-textarea" placeholder="Any additional notes..." value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={3} />
              </div>
              <div className="form-group">
                <label className="form-label">Terms & Conditions</label>
                <textarea id="inv-terms" className="form-textarea" placeholder="Payment terms..." value={form.terms} onChange={(e) => set('terms', e.target.value)} rows={3} />
              </div>
            </div>
          </div>
        </div>

        {/* Preview panel */}
        {showPreview && (
          <div className="invoice-preview-panel">
            <div className="preview-panel-header">
              <span className="section-title" style={{ border: 'none', padding: 0, margin: 0 }}>
                <Eye size={15} /> Live Preview
              </span>
              <button className="btn btn-primary btn-sm" onClick={handleDownloadPDF} id="preview-download-btn">
                <Download size={13} /> PDF
              </button>
            </div>
            <div className="invoice-preview-scroll">
              <div ref={previewRef}>
                <InvoicePreview data={previewData} layout={layout} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
