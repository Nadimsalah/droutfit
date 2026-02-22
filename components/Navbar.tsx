"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, X } from 'lucide-react';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Lock body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    return (
        <>
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || isOpen ? 'bg-[#0B0E14]/90 backdrop-blur-md border-b border-white/10' : 'bg-transparent border-b border-transparent'}`}>
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group relative z-50">
                        <img src="/logo.png" alt="Droutfit" className="h-10 w-auto object-contain" />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {['Features', 'How it Works', 'Pricing'].map((item) => (
                            <Link
                                key={item}
                                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                                className="text-sm font-medium text-gray-400 hover:text-white transition-colors relative group"
                            >
                                {item}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all group-hover:w-full"></span>
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link href="/login" className="text-sm font-medium text-white hover:text-purple-400 transition-colors">
                            Sign In
                        </Link>
                        <Link href="/dashboard" className="bg-white text-black px-5 py-2.5 rounded-full text-sm font-bold hover:bg-gray-200 transition-all flex items-center gap-2 group hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                            Get Started
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden relative z-50 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                    >
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div className={`fixed inset-0 z-40 bg-[#0B0E14] md:hidden transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                {/* Background Blobs */}
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />

                <div className="flex flex-col items-center justify-center h-full space-y-8 p-6 relative z-10">
                    <div className="flex flex-col items-center gap-6 w-full max-w-sm">
                        {['Features', 'How it Works', 'Pricing'].map((item, i) => (
                            <Link
                                key={item}
                                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                                onClick={() => setIsOpen(false)}
                                className="text-2xl font-bold text-gray-300 hover:text-white transition-colors w-full text-center py-2 border-b border-white/5 hover:border-white/20"
                                style={{ transitionDelay: `${i * 50}ms` }}
                            >
                                {item}
                            </Link>
                        ))}
                    </div>

                    <div className="flex flex-col gap-4 w-full max-w-sm pt-8">
                        <Link
                            href="/login"
                            onClick={() => setIsOpen(false)}
                            className="w-full py-4 rounded-xl border border-white/10 text-center font-bold text-white hover:bg-white/5 transition-colors"
                        >
                            Sign In
                        </Link>
                        <Link
                            href="/dashboard"
                            onClick={() => setIsOpen(false)}
                            className="w-full py-4 rounded-xl bg-white text-black text-center font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                        >
                            Get Started
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
