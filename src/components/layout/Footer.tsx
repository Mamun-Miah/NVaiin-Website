import Link from 'next/link';
import { Instagram, ExternalLink } from 'lucide-react';

const LOGO_URL =
  'https://www.nvaiin.com/cdn/shop/files/Happy_N_Vaiin_23_x_19_in_11.png?v=1701494400';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/lookbook', label: 'Lookbook' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/faqs', label: 'FAQs' },
];

const SOCIAL_LINKS = [
  {
    href: 'https://instagram.com/nvaiin',
    label: 'Instagram',
    icon: Instagram,
  },
  {
    href: 'https://x.com/nvaiin',
    label: 'X / Twitter',
    icon: ExternalLink,
  },
  {
    href: 'https://tiktok.com/@nvaiin',
    label: 'TikTok',
    icon: ExternalLink,
  },
];

export function Footer() {
  return (
    <footer className="bg-nv-concrete border-t border-nv-smoke">
      {/* Main Grid */}
      <div className="px-4 sm:px-6 lg:px-10 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Column 1 — Brand */}
          <div className="flex flex-col gap-4">
            <img
              src={LOGO_URL}
              alt="N'VAIIN"
              height={45}
              width={55}
              className="h-[45px] w-auto object-contain"
            />
            <p className="font-bebas text-lg tracking-[0.2em] text-nv-gold">
              NOT MADE IN VAIN
            </p>
            <p className="font-syne text-sm text-nv-fog leading-relaxed max-w-xs">
              Revolutionary streetwear born from the belief that style should be
              a reflection of values. Conscious fashion. Timeless design.
            </p>
          </div>

          {/* Column 2 — Links */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bebas text-base tracking-[0.15em] text-nv-white">
              NAVIGATE
            </h3>
            <ul className="flex flex-col gap-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-syne text-sm text-nv-fog hover:text-nv-gold transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Social */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bebas text-base tracking-[0.15em] text-nv-white">
              CONNECT
            </h3>
            <ul className="flex flex-col gap-2.5">
              {SOCIAL_LINKS.map((social) => {
                const Icon = social.icon;
                return (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 font-syne text-sm text-nv-fog hover:text-nv-gold transition-colors duration-300"
                    >
                      <Icon size={16} strokeWidth={1.5} />
                      {social.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Column 4 — Newsletter Preview */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bebas text-base tracking-[0.15em] text-nv-white">
              JOIN THE MOVEMENT
            </h3>
            <p className="font-syne text-sm text-nv-fog leading-relaxed max-w-xs">
              Subscribe for exclusive drops, early access, and behind-the-scenes
              content. Be the first to know.
            </p>
            <div className="mt-1 flex items-center gap-2">
              <div className="h-px flex-1 bg-nv-smoke" />
              <span className="font-mono-brand text-[10px] text-nv-gold tracking-[0.15em]">
                COMING SOON
              </span>
              <div className="h-px flex-1 bg-nv-smoke" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-nv-smoke px-4 sm:px-6 lg:px-10 py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          {/* Copyright */}
          <p className="font-mono-brand text-nv-fog tracking-wide">
            &copy; 2025 N&apos;VAIIN &mdash; All rights reserved
          </p>

          {/* Sacred Timestamp */}
          <p className="font-mono-brand text-nv-gold tracking-[0.1em]">
            EST. 02.22.23 &mdash; 2:22PM
          </p>

          {/* Legal Links */}
          <div className="flex items-center gap-4 font-mono-brand text-nv-fog">
            <Link
              href="/privacy"
              className="hover:text-nv-gold transition-colors duration-300"
            >
              Privacy Policy
            </Link>
            <Link
              href="/faqs"
              className="hover:text-nv-gold transition-colors duration-300"
            >
              FAQs
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
