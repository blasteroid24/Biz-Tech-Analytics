'use client'
import React, { useEffect, useRef, useState } from 'react';
import { CiMenuBurger } from "react-icons/ci";
import { IoCloseSharp } from "react-icons/io5";
import { gsap } from 'gsap';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const Header = () => {
    const headerRef = useRef<HTMLDivElement>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const currentPath = usePathname()

    useEffect(() => {
        gsap.fromTo(
            headerRef.current,
            { y: -100, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: 'power4.out' }
        );
    }, []);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Features', path: '/features' },
        { name: 'About', path: '/about' },
        { name: 'Contact Us', path: '/contact' },
    ];

    return (
        <header
            ref={headerRef}
            className="fixed top-0 left-0 w-full z-50 flex justify-center items-center"
        >
            <div className="w-full flex items-center justify-between px-6 py-3 border border-white/10 bg-black/40 backdrop-blur-md shadow-2xl relative">

                {/* Left: Logo */}
                <div className="flex items-center gap-3 cursor-pointer">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-white/10">
                        <Image
                            src="/icon.jpg"
                            alt="logo"
                            sizes="(max-width: 768px) 32px, 64px"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <span className="text-white font-bold text-lg tracking-wider uppercase">
                        Requiem
                    </span>
                </div>

                {/* Center: Navigation */}
                <nav className="hidden md:flex items-center gap-2">
                    {navLinks.map((link) => {
                        const isActive = currentPath === link.path;
                        return (
                            <a
                                key={link.name}
                                href={link.path}
                                className={`px-5 py-2 text-sm font-medium transition-all duration-300 rounded-full border border-transparent ${isActive
                                        ? 'border-white/40 bg-white/10 text-white'
                                        : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {link.name}
                            </a>
                        );
                    })}
                </nav>

                {/* Right */}
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-6">
                        <button className="text-gray-300 text-sm font-medium hover:text-white transition-colors">
                            Login
                        </button>

                        <button className="relative group px-6 py-2 rounded-full overflow-hidden border border-lime-400/50 hover:border-lime-400 transition-all">
                            <span className="relative z-10 text-lime-400 group-hover:text-black font-semibold text-sm transition-colors duration-300">
                                Register
                            </span>
                            <div className="absolute inset-0 bg-lime-400 translate-y-[101%] group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                        </button>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden text-white p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        {isMenuOpen ? <IoCloseSharp size={24} /> : <CiMenuBurger size={24} />}
                    </button>
                </div>

                {/* Mobile Dropdown Menu */}
                {isMenuOpen && (
                    <div className="absolute top-16 left-0 w-full md:hidden flex flex-col p-4 bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl mt-2 animate-in fade-in zoom-in duration-300 origin-top">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.path}
                                onClick={() => setIsMenuOpen(false)}
                                className="px-6 py-4 text-gray-300 hover:text-lime-400 border-b border-white/5 last:border-none"
                            >
                                {link.name}
                            </a>
                        ))}
                        <div className="flex flex-col gap-3 mt-4">
                            <button className="w-full py-3 text-white border border-white/20 rounded-full">Login</button>
                            <button className="w-full py-3 bg-lime-400 text-black font-bold rounded-full">Register</button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;