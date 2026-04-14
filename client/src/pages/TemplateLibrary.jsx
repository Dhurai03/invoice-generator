import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Trash2, FileText, Upload, Search, Eye } from 'lucide-react';
import { useInvoice } from '../context/InvoiceContext';
import { templateAPI } from '../services/api';
import toast from 'react-hot-toast';
import FileDropzone from '../components/FileDropzone';
import './TemplateLibrary.css';

export default function TemplateLibrary() {
  const { templates, fetchTemplates, loading, setTemplates } = useInvoice();
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadName, setUploadName] = useState('');
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { fetchTemplates(); }, []);

  const filtered = templates.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    (t.description || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return toast.error('Please select a file');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('name', uploadName || uploadFile.name.replace(/\.[^/.]+$/, ''));
      const res = await templateAPI.upload(formData);
      setTemplates(prev => [res.data, ...prev]);
      toast.success('Template uploaded successfully!');
      setShowUpload(false);
      setUploadFile(null);
      setUploadName('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete template "${name}"?`)) return;
    try {
      await templateAPI.delete(id);
      setTemplates(prev => prev.filter(t => t._id !== id));
      toast.success('Template deleted');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getTypeIcon = (type) => {
    if (type === 'pdf') return '📄';
    if (type === 'image') return '🖼️';
    if (type === 'html') return '🌐';
    return '⚡';
  };

  return (
    <div className="page-container animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Template Library</h1>
          <p className="page-subtitle">Browse, manage, and use your invoice templates</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-secondary" onClick={() => setShowUpload(!showUpload)} id="upload-template-btn">
            <Upload size={15} /> Upload Template
          </button>
          <Link to="/templates/create" className="btn btn-primary" id="create-template-btn">
            <Plus size={15} /> Create Template
          </Link>
        </div>
      </div>

      {/* Upload Panel */}
      {showUpload && (
        <div className="section-card animate-fadeInUp">
          <div className="section-title"><Upload size={16} /> Upload Existing Template</div>
          <form onSubmit={handleUpload}>
            <div className="form-row mb-4">
              <div className="form-group">
                <label className="form-label">Template Name</label>
                <input
                  id="upload-template-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Standard Business Invoice"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                />
              </div>
            </div>
            <FileDropzone
              file={uploadFile}
              onFileSelect={setUploadFile}
              onRemove={() => setUploadFile(null)}
            />
            <div className="flex gap-3 mt-4">
              <button type="submit" className={`btn btn-primary ${uploading ? 'btn-loading' : ''}`} disabled={uploading} id="submit-upload-btn">
                {uploading ? <><span className="spinner" /> Uploading...</> : <><Upload size={15} /> Upload Template</>}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowUpload(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="template-search-bar">
        <Search size={15} className="search-icon" />
        <input
          id="template-search"
          type="text"
          className="search-input"
          placeholder="Search templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="loading-screen"><div className="spinner spinner-lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><FileText size={28} /></div>
          <p className="empty-state-title">{search ? 'No matching templates' : 'No templates yet'}</p>
          <p className="empty-state-desc">Create a template from scratch or upload an existing one.</p>
          <div className="flex gap-3 mt-4">
            <Link to="/templates/create" className="btn btn-primary btn-sm"><Plus size={14} /> Create Template</Link>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowUpload(true)}><Upload size={14} /> Upload</button>
          </div>
        </div>
      ) : (
        <div className="templates-grid">
          {filtered.map((t, i) => (
            <div key={t._id} className="template-card animate-fadeInUp" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="template-card-top">
                <div className="template-type-icon">{getTypeIcon(t.uploadedFileType)}</div>
                <div className="template-actions-top">
                  <button className="btn btn-icon btn-ghost btn-sm" title="Delete" onClick={() => handleDelete(t._id, t.name)} id={`delete-template-${t._id}`}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="template-preview-bar" style={{ background: `linear-gradient(135deg, ${t.layout?.primaryColor || '#6366f1'}, ${t.layout?.accentColor || '#818cf8'})` }} />
              <div className="template-card-body">
                <h3 className="template-name">{t.name}</h3>
                {t.description && <p className="template-desc">{t.description}</p>}
                <div className="template-meta">
                  <span className="badge badge-default">{t.fields?.length || 0} fields</span>
                  <span className="template-usage">Used {t.usageCount} times</span>
                </div>
              </div>
              <div className="template-card-footer">
                <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/invoices/new/${t._id}`)} id={`use-template-${t._id}`}>
                  <Eye size={13} /> Use Template
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
