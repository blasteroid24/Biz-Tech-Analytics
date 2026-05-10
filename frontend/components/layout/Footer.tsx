'use client'
import { useEffect, useRef } from 'react';
import { FaXTwitter, FaLinkedin, FaInstagram, FaFacebook } from "react-icons/fa6";
import { IoIosArrowUp } from "react-icons/io";
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import Link from 'next/link';


gsap.registerPlugin(ScrollTrigger);

const Footer = () => {
    const footerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        gsap.fromTo(
            footerRef.current,
            { y: 50, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: footerRef.current,
                    start: 'top 90%',
                }
            }
        );
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const navLinks = [
        { name: 'Homepage', path: '/' },
        { name: 'Technology', path: '/technology' },
        { name: 'Features', path: '/features' },
        { name: 'About', path: '/about' },
        { name: 'Contact Us', path: '/contact' },
    ];
    return (
        <footer
            ref={footerRef}
            className="w-full bg-black/40 backdrop-blur-md border-t border-white/10 text-gray-300 py-16 px-6 md:px-12"
        >
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">

                {/*Socials */}
                <div className="md:col-span-5 flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20">
                            <Image src="/icon.jpg" alt="logo" fill className="object-cover" />
                        </div>
                        <span className="text-white font-bold text-xl tracking-tight uppercase">Requiem</span>
                    </div>

                    <p className="max-w-sm text-sm leading-relaxed text-gray-400">
                        Empowering builders with advanced cloud-native tools to improve
                        workflow efficiency and digital outcomes across the globe.
                    </p>

                    <div className="flex gap-5 items-center mt-2">
                        <FaXTwitter className="w-5 h-5 hover:text-lime-400 cursor-pointer transition-colors" />
                        <FaLinkedin className="w-5 h-5 hover:text-lime-400 cursor-pointer transition-colors" />
                        <FaInstagram className="w-5 h-5 hover:text-lime-400 cursor-pointer transition-colors" />
                        <FaFacebook className="w-5 h-5 hover:text-lime-400 cursor-pointer transition-colors" />
                    </div>

                    <button
                        onClick={scrollToTop}
                        className="flex items-center gap-3 w-fit mt-6 px-5 py-2 border border-white/20 hover:border-lime-400 hover:text-lime-400 transition-all group"
                    >
                        <IoIosArrowUp size={18} className="group-hover:-translate-y-1 transition-transform" />
                        <span className="text-xs font-bold uppercase tracking-widest">Back to Top</span>
                    </button>
                </div>

                {/*Site Map */}
                <div className="md:col-span-3 flex flex-col gap-4">
                    <h4 className="text-white font-semibold text-sm mb-2">Site Map</h4>
                    <ul className="flex flex-col gap-3 text-sm">
                        {navLinks.map((nav, index) => (
                            <li className='hover:text-lime-400 cursor-pointer transition-colors' key={index}><Link href={nav.path}>
                                {nav.name}</Link></li>
                        ))}
                    </ul>
                </div>

                {/*Legal */}
                <div className="md:col-span-4 flex flex-col gap-4">
                    <h4 className="text-white font-semibold text-sm mb-2">Legal</h4>
                    <ul className="flex flex-col gap-3 text-sm">
                        <li className="hover:text-lime-400 cursor-pointer transition-colors">Privacy Policy</li>
                        <li className="hover:text-lime-400 cursor-pointer transition-colors">Terms of Service</li>
                        <li className="hover:text-lime-400 cursor-pointer transition-colors">Compliance</li>
                    </ul>
                </div>
            </div>

            {/* Bottom Bar*/}
            <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-[0.2em] text-gray-500">
                <p>© 2026 Requiem Labs. All Rights Reserved.</p>
                <div className="flex gap-4">
                    <span className="text-lime-400/80 hover:text-lime-400 cursor-pointer">Status: Operational</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;