
import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="border-b-4 border-black bg-white sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 hover:scale-105 transition-transform">
                    <img src="/logo.png" alt="Dr Outfit Logo" className="h-10 w-auto" />
                    <span className="text-2xl font-black uppercase italic tracking-tighter">Dr Outfit</span>
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    <Link href="#features" className="text-sm font-black uppercase hover:text-pink-600 transition-colors">Features</Link>
                    <Link href="#how-it-works" className="text-sm font-black uppercase hover:text-pink-600 transition-colors">How it Works</Link>
                    <Link href="/dashboard" className="border-2 border-black bg-yellow-400 px-6 py-2 text-sm font-black uppercase shadow-[4px_4px_0px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_black] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all">
                        Dashboard
                    </Link>
                </div>
            </div>
        </nav>
    );
}
