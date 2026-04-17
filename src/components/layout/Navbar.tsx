'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

// Badge bounce animation
const badgeVariants = {
  initial: { scale: 0 },
  animate: {
    scale: 1,
    transition: { type: 'spring', stiffness: 500, damping: 15 },
  },
  exit: {
    scale: 0,
    transition: { duration: 0.2 },
  },
  bounce: {
    scale: [1, 1.4, 0.9, 1.1, 1],
    transition: { duration: 0.4 },
  },
};

// ─── Desktop Nav Link with active indicator + hover underline ───
function DesktopNavLink({
  href,
  label,
  isActive,
}: {
  href: string;
  label: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={`relative font-bebas text-sm tracking-[0.2em] uppercase transition-colors duration-300 cursor-hover group ${isActive ? 'text-nv-gold' : 'text-nv-white hover:text-nv-gold'
        }`}
    >
      {/* Underline bar — slides in from left on hover, always visible when active */}
      <span
        className={`absolute -bottom-1.5 left-0 h-[2px] bg-nv-gold transition-all duration-300 ease-out ${isActive
          ? 'w-full opacity-100'
          : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-100'
          }`}
      />
      {label}
    </Link>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [badgeKey, setBadgeKey] = useState(0);
  const totalItems = useCartStore((s) => s.totalItems);
  const openCart = useCartStore((s) => s.openCart);
  const pathname = usePathname();
  const prevCountRef = useRef(0);

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

  // Bounce badge when count changes
  useEffect(() => {
    if (count !== prevCountRef.current) {
      const id = requestAnimationFrame(() => {
        setBadgeKey((k) => k + 1);
      });
      prevCountRef.current = count;
      return () => cancelAnimationFrame(id);
    }
    return undefined;
  }, [count]);

  return (
    <>
      <header
        className={` top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
          ? 'bg-nv-black/95 backdrop-blur-md shadow-lg shadow-black/20'
          : 'bg-transparent'
          }`}
      >
        {/* Account for announcement bar height */}
        <nav className="flex items-center justify-between mt-[5px] px-4 sm:px-6 lg:px-10 h-16 lg:h-16">
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
            {NAV_LINKS.map((link) => {
              // Exact match for root, prefix match for others
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href);

              return (
                <DesktopNavLink
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  isActive={isActive}
                />
              );
            })}
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
              <AnimatePresence mode="popLayout">
                {count > 0 && (
                  <motion.span
                    key={`badge-${badgeKey}`}
                    variants={badgeVariants}
                    initial="initial"
                    animate="bounce"
                    exit="exit"
                    className="absolute -top-0.5 -right-0.5 bg-nv-gold text-nv-black text-[10px] font-bebas font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full leading-none"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
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
            {/* Gold gradient accent line at top */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-nv-gold to-transparent" />

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
              {NAV_LINKS.map((link) => {
                const isActive =
                  link.href === '/'
                    ? pathname === '/'
                    : pathname.startsWith(link.href);

                return (
                  <motion.div key={link.href} variants={mobileLinkVariants}>
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`font-anton text-3xl sm:text-4xl tracking-[0.15em] uppercase transition-colors duration-300 cursor-hover relative ${isActive
                        ? 'text-nv-gold'
                        : 'text-nv-white hover:text-nv-gold'
                        }`}
                    >
                      {/* Active underline for mobile */}
                      {isActive && (
                        <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-nv-gold" />
                      )}
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}
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
