// components/ChartComponent.tsx
'use client'; // 🔴 標記為 Client Component

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartData {
  name: string;
  value: number;
}

interface ChartComponentProps {
  data: ChartData[];
}

// 顏色列表，確保圖表顏色清晰
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A100F0', '#00A0A0', '#FFA07A', '#7FFF00', '#DDA0DD'];

const ChartComponent: React.FC<ChartComponentProps> = ({ data }) => {
  if (data.length === 0 || data.every(d => d.value === 0)) {
    return <p style={{ textAlign: 'center', margin: '50px 0' }}>尚無有效消費數據可供繪製圖表。</p>;
  }

  return (
    <div style={{ width: '100%', height: 400 }}>
        {/* ResponsiveContainer 確保圖表在不同尺寸下能自適應 */}
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    fill="#8884d8"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`NT$ ${value.toLocaleString()}`, name]} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
            </PieChart>
        </ResponsiveContainer>
    </div>
  );
};

export default ChartComponent;