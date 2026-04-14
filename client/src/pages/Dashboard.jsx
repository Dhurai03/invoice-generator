import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, DollarSign, Clock, CheckCircle, AlertCircle, ArrowRight, Zap } from 'lucide-react';
import { useInvoice } from '../context/InvoiceContext';
import StatsCard from '../components/StatsCard';
import './Dashboard.css';

const quickActions = [
  { title: 'Create Invoice', desc: 'Generate a new invoice instantly', icon: Plus, to: '/invoices/new', color: 'primary' },
  { title: 'Manage Templates', desc: 'Browse and customize templates', icon: FileText, to: '/templates', color: 'info' },
  { title: 'Upload Template', desc: 'Import your existing template', icon: Zap, to: '/templates/create', color: 'warning' },
];

export default function Dashboard() {
  const { stats, fetchStats, invoices, fetchInvoices, loading } = useInvoice();

  useEffect(() => {
    fetchStats();
    fetchInvoices({ limit: 5 });
  }, []);

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

  const getStatusBadge = (status) => {
    const map = {
      draft: 'badge-default',
      sent: 'badge-info',
      paid: 'badge-success',
      overdue: 'badge-danger',
      cancelled: 'badge-default',
    };
    return `badge ${map[status] || 'badge-default'}`;
  };

  return (
    <div className="page-container animate-fadeIn">
      {/* Hero */}
      <div className="dashboard-hero">
        <div className="dashboard-hero-content">
          <div className="hero-badge">
            <Zap size={12} /> Welcome back
          </div>
          <h1 className="page-title">Your Invoice Dashboard</h1>
          <p className="page-subtitle">Manage your invoices, templates, and track your business revenue all in one place.</p>
        </div>
        <Link to="/invoices/new" className="btn btn-primary btn-lg hero-cta">
          <Plus size={18} />
          Create New Invoice
          <ArrowRight size={18} />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatsCard title="Total Invoices" value={stats?.total ?? '—'} icon={FileText} color="primary" trend={12} />
        <StatsCard title="Total Revenue" value={formatCurrency(stats?.totalRevenue)} icon={DollarSign} color="success" trend={8} prefix="" />
        <StatsCard title="Pending Amount" value={formatCurrency(stats?.pendingRevenue)} icon={Clock} color="warning" />
        <StatsCard title="Paid Invoices" value={stats?.paid ?? '—'} icon={CheckCircle} color="success" />
        <StatsCard title="Overdue" value={stats?.overdue ?? '—'} icon={AlertCircle} color="danger" />
      </div>

      {/* Quick Actions + Recent */}
      <div className="dashboard-main-grid">
        {/* Quick Actions */}
        <div className="section-card">
          <div className="section-title">Quick Actions</div>
          <div className="quick-actions">
            {quickActions.map((action) => (
              <Link key={action.to} to={action.to} className={`quick-action-card quick-action-card--${action.color}`}>
                <div className={`quick-action-icon quick-action-icon--${action.color}`}>
                  <action.icon size={20} />
                </div>
                <div>
                  <div className="quick-action-title">{action.title}</div>
                  <div className="quick-action-desc">{action.desc}</div>
                </div>
                <ArrowRight size={16} className="quick-action-arrow" />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="section-card">
          <div className="section-title flex justify-between items-center">
            <span>Recent Invoices</span>
            <Link to="/invoices" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          {loading ? (
            <div className="loading-screen"><div className="spinner" /></div>
          ) : invoices.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><FileText size={28} /></div>
              <p className="empty-state-title">No invoices yet</p>
              <p className="empty-state-desc">Create your first invoice to get started.</p>
              <Link to="/invoices/new" className="btn btn-primary btn-sm mt-4"><Plus size={14} /> Create Invoice</Link>
            </div>
          ) : (
            <div className="recent-invoices-list">
              {invoices.slice(0, 5).map((inv) => (
                <div key={inv._id} className="recent-invoice-row">
                  <div className="recent-invoice-info">
                    <span className="recent-invoice-number">{inv.invoiceNumber}</span>
                    <span className="recent-invoice-client">{inv.clientName}</span>
                  </div>
                  <div className="recent-invoice-right">
                    <span className="recent-invoice-amount">{formatCurrency(inv.total)}</span>
                    <span className={getStatusBadge(inv.status)}>
                      <span className="badge-dot" />
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
