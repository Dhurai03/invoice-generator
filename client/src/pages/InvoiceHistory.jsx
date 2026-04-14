import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Trash2, Download, Plus, Search, Filter, Eye } from 'lucide-react';
import { useInvoice } from '../context/InvoiceContext';
import { invoiceAPI } from '../services/api';
import InvoicePreview from '../components/InvoicePreview';
import toast from 'react-hot-toast';
import './InvoiceHistory.css';

const STATUS_OPTIONS = ['all', 'draft', 'sent', 'paid', 'overdue', 'cancelled'];

const statusClass = { draft: 'badge-default', sent: 'badge-info', paid: 'badge-success', overdue: 'badge-danger', cancelled: 'badge-default' };

export default function InvoiceHistory() {
  const { invoices, fetchInvoices, loading, setInvoices } = useInvoice();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => { fetchInvoices({ limit: 50 }); }, []);

  const filtered = invoices.filter(inv => {
    const matchSearch = !search ||
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(search.toLowerCase()) ||
      (inv.clientEmail || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const formatCurrency = (val, currency = 'USD') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(val || 0);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  const handleDelete = async (id, num) => {
    if (!confirm(`Delete invoice "${num}"?`)) return;
    try {
      await invoiceAPI.delete(id);
      setInvoices(prev => prev.filter(i => i._id !== id));
      if (selectedInvoice?._id === id) setSelectedInvoice(null);
      toast.success('Invoice deleted');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const res = await invoiceAPI.updateStatus(id, status);
      setInvoices(prev => prev.map(i => i._id === id ? res.data : i));
      if (selectedInvoice?._id === id) setSelectedInvoice(res.data);
      toast.success(`Status updated to ${status}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDownload = (invoice) => {
    setSelectedInvoice(invoice);
    setTimeout(() => {
      const printWindow = window.open('', '_blank', 'width=900,height=700');
      const el = document.getElementById('history-invoice-preview');
      printWindow.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${invoice.invoiceNumber}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
        <style>body{margin:0;padding:0;font-family:Inter,sans-serif;background:white;}@page{margin:0;size:A4;}@media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact;}}</style>
        </head><body>${el?.innerHTML || ''}</body></html>`);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => { printWindow.print(); printWindow.close(); }, 600);
    }, 300);
  };

  return (
    <div className="page-container animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Invoice History</h1>
          <p className="page-subtitle">{invoices.length} invoice{invoices.length !== 1 ? 's' : ''} total</p>
        </div>
        <Link to="/invoices/new" className="btn btn-primary" id="new-invoice-btn">
          <Plus size={15} /> New Invoice
        </Link>
      </div>

      {/* Filters */}
      <div className="history-filters">
        <div className="history-search-bar">
          <Search size={14} />
          <input id="invoice-search" type="text" placeholder="Search by number, client..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="status-filter-tabs">
          <Filter size={14} className="filter-icon" />
          {STATUS_OPTIONS.map(s => (
            <button key={s} className={`status-filter-btn ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)} id={`filter-${s}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className={`history-layout ${selectedInvoice ? 'with-detail' : ''}`}>
        {/* Table */}
        <div className="history-table-wrapper section-card" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-screen"><div className="spinner spinner-lg" /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><FileText size={28} /></div>
              <p className="empty-state-title">No invoices found</p>
              <p className="empty-state-desc">{search || statusFilter !== 'all' ? 'Try adjusting your filters.' : 'Create your first invoice to get started.'}</p>
              {!search && <Link to="/invoices/new" className="btn btn-primary btn-sm mt-4"><Plus size={14} /> Create Invoice</Link>}
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Client</th>
                    <th>Date</th>
                    <th>Due Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inv) => (
                    <tr key={inv._id} className={selectedInvoice?._id === inv._id ? 'row-selected' : ''}>
                      <td>
                        <button className="inv-number-link" onClick={() => setSelectedInvoice(inv)} id={`view-invoice-${inv._id}`}>
                          {inv.invoiceNumber}
                        </button>
                      </td>
                      <td>
                        <div className="client-cell">
                          <span className="client-name">{inv.clientName}</span>
                          {inv.clientEmail && <span className="client-email">{inv.clientEmail}</span>}
                        </div>
                      </td>
                      <td className="text-muted text-sm">{formatDate(inv.invoiceDate)}</td>
                      <td className="text-muted text-sm">{formatDate(inv.dueDate)}</td>
                      <td className="font-bold">{formatCurrency(inv.total, inv.currency)}</td>
                      <td>
                        <select
                          className={`status-select badge ${statusClass[inv.status]}`}
                          value={inv.status}
                          onChange={(e) => handleStatusChange(inv._id, e.target.value)}
                          id={`status-select-${inv._id}`}
                        >
                          {['draft','sent','paid','overdue','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button className="btn btn-icon btn-ghost btn-sm" title="Preview" onClick={() => setSelectedInvoice(inv)} id={`preview-${inv._id}`}><Eye size={14} /></button>
                          <button className="btn btn-icon btn-ghost btn-sm" title="Download" onClick={() => handleDownload(inv)} id={`download-${inv._id}`}><Download size={14} /></button>
                          <button className="btn btn-icon btn-danger btn-sm" title="Delete" onClick={() => handleDelete(inv._id, inv.invoiceNumber)} id={`delete-${inv._id}`}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selectedInvoice && (
          <div className="history-detail-panel animate-fadeInUp">
            <div className="detail-panel-header">
              <span className="font-bold text-sm">{selectedInvoice.invoiceNumber}</span>
              <div className="flex gap-2">
                <button className="btn btn-primary btn-sm" onClick={() => handleDownload(selectedInvoice)} id="detail-download-btn"><Download size={13} /> PDF</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelectedInvoice(null)}>✕</button>
              </div>
            </div>
            <div className="detail-panel-scroll">
              <div id="history-invoice-preview">
                <InvoicePreview data={{ ...selectedInvoice, invoiceDate: selectedInvoice.invoiceDate ? new Date(selectedInvoice.invoiceDate) : undefined, dueDate: selectedInvoice.dueDate ? new Date(selectedInvoice.dueDate) : undefined }} layout={selectedInvoice.layoutSnapshot || {}} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
