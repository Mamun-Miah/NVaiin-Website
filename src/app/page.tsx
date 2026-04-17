'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, ChevronRight, ChevronDown, Instagram } from 'lucide-react';
import gsap from 'gsap';

import { SplitTextReveal } from '@/components/animations/SplitTextReveal';
import { MagneticButton } from '@/components/animations/MagneticButton';
import { ParallaxImage } from '@/components/animations/ParallaxImage';
import { RevealSection } from '@/components/animations/RevealSection';
import { TextScramble } from '@/components/animations/TextScramble';

// ─── Constants ───────────────────────────────────────────────
const LOGO_URL =
  'https://www.nvaiin.com/cdn/shop/files/Happy_N_Vaiin_23_x_19_in_11.png?v=1701494400';
const WHITE_TEE =
  'https://www.nvaiin.com/cdn/shop/files/PhotoRoom_20231204_005221.jpg?v=1701670313';
const BLACK_TEE =
  'https://www.nvaiin.com/cdn/shop/files/PhotoRoom_20231203_141648.jpg?v=1701631462';

const MARQUEE_TEXT =
  'NOT MADE IN VAIN ✦ CONSCIOUS FASHION ✦ 02.22.23 ✦ WEAR WITH PURPOSE ✦ ';

const LOOKBOOK_ITEMS = [
  { image: WHITE_TEE, name: 'N\'VAIIN WHITE TEE', limited: true, tall: true },
  { image: BLACK_TEE, name: 'N\'VAIIN BLACK TEE', limited: true, tall: false },
  { image: WHITE_TEE, name: 'ESSENTIAL CREWNECK', limited: false, tall: false },
  { image: BLACK_TEE, name: 'DARK SIDE TEE', limited: true, tall: true },
  { image: WHITE_TEE, name: 'PURPOSE TEE', limited: false, tall: false },
  { image: BLACK_TEE, name: 'SIGNATURE BLACK', limited: false, tall: false },
];

const INSTAGRAM_IMAGES = [WHITE_TEE, BLACK_TEE, WHITE_TEE, BLACK_TEE, WHITE_TEE, BLACK_TEE];

const WAVEFORM_HEIGHTS = Array.from({ length: 32 }, (_, i) =>
  Math.round((Math.sin(i * 0.4) * 30 + Math.cos(i * 0.7) * 20 + 40) * 10) / 10
);

const STATS = [
  { value: '02.22.23', label: 'FOUNDED' },
  { value: '100%', label: 'CONSCIOUS' },
  { value: '0', label: 'COMPROMISE' },
];

// ─── Animation Variants ──────────────────────────────────────
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

// ─── Viewport Config ─────────────────────────────────────────
const viewOnce = { once: true, margin: '-100px' as const };

// ─── Star Field Config ───────────────────────────────────────
const STARS = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: `${Math.round(((i * 37 + 13) % 100))}%`,
  top: `${Math.round(((i * 53 + 7) % 100))}%`,
  size: Math.round((i % 3) + 1), // 1-3px
  delay: i * 0.3,
  duration: (i % 4) + 3, // 3-6s
}));

