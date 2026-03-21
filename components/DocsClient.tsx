"use client"

import { useState } from "react"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import { motion } from "framer-motion"
import { 
    Code, Copy, Terminal, ExternalLink, 
    Book, Globe, Cpu, Zap, CheckCircle2,
    Layers, Lock, Database
} from "lucide-react"
import LanguageSwitcher from "@/components/LanguageSwitcher"

export default function DocsClient({ dict, locale }: { dict: any, locale: string }) {
    const [copied, setCopied] = useState<string | null>(null)

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text)
        setCopied(id)
        setTimeout(() => setCopied(null), 2000)
    }

    const sections = [
        { id: "shopify", title: dict.integrationsPage?.cat1 || "1. Shopify", icon: <Globe className="h-5 w-5" /> },
        { id: "widget", title: "2. Button Integration", icon: <CheckCircle2 className="h-5 w-5" /> },
        { id: "wordpress", title: dict.integrationsPage?.cat2 || "3. WordPress", icon: <Layers className="h-5 w-5" /> },
        { id: "direct-api", title: dict.integrationsPage?.cat3 || "4. Direct API", icon: <Cpu className="h-5 w-5" /> },
        { id: "api-reference", title: dict.integrationsPage?.cat4 || "5. API Reference", icon: <Terminal className="h-5 w-5" /> }
    ]

    return (
        <div className="min-h-screen bg-[#050608] text-white font-sans" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            <Navbar dict={dict} locale={locale} />

            <div className="max-w-7xl mx-auto px-6 pt-32 pb-24 flex flex-col lg:flex-row gap-12">
                
                {/* Sidebar Navigation */}
                <aside className="lg:w-64 hidden lg:block sticky top-32 h-fit space-y-8">
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Integration Categories</p>
                        {sections.map(s => (
                            <a 
                                key={s.id} 
                                href={`#${s.id}`}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all text-sm font-bold group"
                            >
                                <span className="text-gray-600 group-hover:text-blue-500 transition-colors">{s.icon}</span>
                                {s.title}
                            </a>
                        ))}
                    </div>

                    <div className="pt-8 border-t border-white/5 space-y-4">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Quick Links</p>
                        <Link href={`/${locale}/dashboard/integrations`} className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-blue-400">
                            <Zap className="h-3.5 w-3.5" /> Dashboard Integrations
                        </Link>
                        <Link href={`/${locale}/docs#api-reference`} className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-purple-400">
                            <Globe className="h-3.5 w-3.5" /> Full API Spec
                        </Link>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 space-y-24 max-w-4xl">
                    
                    {/* Header / Category 1 */}
                    <section id="shopify" className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            <span className="px-4 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20">Category 1</span>
                            <h1 className="text-5xl md:text-7xl font-black tracking-tighter">
                                {dict.integrationsPage?.shopifyTitle} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-500 italic">Integration</span>
                            </h1>
                            <p className="text-gray-400 text-lg max-w-2xl font-medium">
                                {dict.integrationsPage?.shopifyDesc}
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                            <div className="p-6 rounded-[32px] bg-white/[0.02] border border-white/5 space-y-4">
                                <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                                    <Zap className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold">One-Click Install</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Automated product sync and theme integration for Shopify stores via our dedicated app.
                                </p>
                            </div>
                            <div className="p-6 rounded-[32px] bg-white/[0.02] border border-white/5 space-y-4">
                                <div className="h-12 w-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-400">
                                    <Globe className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold">Live Sync</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Your inventory and credits are always in sync between DrOutfit and Shopify.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Widget Integration */}
                    <section id="widget" className="space-y-8">
                        <div className="space-y-4">
                            <span className="px-4 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest border border-amber-500/20">NEW</span>
                            <h2 className="text-3xl font-black italic tracking-tight">{dict.docsPage?.widget || "Add Try-On Button"}</h2>
                            <p className="text-gray-400 font-medium">Add a "Try-On" button to any store platform in seconds using our universal widget.</p>
                        </div>

                        <div className="bg-[#0D1117] rounded-[32px] border border-white/5 overflow-hidden">
                            <div className="p-8 space-y-6">
                                <p className="text-sm text-gray-300">
                                    To show the AI Try-On tool on your store, simply link to the following URL pattern. If the product isn't already in our database, we will dynamically use the image and name provided in the URL.
                                </p>

                                <div className="bg-blue-600/5 border border-blue-600/20 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 group">
                                    <div className="h-14 w-14 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20 group-hover:scale-110 transition-transform">
                                        <Database className="h-6 w-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-white italic uppercase mb-1 tracking-tight">Zero Configuration Needed</h4>
                                        <p className="text-xs text-gray-400 leading-relaxed font-medium">
                                            Our engine is designed to be plug-and-play. You <span className="text-blue-400 font-bold">don't need to manually upload</span> your products to our dashboard. Simply pass your store's product image URL and title directly to the widget, and we'll handle the rest in real-time.
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-xs font-black text-gray-500 uppercase tracking-widest">
                                        <Code className="h-4 w-4" /> URL Pattern
                                    </div>
                                    <div className="p-4 bg-white/[0.02] rounded-xl font-mono text-xs text-blue-400 break-all border border-white/5 relative group">
                                        https://droutfit.com/widget/<span className="text-orange-300">[PRODUCT_ID]</span>?m=<span className="text-green-400">[YOUR_KEY]</span>&image=<span className="text-purple-400">[IMG_URL]</span>&name=<span className="text-white">[NAME]</span>
                                        <button 
                                            onClick={() => copyToClipboard(`https://droutfit.com/widget/[PRODUCT_ID]?m=[YOUR_KEY]&image=[IMG_URL]&name=[NAME]`, 'url-p')}
                                            className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Copy className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-bold text-white">Using JS (Recommended)</h4>
                                        <pre className="p-4 bg-black/50 rounded-xl text-[10px] text-gray-400 font-mono overflow-auto leading-relaxed border border-white/5">
{`function openTryOn(id, name, img) {
  const mid = "YOUR_API_KEY"; // From Dashboard
  const url = \`https://droutfit.com/widget/\${id}?m=\${mid}&image=\${img}&name=\${name}\`;
  window.open(url, 'DrOutfit', 'width=500,height=800');
}`}
                                        </pre>
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-bold text-white">Using Iframe</h4>
                                        <pre className="p-4 bg-black/50 rounded-xl text-[10px] text-gray-400 font-mono overflow-auto leading-relaxed border border-white/5">
{`<iframe 
  src="https://droutfit.com/widget/ID?m=KEY&image=IMG"
  width="100%" 
  height="600px" 
  style="border-radius: 20px;"
></iframe>`}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* WordPress Section / Category 2 */}
                    <section id="wordpress" className="space-y-8">
                        <div className="space-y-4">
                            <span className="px-4 py-1 rounded-full bg-blue-600/10 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-600/20">Category 2</span>
                            <h2 className="text-3xl font-black italic tracking-tight">{dict.integrationsPage?.wpTitle}</h2>
                            <p className="text-gray-400 font-medium">{dict.integrationsPage?.quickGuide}</p>
                        </div>

                        <div className="bg-[#0D1117] rounded-[32px] border border-white/5 overflow-hidden">
                            <div className="p-8 space-y-4">
                                <ul className="space-y-4">
                                    {[
                                        dict.integrationsPage?.step1,
                                        dict.integrationsPage?.step2,
                                        dict.integrationsPage?.step3,
                                        dict.integrationsPage?.step4
                                    ].map((step, i) => (
                                        <li key={i} className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-all">
                                            <span className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold border border-blue-500/30">
                                                {i + 1}
                                            </span>
                                            <p className="text-gray-300 text-sm font-medium self-center">{step}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6 flex gap-4">
                            <Layers className="h-6 w-6 text-blue-400 shrink-0" />
                            <p className="text-sm text-gray-400 leading-relaxed">
                                <span className="font-bold text-white italic">WooCommerce Ready:</span> Our plugin is fully compatible with WooCommerce 8.0+, providing seamless auto-injection of the Try-On button on product pages.
                            </p>
                        </div>
                    </section>

                    {/* Direct API / Category 3 */}
                    <section id="direct-api" className="space-y-8">
                        <div className="space-y-4">
                            <span className="px-4 py-1 rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-black uppercase tracking-widest border border-purple-500/20">Category 3</span>
                            <h2 className="text-3xl font-black italic tracking-tight">{dict.integrationsPage?.apiTitle}</h2>
                            <p className="text-gray-400 font-medium">{dict.integrationsPage?.apiDesc}</p>
                        </div>

                        <div className="p-8 rounded-[40px] bg-gradient-to-br from-purple-500/5 to-blue-500/5 border border-white/5 space-y-8">
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Lock className="h-5 w-5 text-purple-400" />
                                    {dict.docsPage?.auth || "Authentication"}
                                </h3>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    To access the Direct API, you must use your secret API Key in the <code className="text-purple-400 font-bold bg-white/5 px-2 py-0.5 rounded">X-API-Key</code> header. You can manage your keys in the dashboard.
                                </p>
                            </div>

                            <div className="bg-black/40 rounded-3xl p-6 border border-white/5 space-y-4">
                                <div className="flex items-center gap-3 text-xs font-black text-gray-500 uppercase tracking-widest">
                                    <Terminal className="h-4 w-4" /> Header Example
                                </div>
                                <div className="p-4 bg-white/[0.02] rounded-xl font-mono text-sm text-gray-300">
                                    <span className="text-blue-400">X-API-Key:</span> <span className="text-orange-300">dr_c65...fd2e</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* API Reference / Category 4 */}
                    <section id="api-reference" className="space-y-8">
                        <div className="space-y-4">
                            <span className="px-4 py-1 rounded-full bg-orange-500/10 text-orange-400 text-[10px] font-black uppercase tracking-widest border border-orange-500/20">Category 4</span>
                            <h2 className="text-3xl font-black italic tracking-tight">{dict.docsPage?.apiTitle}</h2>
                            <p className="text-gray-400 font-medium">{dict.docsPage?.apiDesc}</p>
                        </div>

                        <div className="space-y-6">
                            <div className="p-8 rounded-[40px] bg-white/[0.01] border border-white/5 space-y-8">
                                <div className="flex flex-wrap items-center gap-4">
                                    <span className="px-4 py-1.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest">POST</span>
                                    <code className="text-gray-300 font-bold bg-white/5 px-4 py-1.5 rounded-lg text-sm">/api/virtual-try-on</code>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">{dict.docsPage.parameters}</h4>
                                    <div className="grid grid-cols-1 gap-3">
                                        {[
                                            { name: "productId", desc: dict.docsPage.fields.productId, type: "string (UUID)", required: true },
                                            { name: "imageUrls", desc: "Array of [userPhotoUrl, garmentUrl]", type: "string[]", required: true },
                                            { name: "shop", desc: dict.docsPage.fields.shop, type: "string (domain)", required: false }
                                        ].map(param => (
                                            <div key={param.name} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 gap-2">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-mono text-blue-400 font-bold text-sm">{param.name}</span>
                                                    {param.required && <span className="text-[10px] text-red-500 font-bold opacity-50 underline decoration-red-500/50 uppercase tracking-tighter">Required</span>}
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-[11px] text-gray-600 font-mono italic">{param.type}</span>
                                                    <p className="text-xs text-gray-400 font-medium">{param.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Postman Collection */}
                    <section id="postman-legacy" className="space-y-8">
                        <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="space-y-4">
                                <div className="h-14 w-14 rounded-3xl bg-[#FF6C37]/10 flex items-center justify-center text-[#FF6C37]">
                                    <Globe className="h-8 w-8" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold">{dict.docsPage.postmanTitle}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed font-medium">
                                        {dict.docsPage.importInstructions}
                                    </p>
                                </div>
                            </div>
                            
                            <a 
                                href="/postman_collection.json" 
                                download="droutfit_api.json"
                                className="px-8 py-4 rounded-2xl bg-[#FF6C37] hover:bg-[#e65b2a] text-white font-bold text-sm transition-all shadow-xl shadow-[#FF6C37]/20 flex items-center gap-2 group"
                            >
                                <Copy className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                                {dict.docsPage.downloadPostman}
                            </a>
                        </div>
                    </section>

                </main>
            </div>

            <footer className="border-t border-white/10 bg-[#050608] py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-black uppercase tracking-widest text-gray-600">
                    <p>© {new Date().getFullYear()} Droutfit. {dict.common.allRightsReserved_}</p>
                    <LanguageSwitcher dict={dict} />
                </div>
            </footer>
        </div>
    )
}
