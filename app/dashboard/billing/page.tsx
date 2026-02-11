"use client"

import { Check, CreditCard, Download } from "lucide-react"

const invoices = [
    {
        invoice: "INV001",
        paymentStatus: "Paid",
        totalAmount: "$250.00",
        paymentMethod: "Credit Card",
        date: "Feb 10, 2026",
    },
    {
        invoice: "INV002",
        paymentStatus: "Pending",
        totalAmount: "$150.00",
        paymentMethod: "PayPal",
        date: "Jan 10, 2026",
    },
    {
        invoice: "INV003",
        paymentStatus: "Unpaid",
        totalAmount: "$350.00",
        paymentMethod: "Bank Transfer",
        date: "Dec 10, 2025",
    },
    {
        invoice: "INV004",
        paymentStatus: "Paid",
        totalAmount: "$450.00",
        paymentMethod: "Credit Card",
        date: "Nov 10, 2025",
    },
    {
        invoice: "INV005",
        paymentStatus: "Paid",
        totalAmount: "$550.00",
        paymentMethod: "PayPal",
        date: "Oct 10, 2025",
    },
]

export default function BillingPage() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-4xl font-black tracking-tighter uppercase italic">Billing</h2>
                <p className="text-lg font-bold text-gray-600 border-l-4 border-black pl-4 mt-2">
                    Manage your billing and invoicing.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="border-2 border-black bg-white shadow-[8px_8px_0px_0px_black] p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-yellow-400 text-black text-xs font-black px-2 py-1 border-b-2 border-l-2 border-black">
                        POPULAR
                    </div>
                    <h3 className="font-black text-xl uppercase mb-2">Current Plan</h3>
                    <div className="text-4xl font-black text-black mb-1">PRO PLAN</div>
                    <p className="text-sm font-bold text-gray-500 mb-6">
                        $29/month per user
                    </p>
                    <div className="space-y-3 mb-8">
                        <div className="flex items-center text-sm font-bold">
                            <div className="bg-green-400 border-2 border-black p-0.5 mr-3 shadow-[2px_2px_0px_0px_black]">
                                <Check className="h-3 w-3 text-black" />
                            </div>
                            20 Users included
                        </div>
                        <div className="flex items-center text-sm font-bold">
                            <div className="bg-green-400 border-2 border-black p-0.5 mr-3 shadow-[2px_2px_0px_0px_black]">
                                <Check className="h-3 w-3 text-black" />
                            </div>
                            10GB Data storage
                        </div>
                        <div className="flex items-center text-sm font-bold">
                            <div className="bg-green-400 border-2 border-black p-0.5 mr-3 shadow-[2px_2px_0px_0px_black]">
                                <Check className="h-3 w-3 text-black" />
                            </div>
                            Priority Support
                        </div>
                    </div>
                    <button className="w-full border-2 border-black bg-black text-white px-4 py-3 text-sm font-black hover:bg-gray-800 shadow-[4px_4px_0px_0px_#ff90e8] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#ff90e8] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all uppercase">
                        Upgrade Plan
                    </button>
                </div>

                <div className="col-span-2 border-2 border-black bg-white shadow-[8px_8px_0px_0px_black] p-6">
                    <h3 className="font-black text-xl uppercase mb-6">Payment Method</h3>
                    <div className="flex items-center p-4 border-2 border-black bg-gray-100 mb-6 shadow-[4px_4px_0px_0px_black]">
                        <CreditCard className="h-8 w-8 mr-4 text-black" />
                        <div className="flex-1">
                            <p className="text-base font-black">Visa ending in 4242</p>
                            <p className="text-xs font-bold text-gray-500">Expiry 06/2028</p>
                        </div>
                        <button className="text-sm text-black font-bold underline hover:text-pink-500">Edit</button>
                    </div>
                    <button className="flex items-center gap-2 border-2 border-black bg-white px-4 py-2 text-sm font-bold hover:bg-gray-100 shadow-[4px_4px_0px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_black] transition-all">
                        <CreditCard className="h-4 w-4 mr-2" /> Add Payment Method
                    </button>
                </div>
            </div>

            <div className="border-2 border-black bg-white shadow-[8px_8px_0px_0px_black]">
                <div className="p-6 border-b-2 border-black bg-orange-200">
                    <h3 className="font-black text-xl uppercase">Invoices</h3>
                </div>
                <div className="p-0 overflow-x-auto">
                    <table className="w-full caption-bottom text-sm font-bold text-black">
                        <thead className="[&_tr]:border-b-2 border-black bg-gray-100">
                            <tr className="border-b-2 border-black">
                                <th className="h-12 px-6 text-left align-middle font-black uppercase">Invoice</th>
                                <th className="h-12 px-6 text-left align-middle font-black uppercase">Status</th>
                                <th className="h-12 px-6 text-left align-middle font-black uppercase">Method</th>
                                <th className="h-12 px-6 text-left align-middle font-black uppercase">Amount</th>
                                <th className="h-12 px-6 text-right align-middle font-black uppercase">Date</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0 bg-white">
                            {invoices.map((invoice) => (
                                <tr
                                    key={invoice.invoice}
                                    className="border-b-2 border-black hover:bg-yellow-50 transition-colors"
                                >
                                    <td className="p-6 align-middle font-bold">{invoice.invoice}</td>
                                    <td className="p-6 align-middle">
                                        <span
                                            className={`inline-flex items-center border-2 border-black px-3 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_0px_black]
                      ${invoice.paymentStatus === "Paid"
                                                    ? "bg-green-400 text-black"
                                                    : invoice.paymentStatus === "Pending"
                                                        ? "bg-yellow-400 text-black"
                                                        : "bg-red-400 text-black"
                                                }`}
                                        >
                                            {invoice.paymentStatus}
                                        </span>
                                    </td>
                                    <td className="p-6 align-middle">{invoice.paymentMethod}</td>
                                    <td className="p-6 align-middle">{invoice.totalAmount}</td>
                                    <td className="p-6 align-middle text-right flex justify-end items-center gap-4">
                                        {invoice.date}
                                        <button className="h-8 w-8 flex items-center justify-center border-2 border-black bg-white hover:bg-gray-100 shadow-[2px_2px_0px_0px_black] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all">
                                            <Download className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
