"use client"

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';

const data = [
    { name: 'Jan', uv: 4000, pv: 2400 },
    { name: 'Feb', uv: 3000, pv: 1398 },
    { name: 'Mar', uv: 2000, pv: 9800 },
    { name: 'Apr', uv: 2780, pv: 3908 },
    { name: 'May', uv: 1890, pv: 4800 },
    { name: 'Jun', uv: 2390, pv: 3800 },
    { name: 'Jul', uv: 3490, pv: 4300 },
];

const barData = [
    { name: 'Page A', uv: 4000, pv: 2400 },
    { name: 'Page B', uv: 3000, pv: 1398 },
    { name: 'Page C', uv: 2000, pv: 9800 },
    { name: 'Page D', uv: 2780, pv: 3908 },
    { name: 'Page E', uv: 1890, pv: 4800 },
    { name: 'Page F', uv: 2390, pv: 3800 },
    { name: 'Page G', uv: 3490, pv: 4300 },
];

export default function StatisticsPage() {
    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Statistics</h1>
                <p className="text-gray-400 text-sm mt-1 font-medium">Detailed analysis of your performance.</p>
            </div>

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
                <div className="lg:col-span-4 bg-[#13171F] border border-gray-800/40 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-gray-800/50 bg-blue-500/5">
                        <h3 className="text-lg font-bold text-white uppercase tracking-wider">Revenue Overview</h3>
                    </div>
                    <div className="p-6 h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1F2937" opacity={0.5} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#4B5563', fontSize: 10, fontWeight: 700 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#4B5563', fontSize: 10, fontWeight: 700 }}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#0F1116',
                                        border: '1px solid #1F2937',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        color: '#fff',
                                        fontWeight: 'bold'
                                    }}
                                />
                                <Line type="monotone" dataKey="pv" stroke="#ff90e8" strokeWidth={3} dot={{ r: 4, fill: '#ff90e8' }} activeDot={{ r: 6, stroke: '#0B0E14', strokeWidth: 2 }} />
                                <Line type="monotone" dataKey="uv" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, fill: '#3B82F6' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="lg:col-span-3 bg-[#13171F] border border-gray-800/40 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-gray-800/50 bg-purple-500/5">
                        <h3 className="text-lg font-bold text-white uppercase tracking-wider">Traffic Sources</h3>
                    </div>
                    <div className="p-6 h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1F2937" opacity={0.5} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#4B5563', fontSize: 10, fontWeight: 700 }}
                                    dy={10}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                    contentStyle={{
                                        backgroundColor: '#0F1116',
                                        border: '1px solid #1F2937',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        color: '#fff',
                                        fontWeight: 'bold'
                                    }}
                                />
                                <Bar dataKey="pv" fill="#FACC15" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    )
}
