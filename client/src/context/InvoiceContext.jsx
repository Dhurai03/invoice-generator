import { createContext, useContext, useState, useCallback } from 'react';
import { invoiceAPI, templateAPI } from '../services/api';

const InvoiceContext = createContext(null);

export const InvoiceProvider = ({ children }) => {
  const [templates, setTemplates] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await templateAPI.getAll();
      setTemplates(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchInvoices = useCallback(async (params) => {
    setLoading(true);
    try {
      const res = await invoiceAPI.getAll(params);
      setInvoices(res.data || []);
      return res;
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await invoiceAPI.getStats();
      setStats(res.data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <InvoiceContext.Provider value={{
      templates, invoices, stats, loading,
      fetchTemplates, fetchInvoices, fetchStats,
      setTemplates, setInvoices,
    }}>
      {children}
    </InvoiceContext.Provider>
  );
};

export const useInvoice = () => {
  const ctx = useContext(InvoiceContext);
  if (!ctx) throw new Error('useInvoice must be used within InvoiceProvider');
  return ctx;
};
