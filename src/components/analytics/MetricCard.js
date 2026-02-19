import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

function MetricCard({ title, value, subtitle, icon: Icon, trend, color = 'text-blue-600' }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-full bg-muted ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        {trend !== undefined && (
          <div className="mt-3 flex items-center text-sm">
            <TrendingUp className={`h-4 w-4 mr-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            <span className={trend >= 0 ? 'text-green-600' : 'text-red-600'}>
              {trend >= 0 ? '+' : ''}{trend}%
            </span>
            <span className="text-muted-foreground ml-1">vs last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MetricCard;
