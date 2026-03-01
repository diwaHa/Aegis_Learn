"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, Menu, X, ArrowRight } from "lucide-react";
import Link from "next/link";

const navLinks = [
    { name: "Features", href: "#features" },
    { name: "Architecture", href: "#architecture" },
    { name: "Roadmap", href: "#roadmap" },
    { name: "Team", href: "#team" },
];

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "py-3 bg-background/80 backdrop-blur-lg border-b border-white/5" : "py-6 bg-transparent"
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-red-accent flex items-center justify-center transition-transform group-hover:rotate-12">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">
                        Aegis<span className="text-red-accent">Learn</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="text-sm font-medium text-muted-foreground hover:text-white transition-colors"
                        >
                            {link.name}
                        </a>
                    ))}
                    <div className="w-px h-4 bg-white/10 mx-2" />
                    <Link href="/chat">
                        <Button
                            variant="ghost"
                            className="text-muted-foreground hover:text-white hover:bg-white/5"
                        >
                            Sign In
                        </Button>
                    </Link>
                    <Link href="/chat">
                        <Button className="bg-red-accent hover:bg-red-accent-dark text-white rounded-xl px-5 group">
                            Launch App
                            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </nav>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden p-2 rounded-lg bg-white/5"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-background border-b border-white/5 overflow-hidden"
                    >
                        <div className="px-6 py-8 flex flex-col gap-6">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className="text-lg font-medium"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.name}
                                </a>
                            ))}
                            <Separator className="bg-white/5" />
                            <Link href="/chat" onClick={() => setIsMobileMenuOpen(false)}>
                                <Button className="w-full bg-red-accent hover:bg-red-accent-dark text-white py-6 rounded-2xl text-lg">
                                    Launch AI Interface
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}

function Separator({ className }: { className?: string }) {
    return <div className={`h-px w-full ${className}`} />;
}
