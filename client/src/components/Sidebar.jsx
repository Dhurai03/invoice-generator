import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Plus, History,
  FilePlus, ChevronLeft, ChevronRight, Zap
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/templates', label: 'Templates', icon: FileText },
  { to: '/templates/create', label: 'Create Template', icon: FilePlus },
  { to: '/invoices/new', label: 'New Invoice', icon: Plus },
  { to: '/invoices', label: 'Invoice History', icon: History },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Zap size={20} />
        </div>
        {!collapsed && (
          <span className="logo-text">InvoiceForge</span>
        )}
        <button
          className="sidebar-toggle"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {!collapsed && <span className="nav-section-label">Menu</span>}
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title={collapsed ? item.label : undefined}
          >
            <span className="nav-icon"><item.icon size={18} /></span>
            {!collapsed && <span className="nav-label">{item.label}</span>}
            {!collapsed && item.to === '/invoices/new' && (
              <span className="nav-badge">New</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="sidebar-footer">
          <div className="sidebar-version">v1.0.0 — Free Tier</div>
        </div>
      )}
    </aside>
  );
}
