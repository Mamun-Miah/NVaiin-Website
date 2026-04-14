'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const fadeInUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
}

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const values = [
  {
    title: 'CONSCIOUS',
    description:
      "Every thread is a choice. N'VAIIN is built on the foundation of conscious creation — from ethically sourced materials to sustainable production practices. We believe luxury and responsibility are not mutually exclusive. Each piece carries the weight of intention, designed for those who understand that what you wear speaks volumes about what you stand for.",
  },
  {
    title: 'TIMELESS',
    description:
      'Trends fade. Purpose endures. Our designs transcend seasonal cycles, embracing a philosophy of timeless aesthetics rooted in street culture. Each garment is crafted to age with character, becoming more personal with every wear. We create pieces that will remain relevant long after the hype dies — because true style has no expiration date.',
  },
  {
    title: 'PURPOSEFUL',
    description:
      "Born on 02/22/2023 at 2:22PM — a moment of divine alignment. N'VAIIN exists not merely to clothe, but to inspire. A portion of every sale supports community initiatives and creative empowerment programs. We build bridges between fashion and purpose, proving that a brand can be both commercially viable and deeply meaningful.",
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-nv-black">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <motion.h1
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="font-anton text-5xl md:text-7xl lg:text-9xl uppercase tracking-tight"
        >
          NOT MADE IN VAIN
        </motion.h1>

        <motion.p
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 }}
          className="font-mono-brand text-nv-gold mt-8 text-sm md:text-base tracking-wider"
        >
          02/22/2023 — 2:22PM
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="w-32 h-px bg-nv-gold my-8 rotate-[-2deg]"
        />
      </section>

      {/* Brand Story Section */}
      <section className="py-20 px-4">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16"
        >
          <motion.div variants={fadeInUp} transition={{ duration: 0.8 }}>
            <p className="font-mono-brand text-nv-fog text-sm md:text-base leading-relaxed">
              N&apos;VAIIN was born from a singular belief: that fashion should be a reflection
              of values, not just aesthetics. Founded on 02/22/2023 at exactly 2:22PM — a moment
              of divine alignment that would become the sacred timestamp of a movement — this brand
              emerged from the streets with a mission far greater than clothing.
            </p>
          </motion.div>

          <motion.div variants={fadeInUp} transition={{ duration: 0.8 }}>
            <p className="font-mono-brand text-nv-fog text-sm md:text-base leading-relaxed">
              Every piece we create carries intention. From the selection of premium fabrics to the
              final stitch, N&apos;VAIIN represents the convergence of luxury streetwear and conscious
              design. We don&apos;t follow trends — we forge paths. We don&apos;t chase clout — we build
              legacy. Each garment is a statement that style and substance can coexist, that the
              clothes you wear can tell a story worth hearing.
            </p>
          </motion.div>

          <motion.div variants={fadeInUp} transition={{ duration: 0.8 }}>
            <p className="font-mono-brand text-nv-fog text-sm md:text-base leading-relaxed">
              The name itself is a declaration: Not Made In Vain. Every drop is purposeful. Every
              collaboration is meaningful. Every community initiative we support reinforces our
              commitment to being more than a brand — we are a vessel for change, a platform for
              creative expression, and a beacon for those who refuse to settle for superficiality.
            </p>
          </motion.div>

          <motion.div variants={fadeInUp} transition={{ duration: 0.8 }}>
            <p className="font-mono-brand text-nv-fog text-sm md:text-base leading-relaxed">
              We operate at the intersection of culture, consciousness, and craftsmanship. N&apos;VAIIN
              is for the architects of their own narrative — those who understand that true luxury
              is not about logos or price tags, but about the story behind what you wear and the
              values it represents. This is more than streetwear. This is a movement.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Pull Quote */}
      <section className="py-20 text-center px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="w-24 h-px bg-nv-gold mx-auto mb-10" />
        </motion.div>

        <motion.blockquote
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="font-anton text-2xl md:text-4xl lg:text-5xl text-nv-gold leading-tight max-w-4xl mx-auto"
        >
          &ldquo;N&apos;VAIIN is not merely a brand; it is a movement.&rdquo;
        </motion.blockquote>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="w-24 h-px bg-nv-gold mx-auto mt-10" />
        </motion.div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="font-anton text-4xl mb-12 text-center uppercase tracking-tight"
          >
            OUR VALUES
          </motion.h2>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {values.map((value) => (
              <motion.div
                key={value.title}
                variants={fadeInUp}
                transition={{ duration: 0.6 }}
                className="bg-nv-concrete border border-nv-smoke p-8 group hover:border-nv-gold transition-colors duration-300"
              >
                <h3 className="font-anton text-2xl text-nv-white group-hover:text-nv-gold transition-colors duration-300">
                  {value.title}
                </h3>
                <p className="font-mono-brand text-sm text-nv-fog mt-4 leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-20 text-center px-4">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-anton text-3xl md:text-5xl uppercase tracking-tight mb-8">
            JOIN THE MOVEMENT
          </h2>
          <Link
            href="/shop"
            className="inline-block bg-nv-gold text-nv-black font-anton text-2xl px-12 py-4 uppercase tracking-wider hover:bg-nv-white transition-colors duration-200"
          >
            SHOP THE DROP
          </Link>
        </motion.div>
      </section>
    </div>
  )
}
