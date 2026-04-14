'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

interface Faq {
  id: string
  question: string
  answer: string
  category: string
}

const CATEGORIES = ['ALL', 'ORDERS', 'SHIPPING', 'RETURNS', 'SIZING', 'BRAND'] as const
type Category = (typeof CATEGORIES)[number]

function normalizeCategory(cat: string): Category {
  const upper = cat.toUpperCase()
  if (CATEGORIES.includes(upper as Category)) return upper as Category
  return 'ALL'
}

export default function FaqsPage() {
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [activeCategory, setActiveCategory] = useState<Category>('ALL')
  const [openId, setOpenId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFaqs() {
      try {
        const res = await fetch('/api/faqs')
        if (res.ok) {
          const data = await res.json()
          setFaqs(data)
        }
      } catch {
        // Silently fail - page shows empty
      } finally {
        setLoading(false)
      }
    }
    fetchFaqs()
  }, [])

  const filteredFaqs = useMemo(() => {
    if (activeCategory === 'ALL') return faqs
    return faqs.filter((faq) => normalizeCategory(faq.category) === activeCategory)
  }, [faqs, activeCategory])

  const toggleFaq = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="min-h-screen bg-nv-black px-4 sm:px-6 lg:px-8 pt-32 pb-24">
      <div className="max-w-3xl mx-auto">
        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-anton text-5xl md:text-7xl uppercase tracking-tight mb-12"
        >
          FAQS
        </motion.h1>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap gap-2 mb-10"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat)
                setOpenId(null)
              }}
              className={`font-bebas tracking-wider text-sm uppercase px-5 py-2.5 border transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-nv-gold text-nv-black border-nv-gold'
                  : 'bg-transparent text-nv-fog border-nv-smoke hover:border-nv-gold hover:text-nv-gold'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* FAQ List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {loading ? (
            <div className="flex flex-col gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-nv-concrete border-b border-nv-smoke animate-pulse"
                />
              ))}
            </div>
          ) : filteredFaqs.length === 0 ? (
            <p className="font-mono-brand text-nv-fog text-sm py-12 text-center">
              No FAQs found in this category.
            </p>
          ) : (
            <div>
              <AnimatePresence mode="popLayout">
                {filteredFaqs.map((faq) => {
                  const isOpen = openId === faq.id
                  return (
                    <motion.div
                      key={faq.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      className={`bg-nv-concrete border-b border-nv-smoke transition-colors duration-200 ${
                        isOpen ? 'border-l-2 border-l-nv-gold' : ''
                      }`}
                    >
                      <button
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full flex items-center justify-between px-6 py-5 text-left group"
                        aria-expanded={isOpen}
                      >
                        <span className="font-bebas text-lg tracking-wider pr-4 group-hover:text-nv-gold transition-colors duration-200">
                          {faq.question}
                        </span>
                        <span
                          className={`flex-shrink-0 w-8 h-8 flex items-center justify-center border border-nv-smoke text-nv-fog group-hover:border-nv-gold group-hover:text-nv-gold transition-all duration-200 ${
                            isOpen ? 'border-nv-gold text-nv-gold bg-nv-gold/10' : ''
                          }`}
                        >
                          {isOpen ? (
                            <Minus className="w-4 h-4" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                        </span>
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-5">
                              <p className="font-mono-brand text-sm text-nv-fog leading-relaxed">
                                {faq.answer}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
