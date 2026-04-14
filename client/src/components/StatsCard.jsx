import { TrendingUp, TrendingDown } from 'lucide-react';
import './StatsCard.css';

export default function StatsCard({ title, value, icon: Icon, color = 'primary', trend, trendLabel, prefix = '' }) {
  const isPositive = trend >= 0;

  return (
    <div className={`stats-card stats-card--${color} animate-fadeInUp`}>
      <div className="stats-card-header">
        <span className="stats-card-title">{title}</span>
        <div className={`stats-card-icon stats-card-icon--${color}`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="stats-card-value">
        {prefix}<span>{value}</span>
      </div>
      {trend !== undefined && (
        <div className={`stats-card-trend ${isPositive ? 'trend-up' : 'trend-down'}`}>
          {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          <span>{Math.abs(trend)}% {trendLabel || 'vs last month'}</span>
        </div>
      )}
    </div>
  );
}
