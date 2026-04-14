'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/lookbook', label: 'Lookbook' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

const LOGO_URL =
  'https://www.nvaiin.com/cdn/shop/files/Happy_N_Vaiin_23_x_19_in_11.png?v=1701494400';

const mobileMenuVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

const mobileLinkVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.25 },
  },
};

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems);
  const openCart = useCartStore((s) => s.openCart);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const count = totalItems();

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-nv-black/95 backdrop-blur-md shadow-lg shadow-black/20'
            : 'bg-transparent'
        }`}
      >
        {/* Account for announcement bar height */}
        <nav className="flex items-center justify-between px-4 sm:px-6 lg:px-10 h-16 lg:h-20">
          {/* Left — Logo */}
          <Link href="/" className="flex items-center cursor-hover">
            <img
              src={LOGO_URL}
              alt="N'VAIIN"
              height={50}
              width={61}
              className="h-[50px] w-auto object-contain"
            />
          </Link>

          {/* Center — Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-bebas text-sm tracking-[0.2em] uppercase text-nv-white hover:text-nv-gold transition-colors duration-300 cursor-hover"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right — Cart + Mobile Toggle */}
          <div className="flex items-center gap-4">
            {/* Cart Icon */}
            <button
              onClick={openCart}
              className="relative p-2 text-nv-white hover:text-nv-gold transition-colors duration-300 cursor-hover"
              aria-label="Open cart"
            >
              <ShoppingBag size={22} strokeWidth={1.5} />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-nv-gold text-nv-black text-[10px] font-bebas font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full leading-none">
                  {count}
                </span>
              )}
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 text-nv-white hover:text-nv-gold transition-colors duration-300 cursor-hover"
              aria-label="Open menu"
            >
              <Menu size={24} strokeWidth={1.5} />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Full-Screen Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-[60] bg-nv-black flex flex-col items-center justify-center"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Close Button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-5 right-5 p-2 text-nv-white hover:text-nv-gold transition-colors duration-300 cursor-hover"
              aria-label="Close menu"
            >
              <X size={28} strokeWidth={1.5} />
            </button>

            {/* Mobile Nav Links */}
            <motion.div
              className="flex flex-col items-center gap-6"
              variants={mobileMenuVariants}
            >
              {NAV_LINKS.map((link) => (
                <motion.div key={link.href} variants={mobileLinkVariants}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="font-anton text-3xl sm:text-4xl tracking-[0.15em] uppercase text-nv-white hover:text-nv-gold transition-colors duration-300 cursor-hover"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* Bottom tagline */}
            <motion.p
              variants={mobileLinkVariants}
              className="absolute bottom-10 font-mono-brand text-xs text-nv-fog tracking-[0.2em]"
            >
              NOT MADE IN VAIN
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
