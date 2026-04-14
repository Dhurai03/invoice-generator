import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { InvoiceProvider } from './context/InvoiceContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import TemplateLibrary from './pages/TemplateLibrary';
import CreateTemplate from './pages/CreateTemplate';
import GenerateInvoice from './pages/GenerateInvoice';
import InvoiceHistory from './pages/InvoiceHistory';

export default function App() {
  return (
    <InvoiceProvider>
      <BrowserRouter>
        <div className="app-layout">
          <div className="ambient-bg" />
          <Sidebar />
          <div className="main-content">
            <Navbar />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/templates" element={<TemplateLibrary />} />
              <Route path="/templates/create" element={<CreateTemplate />} />
              <Route path="/invoices/new" element={<GenerateInvoice />} />
              <Route path="/invoices/new/:templateId" element={<GenerateInvoice />} />
              <Route path="/invoices" element={<InvoiceHistory />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1e38',
              color: '#f1f5f9',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#0a0b14' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#0a0b14' } },
          }}
        />
      </BrowserRouter>
    </InvoiceProvider>
  );
}
