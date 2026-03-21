import { Code2, Globe, Layout as Wordpress, Cpu, Copy, Check, Download, ExternalLink, Zap, ShieldCheck } from "lucide-react"

export default function IntegrationPage() {
    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase flex items-center gap-4">
                    <div className="h-10 w-2 bg-indigo-600 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.5)]" />
                    Developer Portal
                </h1>
                <p className="text-gray-400 mt-2 font-medium text-lg">Integrate the DrOutfit AI engine into any platform in minutes.</p>
            </div>

            {/* Quick API Key Access */}
            <div className="bg-[#0B0E14] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <ShieldCheck className="h-32 w-32 text-indigo-500" />
                </div>
                <div className="relative z-10">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Your Universal API Access Key</p>
                    <div className="flex items-center gap-4">
                        <code className="text-2xl font-black text-indigo-400 bg-indigo-500/5 px-6 py-3 rounded-2xl border border-indigo-500/20 tracking-tight">
                            dr_8a95106b85940e83d121...
                        </code>
                        <button className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all active:scale-95 group">
                            <Copy className="h-5 w-5 text-gray-400 group-hover:text-white" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Integration Grid */}
            <div className="grid lg:grid-cols-2 gap-8">
                
                {/* Universal Widget */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <Globe className="h-6 w-6 text-blue-500" />
                        <h2 className="text-xl font-black text-white uppercase italic">1. Universal Widget</h2>
                    </div>
                    <div className="bg-[#0B0E14] border border-white/5 rounded-3xl p-8 space-y-6">
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                            <Zap className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-gray-400 leading-relaxed font-medium">
                                <span className="text-white font-black italic uppercase text-[10px]">Zero Data Sync Needed:</span> No need to manually upload products. Just pass the product image URL directly in the widget link.
                            </p>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">Add a "Try-On" button to any store platform in seconds using our universal widget pattern.</p>
                        
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">HTML / Iframe Method</span>
                            </div>
                            <div className="bg-black/50 rounded-2xl p-6 font-mono text-xs text-blue-300 border border-white/5 relative group">
                                <pre className="whitespace-pre-wrap leading-relaxed">
{`<iframe 
  src="https://droutfit.com/widget/PRODUCT_ID?m=YOUR_KEY&image=IMG_URL"
  width="100%" 
  height="600px" 
  style="border-radius: 20px;"
/>`}
                                </pre>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">JavaScript Helper</span>
                            </div>
                            <div className="bg-black/50 rounded-2xl p-6 font-mono text-xs text-indigo-300 border border-white/5">
                                <pre className="whitespace-pre-wrap leading-relaxed">
{`function openTryOn(id, name, img) {
  const mid = "YOUR_API_KEY";
  const url = \`https://droutfit.com/widget/\${id}?m=\${mid}&image=\${img}&name=\${name}\`;
  window.open(url, 'DrOutfit', 'width=500,height=800');
}`}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>

                {/* WP Plugin */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <Code2 className="h-6 w-6 text-indigo-500" />
                        <h2 className="text-xl font-black text-white uppercase italic">2. WordPress & WooCommerce</h2>
                    </div>
                    <div className="bg-[#0B0E14] border border-white/5 rounded-3xl p-8 space-y-8 h-fit">
                        <div className="flex items-center gap-6">
                            <div className="h-20 w-20 rounded-[2rem] bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                <Download className="h-8 w-8 text-indigo-500" />
                            </div>
                            <div>
                                <h4 className="text-white font-black uppercase text-sm mb-1">DrOutfit for WooCommerce</h4>
                                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Current Version: 1.0.4 • Stable</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { step: "1", title: "Download", sub: "Get the plugin ZIP" },
                                { step: "2", title: "Activate", sub: "Upload to WP Admin" },
                                { step: "3", title: "Connect", sub: "Log in with API Key" },
                                { step: "4", title: "Live", sub: "Auto-Injected buttons" }
                            ].map((item, i) => (
                                <div key={i} className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                    <div className="text-[10px] font-black text-indigo-500 mb-1 italic">STEP {item.step}</div>
                                    <div className="text-white font-black uppercase text-[10px]">{item.title}</div>
                                    <div className="text-gray-600 text-[9px] font-bold tracking-tight">{item.sub}</div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3">
                            <Download className="h-4 w-4" /> Download WooCommerce Plugin
                        </button>
                    </div>
                </div>
            </div>

            {/* Direct AI Engine API */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Cpu className="h-6 w-6 text-purple-500" />
                    <h2 className="text-xl font-black text-white uppercase italic">3. Direct AI Engine API</h2>
                </div>
                <div className="bg-[#0B0E14] border border-white/5 rounded-3xl overflow-hidden">
                    <div className="p-8 border-b border-white/5 bg-white/[0.02]">
                        <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
                            Integrate our AI virtual try-on engine directly into your custom store, Shopify, or mobile app through our high-performance REST API.
                        </p>
                    </div>
                    <div className="grid lg:grid-cols-2">
                        <div className="p-8 space-y-8 border-r border-white/5">
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Authentication</h4>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                                    <code className="text-xs text-purple-300 font-mono">X-API-Key: dr_c65...fd2e</code>
                                    <Zap className="h-4 w-4 text-purple-500" />
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Endpoint</h4>
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-black rounded-lg">POST</span>
                                    <code className="text-xs text-gray-300">/api/virtual-try-on</code>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Request Parameters</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                                        <span className="text-xs font-black text-gray-300">productId</span>
                                        <span className="text-[9px] font-bold text-gray-600 uppercase">String (UUID) Required</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                                        <span className="text-xs font-black text-gray-300">imageUrls</span>
                                        <span className="text-[9px] font-bold text-gray-600 uppercase">String[] Required</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-xs font-black text-gray-300">shop</span>
                                        <span className="text-[9px] font-bold text-gray-600 uppercase">String (Domain) Optional</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* JSON Payload Example */}
                        <div className="p-8 bg-black/40">
                             <div className="flex items-center justify-between mb-6">
                                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Request Payload</h4>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-green-500" />
                                    <span className="text-[9px] text-gray-500 font-black uppercase">JSON</span>
                                </div>
                            </div>
                            <div className="bg-black/50 rounded-2xl p-6 font-mono text-xs leading-relaxed text-purple-200 border border-white/5">
                                <pre className="whitespace-pre-wrap">
{`{
  "productId": "a4f8d...9bc",
  "imageUrls": [
    "https://store.com/user.jpg",
    "https://store.com/skirt.png"
  ],
  "shop": "boutique.com"
}`}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Support */}
            <div className="flex items-center justify-between p-8 rounded-[2rem] bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-6">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center border border-indigo-600/20">
                        <Cpu className="h-6 w-6 text-indigo-500" />
                    </div>
                    <div>
                        <h4 className="text-white font-black uppercase text-sm">Need a custom implementation?</h4>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Our engineering team is ready to assist with deep AI integrations.</p>
                    </div>
                </div>
                <button className="px-8 h-12 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-black text-white uppercase tracking-widest transition-all">
                    Contact Support
                </button>
            </div>
        </div>
    )
}
