import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Plus, Trash2, Palette, Settings, Eye } from 'lucide-react';
import { templateAPI } from '../services/api';
import { useInvoice } from '../context/InvoiceContext';
import toast from 'react-hot-toast';
import InvoicePreview from '../components/InvoicePreview';
import './CreateTemplate.css';

const defaultLayout = {
  primaryColor: '#6366f1',
  accentColor: '#818cf8',
  fontFamily: 'Inter',
  companyName: '',
  companyAddress: '',
  companyEmail: '',
  companyPhone: '',
  logoUrl: '',
};

const defaultFields = [
  { key: 'clientName', label: 'Client Name', type: 'text', section: 'client', required: true },
  { key: 'clientEmail', label: 'Client Email', type: 'email', section: 'client', required: false },
  { key: 'clientAddress', label: 'Client Address', type: 'textarea', section: 'client', required: false },
  { key: 'invoiceDate', label: 'Invoice Date', type: 'date', section: 'header', required: true },
  { key: 'dueDate', label: 'Due Date', type: 'date', section: 'header', required: false },
  { key: 'notes', label: 'Notes', type: 'textarea', section: 'footer', required: false },
];

export default function CreateTemplate() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState(defaultFields);
  const [layout, setLayout] = useState(defaultLayout);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const { setTemplates } = useInvoice();
  const navigate = useNavigate();

  const addField = () => setFields([...fields, { key: `field_${Date.now()}`, label: '', type: 'text', section: 'custom', required: false }]);
  const removeField = (i) => setFields(fields.filter((_, idx) => idx !== i));
  const updateField = (i, key, val) => setFields(fields.map((f, idx) => idx === i ? { ...f, [key]: val } : f));

  const handleSave = async () => {
    if (!name.trim()) return toast.error('Template name is required');
    setSaving(true);
    try {
      const res = await templateAPI.create({ name, description, fields, layout });
      setTemplates(prev => [res.data, ...prev]);
      toast.success('Template created!');
      navigate('/templates');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const previewData = {
    companyName: layout.companyName || 'Your Company',
    companyAddress: layout.companyAddress,
    companyEmail: layout.companyEmail,
    companyPhone: layout.companyPhone,
    clientName: 'Sample Client',
    clientEmail: 'client@example.com',
    invoiceNumber: 'INV-0001',
    invoiceDate: new Date(),
    dueDate: new Date(Date.now() + 30 * 86400000),
    items: [{ description: 'Design Services', quantity: 2, rate: 500, amount: 1000 }],
    subtotal: 1000, taxRate: 10, taxAmount: 100, discountRate: 0, discountAmount: 0, total: 1100,
    currency: 'USD', notes: 'Thank you for your business.', terms: 'Payment due within 30 days.',
  };

  return (
    <div className="page-container animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Create Template</h1>
          <p className="page-subtitle">Design your custom invoice template</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-secondary" onClick={() => setShowPreview(!showPreview)} id="preview-template-btn">
            <Eye size={15} /> {showPreview ? 'Hide' : 'Preview'}
          </button>
          <button className={`btn btn-primary ${saving ? 'btn-loading' : ''}`} onClick={handleSave} disabled={saving} id="save-template-btn">
            {saving ? <><span className="spinner" /> Saving...</> : <><Save size={15} /> Save Template</>}
          </button>
        </div>
      </div>

      <div className={`create-template-layout ${showPreview ? 'with-preview' : ''}`}>
        <div className="create-template-form">
          {/* Basic Info */}
          <div className="section-card">
            <div className="section-title"><Settings size={15} /> Template Info</div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Template Name *</label>
                <input id="template-name" type="text" className="form-input" placeholder="e.g. Standard Business Invoice" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input id="template-desc" type="text" className="form-input" placeholder="Brief description..." value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div className="section-card">
            <div className="section-title"><Settings size={15} /> Company Details</div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input id="company-name" type="text" className="form-input" placeholder="Acme Corp" value={layout.companyName} onChange={(e) => setLayout({ ...layout, companyName: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Company Email</label>
                <input id="company-email" type="email" className="form-input" placeholder="hello@company.com" value={layout.companyEmail} onChange={(e) => setLayout({ ...layout, companyEmail: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Company Phone</label>
                <input id="company-phone" type="text" className="form-input" placeholder="+1 (555) 000-0000" value={layout.companyPhone} onChange={(e) => setLayout({ ...layout, companyPhone: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <input id="company-address" type="text" className="form-input" placeholder="123 Business St" value={layout.companyAddress} onChange={(e) => setLayout({ ...layout, companyAddress: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Style */}
          <div className="section-card">
            <div className="section-title"><Palette size={15} /> Style & Branding</div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Primary Color</label>
                <div className="color-picker-row">
                  <input id="primary-color" type="color" className="color-input" value={layout.primaryColor} onChange={(e) => setLayout({ ...layout, primaryColor: e.target.value })} />
                  <input type="text" className="form-input" value={layout.primaryColor} onChange={(e) => setLayout({ ...layout, primaryColor: e.target.value })} style={{ flex: 1 }} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Accent Color</label>
                <div className="color-picker-row">
                  <input id="accent-color" type="color" className="color-input" value={layout.accentColor} onChange={(e) => setLayout({ ...layout, accentColor: e.target.value })} />
                  <input type="text" className="form-input" value={layout.accentColor} onChange={(e) => setLayout({ ...layout, accentColor: e.target.value })} style={{ flex: 1 }} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Font</label>
                <select id="font-family" className="form-select" value={layout.fontFamily} onChange={(e) => setLayout({ ...layout, fontFamily: e.target.value })}>
                  <option>Inter</option>
                  <option>Outfit</option>
                  <option>Georgia</option>
                  <option>Arial</option>
                </select>
              </div>
            </div>
          </div>

          {/* Fields */}
          <div className="section-card">
            <div className="section-title">
              <span>Custom Fields</span>
              <button className="btn btn-ghost btn-sm" onClick={addField} id="add-field-btn"><Plus size={14} /> Add Field</button>
            </div>
            <div className="fields-list">
              {fields.map((field, i) => (
                <div key={i} className="field-row animate-fadeInUp">
                  <div className="field-row-inputs">
                    <input type="text" className="form-input" placeholder="Field Key" value={field.key} onChange={(e) => updateField(i, 'key', e.target.value)} id={`field-key-${i}`} />
                    <input type="text" className="form-input" placeholder="Label" value={field.label} onChange={(e) => updateField(i, 'label', e.target.value)} id={`field-label-${i}`} />
                    <select className="form-select" value={field.type} onChange={(e) => updateField(i, 'type', e.target.value)} id={`field-type-${i}`}>
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
                      <option value="email">Email</option>
                      <option value="textarea">Text Area</option>
                    </select>
                    <select className="form-select" value={field.section} onChange={(e) => updateField(i, 'section', e.target.value)} id={`field-section-${i}`}>
                      <option value="header">Header</option>
                      <option value="client">Client</option>
                      <option value="footer">Footer</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                  <div className="field-row-actions">
                    <label className="field-required-toggle">
                      <input type="checkbox" checked={field.required} onChange={(e) => updateField(i, 'required', e.target.checked)} id={`field-required-${i}`} />
                      <span>Required</span>
                    </label>
                    <button className="btn btn-icon btn-ghost btn-sm" onClick={() => removeField(i)} id={`remove-field-${i}`}><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Preview */}
        {showPreview && (
          <div className="template-preview-panel">
            <div className="template-preview-header">
              <span className="section-title" style={{ border: 'none', padding: 0, margin: 0 }}><Eye size={15} /> Live Preview</span>
            </div>
            <div className="template-preview-scroll">
              <InvoicePreview data={previewData} layout={layout} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
