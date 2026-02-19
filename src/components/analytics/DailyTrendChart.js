import React from 'react';

function DailyTrendChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-muted-foreground text-center py-4">No trend data available</p>;
  }

  const maxCount = Math.max(...data.map(d => d.count));

  return (
    <div className="space-y-2">
      {data.slice(-14).map((item) => (
        <div key={item.date} className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground w-20">{item.date}</span>
          <div className="flex-1 h-4 bg-muted rounded overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded"
              style={{ width: `${(item.count / maxCount) * 100}%` }}
            />
          </div>
          <span className="text-sm font-medium w-8 text-right">{item.count}</span>
        </div>
      ))}
    </div>
  );
}

export default DailyTrendChart;
