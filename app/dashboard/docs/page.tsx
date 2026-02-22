"use client"

import { BookOpen, Layers, Code, CreditCard, ChevronRight, CheckCircle2, Copy } from "lucide-react"
import { useState } from "react"
import Toast from "@/components/Toast"

export default function DocsPage() {
    const [showToast, setShowToast] = useState(false)

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)
    }

    interface Step {
        id: number
        title: string
        description: string
        icon: any
        action?: {
            label: string
            href: string
        }
        details: string[]
        code?: string
    }

    const steps: Step[] = [
        {
            id: 1,
            title: "Configure Your Store",
            description: "First, you need to set up your store identity. This information will be used to generate your unique widget integration URL.",
            icon: Layers,
            action: {
                label: "Go to Settings",
                href: "/dashboard/settings"
            },
            details: [
                "Navigate to the Settings page",
                "Enter your Store Name (e.g., 'Azana')",
                "Your Widget URL will be automatically generated (e.g., www.azana.droutfit.com)",
                "Click 'Save Store Info' to register your domain"
            ]
        },
        {
            id: 2,
            title: "Add Your Products",
            description: "Upload your physical garments and model photos to train the AI. Categorization is key for accurate results.",
            icon: BookOpen,
            action: {
                label: "Manage Products",
                href: "/dashboard/products"
            },
            details: [
                "Go to the Products page",
                "Click 'Add New Product'",
                "Upload a clear image of the garment (ghost mannequin preferred)",
                "Add model images if available",
                "Select the correct category (e.g., Dresses, Tops)"
            ]
        },
        {
            id: 3,
            title: "Embed the Widget",
            description: "Integrate the Virtual Try-On experience directly into your e-commerce store with a simple code snippet.",
            icon: Code,
            action: {
                label: "Get Integration Code",
                href: "/dashboard/products"
            },
            details: [
                "Go to your Products page",
                "Select the product you want to embed",
                "Scroll down to the 'Integration Code' section",
                "Choose between IFRAME or SCRIPT method",
                "Copy the code and paste it into your website"
            ]
        },
        {
            id: 4,
            title: "Manage Credits",
            description: "Ensure you have enough processing credits for your customers to perform try-ons.",
            icon: CreditCard,
            action: {
                label: "Billing & Credits",
                href: "/dashboard/billing"
            },
            details: [
                "Visit the Billing page",
                "Subscribe to the Base Plan ($5/mo) to unlock credit purchasing",
                "Buy credits as needed ($0.04/credit)",
                "Monitor your usage in the dashboard"
            ]
        }
    ]

    return (
        <div className="space-y-8 pb-12 relative">
            <div className="fixed top-4 right-4 z-50">
                <Toast
                    message="Code copied to clipboard!"
                    isVisible={showToast}
                    onClose={() => setShowToast(false)}
                    type="success"
                />
            </div>

            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Documentation</h1>
                <p className="text-gray-400 text-sm font-medium mt-1">
                    Step-by-step guide to integrating Dr Outfit into your store.
                </p>
            </div>

            <div className="grid gap-8">
                {steps.map((step, index) => (
                    <div key={step.id} className="bg-[#13171F] border border-gray-800 rounded-2xl overflow-hidden relative group">
                        {/* Step Number Background */}
                        <div className="absolute -right-6 -top-6 text-[120px] font-black text-gray-800/20 leading-none select-none z-0">
                            {step.id}
                        </div>

                        <div className="p-6 relative z-10">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-500">
                                    <step.icon className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                                    <p className="text-gray-400 text-sm mb-6 max-w-2xl leading-relaxed">
                                        {step.description}
                                    </p>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Instructions</h4>
                                            <ul className="space-y-2">
                                                {step.details.map((detail, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                                        <span>{detail}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {step.code && (
                                            <div className="space-y-3">
                                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Integration Code</h4>
                                                <div className="bg-[#0B0E14] border border-gray-800 rounded-lg p-4 group/code relative">
                                                    <code className="text-xs font-mono text-blue-300 break-all">
                                                        {step.code}
                                                    </code>
                                                    <button
                                                        onClick={() => copyToClipboard(step.code as string)}
                                                        className="absolute top-2 right-2 p-1.5 bg-gray-800 hover:bg-gray-700 rounded-md text-gray-400 hover:text-white transition-colors opacity-0 group-hover/code:opacity-100"
                                                    >
                                                        <Copy className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {step.action && (
                                        <div className="mt-8">
                                            <a
                                                href={step.action.href}
                                                className="inline-flex items-center gap-2 text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors group/link"
                                            >
                                                {step.action.label}
                                                <ChevronRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
