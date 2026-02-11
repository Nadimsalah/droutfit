"use client"

import { Activity, Camera, Images, Zap, ShoppingBag } from "lucide-react"

const stats = [
    {
        name: "Total Try-Ons",
        value: "45,231",
        change: "+20.1% from last month",
        icon: Camera,
        color: "bg-pink-300",
    },
    {
        name: "Generations",
        value: "12,234",
        change: "+12.5% from last month",
        icon: Images,
        color: "bg-yellow-300",
    },
    {
        name: "VTO Conversion",
        value: "4.2%",
        change: "+0.8% from last month",
        icon: Zap,
        color: "bg-blue-300",
    },
    {
        name: "Active Now",
        value: "573",
        change: "+201 since last hour",
        icon: Activity,
        color: "bg-green-300",
    },
]

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-4xl font-black tracking-tighter uppercase italic">Overview</h2>
                <p className="text-lg font-bold text-gray-600 border-l-4 border-black pl-4 mt-2">
                    Visualizing how VTO drives your store's growth.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div
                        key={stat.name}
                        className={`border-2 border-black p-6 shadow-[4px_4px_0px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_black] transition-all bg-white`}
                    >
                        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <h3 className="tracking-tight text-sm font-bold text-black uppercase">
                                {stat.name}
                            </h3>
                            <div className={`p-2 border-2 border-black ${stat.color} shadow-[2px_2px_0px_0px_black]`}>
                                <stat.icon className="h-4 w-4 text-black" />
                            </div>
                        </div>
                        <div className="pt-4">
                            <div className="text-3xl font-black">{stat.value}</div>
                            <p className="text-xs font-bold text-gray-500 mt-1">
                                {stat.change}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 border-2 border-black bg-white shadow-[8px_8px_0px_0px_black]">
                    <div className="p-6 border-b-2 border-black bg-pink-100">
                        <h3 className="text-xl font-black uppercase">Try-On Demand Analysis</h3>
                    </div>
                    <div className="p-6 h-[350px] flex flex-col items-center justify-center bg-white space-y-4">
                        <div className="text-lg font-bold text-gray-400 uppercase tracking-widest mb-4">Hourly Engagement (Last 24h)</div>
                        <div className="flex gap-2 w-full px-4 items-end h-48">
                            {[40, 60, 45, 90, 100, 80, 50, 70, 85, 110, 130, 120, 95, 110, 140, 160, 150, 120, 90, 100, 110, 130, 140, 120].map((height, i) => (
                                <div
                                    key={i}
                                    className={`flex-1 border-t-2 border-x-2 border-black transition-all hover:bg-black group relative`}
                                    style={{ height: `${height}%`, backgroundColor: i % 2 === 0 ? '#ff90e8' : '#ffdb58' }}
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {Math.floor(height * 2.5)}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="w-full flex justify-between text-[10px] font-black uppercase text-gray-400 px-4 pt-2">
                            <span>00:00</span>
                            <span>06:00</span>
                            <span>12:00</span>
                            <span>18:00</span>
                            <span>23:59</span>
                        </div>
                    </div>
                </div>
                <div className="col-span-3 border-2 border-black bg-white shadow-[8px_8px_0px_0px_black]">
                    <div className="p-6 border-b-2 border-black bg-yellow-100">
                        <h3 className="text-xl font-black uppercase">Live Try-On Feed</h3>
                        <p className="text-sm font-bold text-gray-600">
                            Current interactions across your store.
                        </p>
                    </div>
                    <div className="p-6">
                        <div className="space-y-6">
                            {[
                                { user: "Olivia Martin", product: "Premium Denim Jacket", time: "just now", icon: "🧥", color: "bg-blue-200" },
                                { user: "Jackson Lee", product: "Classic Cotton Tee", time: "4 min ago", icon: "👕", color: "bg-green-200" },
                                { user: "Isabella Nguyen", product: "Floral Summer Dress", time: "12 min ago", icon: "👗", color: "bg-pink-200" },
                                { user: "William Kim", product: "Slim Fit Chinos", time: "18 min ago", icon: "👖", color: "bg-yellow-200" },
                                { user: "Sofia Davis", product: "Leather Biker Jacket", time: "25 min ago", icon: "🧥", color: "bg-purple-200" },
                                { user: "Lucas Chen", product: "Cotton Oxford Shirt", time: "32 min ago", icon: "👔", color: "bg-blue-200" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center group cursor-pointer">
                                    <div className={`h-10 w-10 border-2 border-black ${item.color} flex items-center justify-center text-xl shadow-[3px_3px_0px_0px_black] group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:shadow-none transition-all`}>
                                        {item.icon}
                                    </div>
                                    <div className="ml-4 space-y-0.5">
                                        <p className="text-sm font-black leading-none">{item.user}</p>
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-tighter">{item.product}</p>
                                    </div>
                                    <div className="ml-auto text-xs font-black text-gray-400 uppercase italic">{item.time}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
