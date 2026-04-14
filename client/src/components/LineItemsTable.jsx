import { Plus, Trash2 } from 'lucide-react';
import './LineItemsTable.css';

const emptyItem = () => ({ description: '', quantity: 1, rate: 0, amount: 0 });

export default function LineItemsTable({ items, onChange, currency = 'USD' }) {
  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(val || 0);

  const updateItem = (index, field, value) => {
    const updated = items.map((item, i) => {
      if (i !== index) return item;
      const newItem = { ...item, [field]: value };
      newItem.amount = (parseFloat(newItem.quantity) || 0) * (parseFloat(newItem.rate) || 0);
      return newItem;
    });
    onChange(updated);
  };

  const addItem = () => onChange([...items, emptyItem()]);
  const removeItem = (index) => onChange(items.filter((_, i) => i !== index));

  const subtotal = items.reduce((s, item) => s + (item.amount || 0), 0);

  return (
    <div className="line-items-wrapper">
      <div className="line-items-table-container">
        <table className="line-items-table">
          <thead>
            <tr>
              <th className="col-desc">Description</th>
              <th className="col-qty">Qty</th>
              <th className="col-rate">Rate</th>
              <th className="col-amount">Amount</th>
              <th className="col-action" />
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="line-item-row animate-fadeInUp">
                <td className="col-desc">
                  <input
                    type="text"
                    className="line-input"
                    value={item.description}
                    placeholder="Item description..."
                    id={`item-desc-${index}`}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                  />
                </td>
                <td className="col-qty">
                  <input
                    type="number"
                    className="line-input text-center"
                    value={item.quantity}
                    min="0"
                    id={`item-qty-${index}`}
                    onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                  />
                </td>
                <td className="col-rate">
                  <div className="rate-input-wrapper">
                    <span className="currency-symbol">$</span>
                    <input
                      type="number"
                      className="line-input"
                      value={item.rate}
                      min="0"
                      step="0.01"
                      id={`item-rate-${index}`}
                      onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </td>
                <td className="col-amount">
                  <span className="item-amount">{formatCurrency(item.amount)}</span>
                </td>
                <td className="col-action">
                  <button
                    type="button"
                    className="btn btn-icon btn-ghost btn-sm remove-item-btn"
                    onClick={() => removeItem(index)}
                    aria-label="Remove item"
                    id={`remove-item-${index}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="line-items-footer">
        <button type="button" className="btn btn-ghost btn-sm add-item-btn" onClick={addItem} id="add-line-item">
          <Plus size={14} />
          Add Line Item
        </button>
        <div className="subtotal-display">
          <span className="subtotal-label">Subtotal</span>
          <span className="subtotal-value">{formatCurrency(subtotal)}</span>
        </div>
      </div>
    </div>
  );
}
