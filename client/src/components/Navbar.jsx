import { useLocation, Link } from 'react-router-dom';
import { Bell, Search, Plus } from 'lucide-react';
import './Navbar.css';

const routeTitles = {
  '/': 'Dashboard',
  '/templates': 'Template Library',
  '/templates/create': 'Create Template',
  '/invoices/new': 'New Invoice',
  '/invoices': 'Invoice History',
};

export default function Navbar() {
  const location = useLocation();
  const title = routeTitles[location.pathname] || 'InvoiceForge';

  return (
    <header className="navbar">
      <div className="navbar-left">
        <h1 className="navbar-title">{title}</h1>
      </div>
      <div className="navbar-center">
        <div className="search-bar">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            placeholder="Search invoices, templates..."
            className="search-input"
            id="global-search"
          />
          <kbd className="search-kbd">⌘K</kbd>
        </div>
      </div>
      <div className="navbar-right">
        <button className="notification-btn" aria-label="Notifications">
          <Bell size={18} />
          <span className="notification-dot" />
        </button>
        <Link to="/invoices/new" className="btn btn-primary btn-sm">
          <Plus size={15} />
          New Invoice
        </Link>
        <div className="navbar-avatar" title="User">
          <span>IF</span>
        </div>
      </div>
    </header>
  );
}
