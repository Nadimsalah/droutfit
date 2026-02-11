"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

const data = [
    { name: 'Jan', uv: 4000, pv: 2400, amt: 2400 },
    { name: 'Feb', uv: 3000, pv: 1398, amt: 2210 },
    { name: 'Mar', uv: 2000, pv: 9800, amt: 2290 },
    { name: 'Apr', uv: 2780, pv: 3908, amt: 2000 },
    { name: 'May', uv: 1890, pv: 4800, amt: 2181 },
    { name: 'Jun', uv: 2390, pv: 3800, amt: 2500 },
    { name: 'Jul', uv: 3490, pv: 4300, amt: 2100 },
];

const barData = [
    { name: 'Page A', uv: 4000, pv: 2400, amt: 2400 },
    { name: 'Page B', uv: 3000, pv: 1398, amt: 2210 },
    { name: 'Page C', uv: 2000, pv: 9800, amt: 2290 },
    { name: 'Page D', uv: 2780, pv: 3908, amt: 2000 },
    { name: 'Page E', uv: 1890, pv: 4800, amt: 2181 },
    { name: 'Page F', uv: 2390, pv: 3800, amt: 2500 },
    { name: 'Page G', uv: 3490, pv: 4300, amt: 2100 },
];

export default function StatisticsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-4xl font-black tracking-tighter uppercase italic">Statistics</h2>
                <p className="text-lg font-bold text-gray-600 border-l-4 border-black pl-4 mt-2">
                    Detailed analysis of your performance.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 border-2 border-black bg-white shadow-[8px_8px_0px_0px_black]">
                    <div className="p-6 border-b-2 border-black bg-green-200">
                        <h3 className="text-xl font-black uppercase">Revenue Overview</h3>
                    </div>
                    <div className="p-6 h-[350px] w-full bg-white">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={data}
                                margin={{
                                    top: 5,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid strokeDasharray="0" vertical={true} stroke="#000" strokeWidth={1} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#000"
                                    fontSize={14}
                                    fontWeight="bold"
                                    tickLine={true}
                                    axisLine={true}
                                />
                                <YAxis
                                    stroke="#000"
                                    fontSize={14}
                                    fontWeight="bold"
                                    tickLine={true}
                                    axisLine={true}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '0px', border: '2px solid black', boxShadow: '4px 4px 0px 0px black', fontWeight: 'bold' }}
                                />
                                <Line type="monotone" dataKey="pv" stroke="#ff90e8" strokeWidth={4} activeDot={{ r: 8, stroke: 'black', strokeWidth: 2, fill: '#ff90e8' }} />
                                <Line type="monotone" dataKey="uv" stroke="#000" strokeWidth={4} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="col-span-3 border-2 border-black bg-white shadow-[8px_8px_0px_0px_black]">
                    <div className="p-6 border-b-2 border-black bg-purple-200">
                        <h3 className="text-xl font-black uppercase">Traffic Sources</h3>
                    </div>
                    <div className="p-6 h-[350px] w-full bg-white">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={barData}
                                margin={{
                                    top: 5,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid strokeDasharray="0" vertical={false} stroke="#000" strokeWidth={1} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#000"
                                    fontSize={14}
                                    fontWeight="bold"
                                    tickLine={true}
                                    axisLine={true}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f3f4f6' }}
                                    contentStyle={{ borderRadius: '0px', border: '2px solid black', boxShadow: '4px 4px 0px 0px black', fontWeight: 'bold' }}
                                />
                                <Bar dataKey="pv" fill="#ffc900" radius={[0, 0, 0, 0]} stroke="#000" strokeWidth={2} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    )
}