// ─── Section 1: Fullscreen Hero ──────────────────────────────
function HeroSection() {
  const gradientRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (gradientRef.current) {
        gsap.set(gradientRef.current, { y: window.scrollY * 0.3 });
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center bg-nv-black overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-50 pointer-events-none"
      >
        <source src="/video.mov" />
      </video>

      {/* Background gradient — GSAP parallax */}
      <div
        ref={gradientRef}
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.06)_0%,transparent_70%)] pointer-events-none"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-nv-black pointer-events-none" />

      {/* CSS-only star field */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {STARS.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-nv-gold/20 animate-pulse"
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
        {/* Logo entrance — fades in first, before title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <Image
            src={LOGO_URL}
            alt="N'VAIIN Logo"
            width={80}
            height={66}
            unoptimized
            className="mb-8 mx-auto opacity-80"
          />
        </motion.div>

        <SplitTextReveal
          text="N'VAIIN"
          as="h1"
          animation="chars"
          trigger="onMount"
          stagger={0.08}
          className="font-anton text-[6rem] sm:text-[8rem] md:text-[10rem] lg:text-[14rem] xl:text-[16rem] uppercase tracking-tight text-nv-white leading-[0.85] select-none"
        />

        <motion.p
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 1.2, duration: 0.8 }}
          className="font-bebas text-lg sm:text-xl md:text-2xl tracking-[0.4em] text-nv-gold mt-6"
        >
          NOT MADE IN VAIN
        </motion.p>

        {/* CTA Buttons — MagneticButton */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 1.6, duration: 0.6 }}
          className="mt-10 flex flex-col sm:flex-row gap-4"
        >
          <MagneticButton as="div" className="inline-block">
            <Link
              href="/shop"
              className="bg-nv-gold text-nv-black font-anton tracking-wider px-8 py-4 text-sm sm:text-base hover:scale-105 transition-transform duration-300 text-center cursor-hover block"
            >
              SHOP THE DROP
            </Link>
          </MagneticButton>
          <MagneticButton as="div" className="inline-block">
            <Link
              href="/lookbook"
              className="border border-nv-gold text-nv-gold font-anton tracking-wider px-8 py-4 text-sm sm:text-base hover:bg-nv-gold hover:text-nv-black transition-all duration-300 text-center cursor-hover block"
            >
              VIEW LOOKBOOK
            </Link>
          </MagneticButton>
        </motion.div>
      </div>

      {/* Sacred Timestamp */}
      <motion.p
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-28 left-6 sm:left-8 font-mono-brand text-[10px] sm:text-xs text-nv-fog/60 tracking-wider"
      >
        02/22/2023 — 2:22PM
      </motion.p>

      {/* Enhanced Scroll Indicator */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        transition={{ delay: 2.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="font-bebas text-[10px] tracking-[0.3em] text-nv-gold/60">
          SCROLL
        </span>
        <div className="relative flex flex-col items-center">
          <div className="w-px h-10 bg-gradient-to-b from-nv-gold/60 to-nv-gold/10" />
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown size={14} className="text-nv-gold/60" strokeWidth={1.5} />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

// ─── Section 2: Manifesto Marquee ────────────────────────────
function ManifestoMarquee() {
  return (
    <section className="py-4 bg-nv-black border-y border-nv-smoke overflow-hidden">
      <div className="animate-marquee flex whitespace-nowrap">
        <span className="font-bebas text-base sm:text-lg tracking-[0.2em] text-nv-white pr-4">
          {MARQUEE_TEXT}
        </span>
        <span className="font-bebas text-base sm:text-lg tracking-[0.2em] text-nv-white pr-4">
          {MARQUEE_TEXT}
        </span>
        <span className="font-bebas text-base sm:text-lg tracking-[0.2em] text-nv-white pr-4">
          {MARQUEE_TEXT}
        </span>
        <span className="font-bebas text-base sm:text-lg tracking-[0.2em] text-nv-white pr-4">
          {MARQUEE_TEXT}
        </span>
      </div>
    </section>
  );
}

// ─── Section 3: Featured Drop ────────────────────────────────
function FeaturedDropSection() {
  return (
    <RevealSection direction="up">
      <section className="py-16 sm:py-24 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left — Product Image (ParallaxImage) */}
          <div className="relative group overflow-hidden">
            <div className="relative aspect-[3/4] bg-nv-concrete overflow-hidden">
              <ParallaxImage
                src={WHITE_TEE}
                alt="N'VAIIN Signature White Tee"
                fill
                unoptimized
                speed={0.08}
                className="relative aspect-[3/4] bg-nv-concrete"
              />
            </div>
            <span className="absolute top-4 left-4 bg-nv-red text-white font-bebas text-xs px-3 py-1 tracking-[0.15em] z-10">
              LIMITED
            </span>
          </div>

          {/* Right — Product Details */}
          <div className="flex flex-col">
            <span className="font-bebas tracking-[0.3em] text-nv-fog text-xs sm:text-sm">
              FEATURED DROP
            </span>
            <h2 className="font-anton text-3xl sm:text-4xl md:text-5xl uppercase mt-2 sm:mt-3 text-nv-white">
              N&apos;VAIIN WHITE TEE
            </h2>
            <span className="font-mono-brand text-xl sm:text-2xl text-nv-gold mt-4">
              $44.99
            </span>
            <p className="font-mono-brand text-xs sm:text-sm text-nv-fog mt-4 leading-relaxed max-w-md">
              The essential. Heavyweight cotton, box-cut silhouette, and the mark
              of purpose. Every thread tells a story — this one says &quot;I was
              made with intention.&quot;
            </p>
            <div className="mt-8">
              <MagneticButton as="div" className="inline-block">
                <Link
                  href="/shop"
                  className="inline-block bg-nv-gold text-nv-black font-anton tracking-wider px-8 py-3 text-sm sm:text-base hover:scale-105 transition-transform duration-300 cursor-hover"
                >
                  SHOP NOW
                </Link>
              </MagneticButton>
            </div>

            {/* Quick Stats */}
            <div className="mt-10 pt-6 border-t border-nv-smoke grid grid-cols-3 gap-4">
              <div>
                <span className="font-bebas text-[10px] sm:text-xs tracking-wider text-nv-fog block">
                  MATERIAL
                </span>
                <span className="font-mono-brand text-xs sm:text-sm text-nv-white mt-1 block">
                  100% Cotton
                </span>
              </div>
              <div>
                <span className="font-bebas text-[10px] sm:text-xs tracking-wider text-nv-fog block">
                  WEIGHT
                </span>
                <span className="font-mono-brand text-xs sm:text-sm text-nv-white mt-1 block">
                  240 GSM
                </span>
              </div>
              <div>
                <span className="font-bebas text-[10px] sm:text-xs tracking-wider text-nv-fog block">
                  FIT
                </span>
                <span className="font-mono-brand text-xs sm:text-sm text-nv-white mt-1 block">
                  Box Cut
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </RevealSection>
  );
}

// ─── Section 4: Brand Statement ──────────────────────────────
function BrandStatementSection() {
  return (
    <section className="py-20 sm:py-32 px-4 text-center bg-nv-black">
      {/* Top Diagonal Line */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        viewport={viewOnce}
        className="w-32 h-px bg-nv-gold mx-auto rotate-[-2deg] mb-12 sm:mb-16"
      />

      {/* Pull Quote — SplitTextReveal */}
      <SplitTextReveal
        text="Style is a reflection of values."
        as="h2"
        animation="words"
        trigger="onScroll"
        className="font-anton text-3xl sm:text-4xl md:text-6xl lg:text-7xl uppercase max-w-5xl mx-auto text-nv-white leading-[1.1]"
      />

      {/* Mission + Stats Grid — RevealSection */}
      <RevealSection direction="up">
        <div className="mt-12 sm:mt-16 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 text-left">
          {/* Mission Paragraph */}
          <div className="flex flex-col justify-center">
            <span className="font-bebas tracking-[0.3em] text-nv-gold text-xs mb-4">
              OUR MISSION
            </span>
            <p className="font-mono-brand text-xs sm:text-sm text-nv-fog leading-relaxed">
              N&apos;VAIIN was born from the conviction that every garment carries
              weight — not just fabric, but intention. We don&apos;t follow trends.
              We build pieces that outlast seasons, rooted in consciousness and
              crafted with purpose. When you wear N&apos;VAIIN, you&apos;re not
              just wearing a brand — you&apos;re wearing a declaration.
            </p>
          </div>

          {/* Stats */}
          <div className="flex flex-col gap-6 sm:gap-8 justify-center">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex items-baseline gap-4">
                <span className="font-anton text-3xl sm:text-4xl text-nv-gold">
                  {stat.value}
                </span>
                <span className="font-bebas tracking-[0.2em] text-nv-fog text-sm">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* Bottom Diagonal Line */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        viewport={viewOnce}
        className="w-32 h-px bg-nv-gold mx-auto rotate-[-2deg] mt-12 sm:mt-16"
      />
    </section>
  );
}

// ─── Section 5: Lookbook Grid ────────────────────────────────
function LookbookGrid() {
  return (
    <section className="py-16 sm:py-24 px-4 max-w-7xl mx-auto">
      {/* Header — SplitTextReveal for title */}
      <div className="mb-10 sm:mb-12 flex items-end justify-between">
        <SplitTextReveal
          text="THE LOOKBOOK"
          as="h2"
          animation="words"
          trigger="onScroll"
          className="font-anton text-4xl sm:text-5xl md:text-7xl text-nv-white"
        />
        <Link
          href="/lookbook"
          className="hidden sm:inline-flex items-center gap-2 font-bebas text-sm tracking-[0.15em] text-nv-gold hover:text-nv-white transition-colors duration-300 cursor-hover"
        >
          VIEW ALL <ChevronRight size={16} />
        </Link>
      </div>

      {/* Grid — Framer Motion stagger */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewOnce}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {LOOKBOOK_ITEMS.map((item, i) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              className={`relative group overflow-hidden bg-nv-concrete ${
                item.tall ? 'aspect-[3/4]' : 'aspect-square'
              }`}
            >
              <Image
                src={item.image}
                alt={item.name}
                fill
                unoptimized
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/70 transition-all duration-500 flex flex-col items-center justify-center translate-y-full group-hover:translate-y-0">
                <span className="font-anton text-xl sm:text-2xl uppercase text-nv-white tracking-wider">
                  {item.name}
                </span>
                <span className="font-bebas text-xs tracking-[0.3em] text-nv-gold mt-2">
                  VIEW PIECE
                </span>
              </div>

              {/* Limited Badge */}
              {item.limited && (
                <span className="absolute top-3 left-3 bg-nv-red text-white font-bebas text-[10px] px-2.5 py-0.5 tracking-[0.15em] z-10">
                  LIMITED
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Mobile "View All" */}
      <div className="mt-8 sm:hidden text-center">
        <Link
          href="/lookbook"
          className="inline-flex items-center gap-2 font-bebas text-sm tracking-[0.15em] text-nv-gold hover:text-nv-white transition-colors duration-300 cursor-hover"
        >
          VIEW ALL LOOKBOOK <ChevronRight size={16} />
        </Link>
      </div>
    </section>
  );
}

// ─── Section 6: Music / Vibes Player ─────────────────────────
function MusicVibesSection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrambleActive, setScrambleActive] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  };

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setScrambleActive(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <RevealSection direction="up">
      <section
        ref={sectionRef}
        className="py-16 sm:py-24 bg-nv-black border-y border-nv-smoke"
      >
        <audio ref={audioRef} src="/song.mp3" loop onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />
        <div className="max-w-4xl mx-auto px-4 sm:px-8 flex flex-col md:flex-row items-center gap-8 sm:gap-12">
          {/* Vinyl Record */}
          <div className="relative flex-shrink-0">
            <div
              className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full border-[3px] border-nv-gold/20 flex items-center justify-center relative ${
                isPlaying ? 'animate-vinyl' : ''
              }`}
              style={{ boxShadow: '0 0 40px rgba(201,168,76,0.08)' }}
            >
              {/* Grooves */}
              <div className="absolute inset-3 rounded-full border border-nv-gold/10" />
              <div className="absolute inset-6 rounded-full border border-nv-gold/10" />
              <div className="absolute inset-9 rounded-full border border-nv-gold/15" />
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-nv-gold flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-nv-black" />
              </div>
            </div>
          </div>

          {/* Track Info */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="font-anton text-2xl sm:text-3xl md:text-4xl text-nv-white">
              {scrambleActive ? (
                <TextScramble text="THE SOUND OF N'VAIIN" />
              ) : (
                '\u00A0'
              )}
            </h2>
            <p className="font-mono-brand text-sm text-nv-fog mt-2">
              NOW PLAYING: <span className="text-nv-white">Rideaux</span>
            </p>

            {/* Controls */}
            <div className="mt-6 flex items-center gap-4 justify-center md:justify-start">
              <button
                onClick={togglePlay}
                className="flex items-center gap-2 font-bebas text-sm tracking-[0.2em] text-nv-gold border border-nv-gold px-6 py-2 hover:bg-nv-gold hover:text-nv-black transition-all duration-300 cursor-hover"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                {isPlaying ? 'PAUSE' : 'PLAY'}
              </button>
            </div>

            {/* Waveform Decoration */}
            <div className="mt-6 flex items-end gap-[3px] h-10 justify-center md:justify-start">
              {WAVEFORM_HEIGHTS.map((h, i) => (
                <div
                  key={i}
                  className={`w-[3px] rounded-full transition-colors duration-300 ${
                    isPlaying ? 'bg-nv-gold/40' : 'bg-nv-gold/15'
                  }`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </RevealSection>
  );
}

// ─── Section 7: Instagram Feed Strip ─────────────────────────
function InstagramFeedSection() {
  return (
    <RevealSection direction="up">
      <section className="py-16 sm:py-24 px-4">
        <div className="text-center mb-8 sm:mb-10">
          <span className="font-bebas tracking-[0.3em] text-nv-fog text-xs sm:text-sm">
            FOLLOW THE MOVEMENT —{' '}
            <a
              href="https://instagram.com/nvaiin"
              target="_blank"
              rel="noopener noreferrer"
              className="text-nv-gold hover:text-nv-white transition-colors duration-300 inline-flex items-center gap-1 cursor-hover"
            >
              @nvaiin <Instagram size={14} className="inline" />
            </a>
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
          {INSTAGRAM_IMAGES.map((img, i) => (
            <div
              key={i}
              className="relative aspect-square overflow-hidden group bg-nv-concrete"
            >
              <Image
                src={img}
                alt={`N'VAIIN Instagram ${i + 1}`}
                fill
                unoptimized
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 ring-0 group-hover:ring-2 ring-nv-gold transition-all duration-300" />
              {/* Instagram overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                <Instagram
                  size={24}
                  className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  strokeWidth={1.5}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </RevealSection>
  );
}

// ─── Section 8: Newsletter CTA ───────────────────────────────
function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch {
      // Silent fail — just keep the form
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 sm:py-24 px-4 bg-gradient-to-r from-nv-red/20 via-nv-black to-nv-gold/10">
      <div className="text-center max-w-xl mx-auto">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 rounded-full border-2 border-nv-gold flex items-center justify-center">
                <span className="text-nv-gold text-2xl">✦</span>
              </div>
              <h2 className="font-anton text-3xl sm:text-4xl md:text-6xl uppercase text-nv-white">
                WELCOME TO THE MOVEMENT.
              </h2>
              <p className="font-mono-brand text-sm text-nv-fog mt-2">
                You&apos;re in. Watch your inbox for the next drop.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <SplitTextReveal
                text="JOIN THE MOVEMENT"
                as="h2"
                animation="words"
                trigger="onScroll"
                className="font-anton text-3xl sm:text-4xl md:text-6xl uppercase text-nv-white"
              />
              <p className="font-mono-brand text-xs sm:text-sm text-nv-fog mt-4 leading-relaxed max-w-md mx-auto">
                Be the first to know about new drops, exclusive access, and the
                N&apos;VAIIN story.
              </p>

              <RevealSection direction="up">
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col sm:flex-row gap-2 mt-8 max-w-md mx-auto"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="flex-1 bg-nv-smoke border border-nv-smoke text-nv-white font-mono-brand text-sm px-4 py-3 focus:border-nv-gold focus:outline-none transition-colors duration-300 placeholder:text-nv-fog/50"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-nv-gold text-nv-black font-anton tracking-wider px-6 py-3 text-sm hover:bg-nv-gold/90 transition-colors duration-300 disabled:opacity-50 cursor-hover whitespace-nowrap"
                  >
                    {loading ? '...' : 'SUBSCRIBE'}
                  </button>
                </form>

                <p className="font-mono-brand text-[10px] sm:text-xs text-nv-fog mt-4">
                  No spam. Only drops.
                </p>
              </RevealSection>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

// ─── Main Page ───────────────────────────────────────────────
export default function Home() {
  return (
    <>
      {/* Section 1 — Fullscreen Hero */}
      <HeroSection />

      {/* Section 2 — Manifesto Marquee */}
      <ManifestoMarquee />

      {/* Section 3 — Featured Drop */}
      <FeaturedDropSection />

      {/* Section 4 — Brand Statement */}
      <BrandStatementSection />

      {/* Section 5 — Lookbook Grid */}
      <LookbookGrid />

      {/* Section 6 — Music / Vibes Player */}
      <MusicVibesSection />

      {/* Section 7 — Instagram Feed Strip */}
      <InstagramFeedSection />

      {/* Section 8 — Newsletter CTA */}
      <NewsletterSection />
    </>
  );
}
