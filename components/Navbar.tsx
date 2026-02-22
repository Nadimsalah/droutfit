"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, X, User, LayoutDashboard, Plus, CreditCard, LogOut, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);

        // Check initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        // Close dropdown when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            subscription.unsubscribe();
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.refresh();
        setIsProfileOpen(false);
    };

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
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || isOpen ? 'bg-[#0B0E14]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl' : 'bg-[#0B0E14]/50 backdrop-blur-md border-b border-white/5'}`}>
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
                        {!user ? (
                            <>
                                <Link href="/login" className="text-sm font-medium text-white hover:text-purple-400 transition-colors">
                                    Sign In
                                </Link>
                                <Link href="/dashboard" className="bg-white text-black px-5 py-2.5 rounded-full text-sm font-bold hover:bg-gray-200 transition-all flex items-center gap-2 group hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                                    Get Started
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                                </Link>
                            </>
                        ) : (
                            <div className="relative" ref={profileRef}>
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full hover:bg-white/10 transition-all group"
                                >
                                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white uppercase overflow-hidden">
                                        {user.email?.substring(0, 2) || <User className="h-4 w-4" />}
                                    </div>
                                    <span className="text-sm font-bold text-white max-w-[100px] truncate">{user.email?.split('@')[0]}</span>
                                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Profile Dropdown */}
                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-3 w-56 bg-[#13171F] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-[100]">
                                        <div className="p-2 space-y-1">
                                            <Link
                                                href="/dashboard"
                                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                <LayoutDashboard className="h-4 w-4 text-blue-400" />
                                                Dashboard
                                            </Link>
                                            <Link
                                                href="/dashboard/products/add"
                                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                <Plus className="h-4 w-4 text-green-400" />
                                                Add Products
                                            </Link>
                                            <Link
                                                href="/dashboard/billing"
                                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                <CreditCard className="h-4 w-4 text-purple-400" />
                                                Billing
                                            </Link>
                                            <div className="h-px bg-white/5 my-1 mx-2" />
                                            <button
                                                onClick={handleSignOut}
                                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-400/10 transition-colors"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
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
                        {!user ? (
                            <>
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
                                    className="w-full py-4 rounded-xl bg-white text-black text-center font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                                >
                                    Get Started
                                    <ArrowRight className="h-5 w-5" />
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/dashboard"
                                    onClick={() => setIsOpen(false)}
                                    className="w-full py-4 rounded-xl border border-white/10 text-center font-bold text-white flex items-center justify-center gap-3"
                                >
                                    <LayoutDashboard className="h-5 w-5" />
                                    Dashboard
                                </Link>
                                <Link
                                    href="/dashboard/products/add"
                                    onClick={() => setIsOpen(false)}
                                    className="w-full py-4 rounded-xl border border-white/10 text-center font-bold text-white flex items-center justify-center gap-3"
                                >
                                    <Plus className="h-5 w-5" />
                                    Add Products
                                </Link>
                                <button
                                    onClick={() => {
                                        handleSignOut();
                                        setIsOpen(false);
                                    }}
                                    className="w-full py-4 rounded-xl bg-red-500/10 text-red-400 text-center font-bold flex items-center justify-center gap-3"
                                >
                                    <LogOut className="h-5 w-5" />
                                    Sign Out
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
