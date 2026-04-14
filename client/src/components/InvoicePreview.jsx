import { forwardRef } from 'react';
import './InvoicePreview.css';

const InvoicePreview = forwardRef(({ data, layout = {} }, ref) => {
  const {
    companyName = 'Your Company',
    companyAddress = '123 Business St, City, State 12345',
    companyEmail = 'hello@company.com',
    companyPhone = '+1 (555) 000-0000',
    companyLogo,
    clientName = 'Client Name',
    clientEmail = '',
    clientAddress = '',
    clientPhone = '',
    invoiceNumber = 'INV-0001',
    invoiceDate,
    dueDate,
    items = [],
    subtotal = 0,
    taxRate = 0,
    taxAmount = 0,
    discountRate = 0,
    discountAmount = 0,
    total = 0,
    currency = 'USD',
    notes = '',
    terms = '',
    status = 'draft',
  } = data || {};

  const primaryColor = layout?.primaryColor || '#6366f1';
  const accentColor = layout?.accentColor || '#818cf8';
  const fontFamily = layout?.fontFamily || 'Inter';

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(val || 0);

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const statusColors = {
    draft: '#94a3b8',
    sent: '#60a5fa',
    paid: '#22c55e',
    overdue: '#ef4444',
    cancelled: '#6b7280',
  };

  return (
    <div
      ref={ref}
      className="invoice-preview"
      style={{ '--invoice-primary': primaryColor, '--invoice-accent': accentColor, fontFamily }}
      id="invoice-preview-content"
    >
      {/* Header */}
      <div className="inv-header">
        <div className="inv-company">
          {companyLogo ? (
            <img src={companyLogo} alt="Company Logo" className="inv-logo" />
          ) : (
            <div className="inv-logo-placeholder" style={{ background: primaryColor }}>
              {companyName.charAt(0)}
            </div>
          )}
          <div>
            <div className="inv-company-name">{companyName}</div>
            <div className="inv-company-details">
              {companyAddress && <div>{companyAddress}</div>}
              {companyEmail && <div>{companyEmail}</div>}
              {companyPhone && <div>{companyPhone}</div>}
            </div>
          </div>
        </div>
        <div className="inv-meta">
          <div className="inv-title">INVOICE</div>
          <div className="inv-number">#{invoiceNumber}</div>
          <div className="inv-status-badge" style={{ color: statusColors[status], borderColor: statusColors[status] + '33', background: statusColors[status] + '18' }}>
            {status.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Accent bar */}
      <div className="inv-accent-bar" style={{ background: `linear-gradient(90deg, ${primaryColor}, ${accentColor})` }} />

      {/* Bill Info */}
      <div className="inv-bill-row">
        <div className="inv-bill-section">
          <div className="inv-bill-label">BILL TO</div>
          <div className="inv-bill-name">{clientName}</div>
          {clientEmail && <div className="inv-bill-detail">{clientEmail}</div>}
          {clientAddress && <div className="inv-bill-detail">{clientAddress}</div>}
          {clientPhone && <div className="inv-bill-detail">{clientPhone}</div>}
        </div>
        <div className="inv-dates">
          <div className="inv-date-row">
            <span className="inv-date-label">Invoice Date</span>
            <span className="inv-date-value">{formatDate(invoiceDate)}</span>
          </div>
          <div className="inv-date-row">
            <span className="inv-date-label">Due Date</span>
            <span className="inv-date-value" style={{ color: dueDate && new Date(dueDate) < new Date() ? '#ef4444' : undefined }}>
              {formatDate(dueDate)}
            </span>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="inv-table">
        <thead>
          <tr style={{ background: primaryColor + '18' }}>
            <th className="inv-th inv-th-desc">Description</th>
            <th className="inv-th inv-th-center">Qty</th>
            <th className="inv-th inv-th-right">Rate</th>
            <th className="inv-th inv-th-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.length > 0 ? items.map((item, i) => (
            <tr key={i} className="inv-tr">
              <td className="inv-td">{item.description || '—'}</td>
              <td className="inv-td inv-td-center">{item.quantity}</td>
              <td className="inv-td inv-td-right">{formatCurrency(item.rate)}</td>
              <td className="inv-td inv-td-right inv-td-amount">{formatCurrency(item.amount)}</td>
            </tr>
          )) : (
            <tr className="inv-tr">
              <td className="inv-td" colSpan={4} style={{ textAlign: 'center', color: '#94a3b8' }}>No items added</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Totals */}
      <div className="inv-totals">
        <div className="inv-totals-box">
          <div className="inv-total-row">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {discountRate > 0 && (
            <div className="inv-total-row inv-discount">
              <span>Discount ({discountRate}%)</span>
              <span>-{formatCurrency(discountAmount)}</span>
            </div>
          )}
          {taxRate > 0 && (
            <div className="inv-total-row">
              <span>Tax ({taxRate}%)</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
          )}
          <div className="inv-total-row inv-grand-total" style={{ borderTopColor: primaryColor + '44' }}>
            <span>Total Due</span>
            <span style={{ color: primaryColor }}>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Notes & Terms */}
      {(notes || terms) && (
        <div className="inv-footer-notes">
          {notes && (
            <div className="inv-notes-block">
              <div className="inv-notes-title" style={{ color: primaryColor }}>Notes</div>
              <div className="inv-notes-text">{notes}</div>
            </div>
          )}
          {terms && (
            <div className="inv-notes-block">
              <div className="inv-notes-title" style={{ color: primaryColor }}>Terms & Conditions</div>
              <div className="inv-notes-text">{terms}</div>
            </div>
          )}
        </div>
      )}

      {/* Footer bar */}
      <div className="inv-bottom-bar" style={{ background: `linear-gradient(90deg, ${primaryColor}, ${accentColor})` }}>
        <span>Thank you for your business!</span>
        <span>{companyEmail}</span>
      </div>
    </div>
  );
});

InvoicePreview.displayName = 'InvoicePreview';
export default InvoicePreview;
