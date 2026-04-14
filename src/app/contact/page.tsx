'use client'

import { useState, FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Instagram, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { RevealSection } from '@/components/animations/RevealSection'
import { SplitTextReveal } from '@/components/animations/SplitTextReveal'

const MAX_MESSAGE_LENGTH = 1000
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type EmailStatus = 'pristine' | 'valid' | 'invalid'

export default function ContactPage() {
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [emailStatus, setEmailStatus] = useState<EmailStatus>('pristine')

  const messageLength = formData.message.length
  const messageCharPercent = (messageLength / MAX_MESSAGE_LENGTH) * 100

  const validateEmail = (value: string): EmailStatus => {
    if (value.length === 0) return 'pristine'
    return EMAIL_REGEX.test(value) ? 'valid' : 'invalid'
  }

  const handleEmailBlur = () => {
    setEmailStatus(validateEmail(formData.email))
  }

  const handleEmailChange = (value: string) => {
    setFormData((prev) => ({ ...prev, email: value }))
    // Live-update checkmark but don't show error while typing
    if (emailStatus !== 'pristine') {
      const status = validateEmail(value)
      // Only update to valid while typing, don't flash invalid during typing
      if (status === 'valid') {
        setEmailStatus('valid')
      }
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    // Validate email on submit
    const emailVal = validateEmail(formData.email)
    setEmailStatus(emailVal)
    if (emailVal === 'invalid') return

    setFormState('submitting')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        throw new Error('Failed to send message')
      }

      setFormState('success')
      setFormData({ name: '', email: '', subject: '', message: '' })
      setEmailStatus('pristine')
      toast.success('Message sent successfully.')
    } catch {
      setFormState('error')
      toast.error('Something went wrong. Try again.')
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    if (name === 'email') {
      handleEmailChange(value)
      return
    }
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const inputClasses =
    'w-full bg-nv-smoke border border-nv-smoke text-nv-white font-mono-brand text-sm px-4 py-3 placeholder:text-nv-fog focus:border-nv-gold focus:outline-none transition-colors duration-200'
  const labelClasses =
    'font-bebas tracking-wider text-nv-fog text-sm uppercase block mb-2'

  const getEmailInputClasses = (): string => {
    const base = inputClasses
    if (emailStatus === 'invalid') return `${base} border-nv-red`
    if (emailStatus === 'valid') return `${base} border-emerald-500`
    return base
  }

  return (
    <div className="min-h-screen bg-nv-black px-4 sm:px-6 lg:px-8 pt-32 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Decorative gold line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-16 h-[2px] bg-gradient-to-r from-nv-gold to-nv-gold/30 mb-8"
        />

        {/* Heading */}
        <SplitTextReveal
          text="REACH OUT"
          as="h1"
          className="font-anton text-5xl md:text-7xl uppercase tracking-tight mb-16"
          animation="chars"
          trigger="onMount"
          stagger={0.06}
          duration={0.6}
        />

        {/* Contact Form Card */}
        <RevealSection direction="up" delay={0.3}>
          <div className="bg-nv-concrete border border-nv-smoke p-6 sm:p-8">
            {/* Gold accent line at top of card */}
            <div className="h-[2px] bg-gradient-to-r from-nv-gold via-nv-gold/60 to-transparent mb-6 -mx-6 sm:-mx-8 -mt-6 sm:-mt-8 w-[calc(100%+3rem)] sm:w-[calc(100%+4rem)]" />

            <AnimatePresence mode="wait">
              {formState === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center justify-center py-16 gap-6"
                >
                  <motion.p
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="font-anton text-nv-gold text-2xl uppercase tracking-wider"
                  >
                    MESSAGE RECEIVED.
                  </motion.p>
                  <button
                    onClick={() => setFormState('idle')}
                    className="text-nv-fog font-mono-brand text-sm hover:text-nv-gold transition-colors duration-200 uppercase tracking-wider mt-4 cursor-hover"
                  >
                    Send another message &rarr;
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-6"
                >
                  {/* Name & Email — side by side on desktop */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className={labelClasses}>
                        Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        className={inputClasses}
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className={labelClasses}>
                        Email
                      </label>
                      <div className="relative">
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          onBlur={handleEmailBlur}
                          placeholder="your@email.com"
                          className={getEmailInputClasses()}
                          aria-invalid={emailStatus === 'invalid'}
                        />
                        {emailStatus === 'valid' && (
                          <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                        )}
                        {emailStatus === 'invalid' && (
                          <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nv-red" />
                        )}
                      </div>
                      <AnimatePresence>
                        {emailStatus === 'invalid' && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.2 }}
                            className="text-nv-red font-mono-brand text-xs mt-1.5"
                          >
                            Please enter a valid email address
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Subject — full width */}
                  <div>
                    <label htmlFor="subject" className={labelClasses}>
                      Subject
                    </label>
                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="What's this about?"
                      className={inputClasses}
                    />
                  </div>

                  {/* Message — full width, taller */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="message" className={labelClasses + ' mb-0'}>
                        Message
                      </label>
                      <span
                        className={`font-mono-brand text-xs transition-colors duration-200 ${
                          messageLength >= MAX_MESSAGE_LENGTH
                            ? 'text-nv-red'
                            : messageLength >= MAX_MESSAGE_LENGTH * 0.8
                              ? 'text-nv-gold'
                              : 'text-nv-fog'
                        }`}
                      >
                        {messageLength} / {MAX_MESSAGE_LENGTH} characters
                      </span>
                    </div>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={8}
                      maxLength={MAX_MESSAGE_LENGTH}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us what's on your mind..."
                      className={`${inputClasses} resize-none`}
                    />
                    {/* Character progress bar */}
                    <div className="mt-2 h-[2px] w-full bg-nv-smoke overflow-hidden rounded-full">
                      <motion.div
                        className={`h-full rounded-full transition-colors duration-200 ${
                          messageLength >= MAX_MESSAGE_LENGTH
                            ? 'bg-nv-red'
                            : messageLength >= MAX_MESSAGE_LENGTH * 0.8
                              ? 'bg-nv-gold'
                              : 'bg-nv-gold/50'
                        }`}
                        style={{ width: `${Math.min(messageCharPercent, 100)}%` }}
                      />
                    </div>
                  </div>

                  {formState === 'error' && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-nv-red font-mono-brand text-sm"
                    >
                      Something went wrong. Please try again.
                    </motion.p>
                  )}

                  <button
                    type="submit"
                    disabled={formState === 'submitting'}
                    className="w-full bg-nv-gold text-nv-black font-anton tracking-wider text-base py-4 hover:bg-nv-white transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed cursor-hover flex items-center justify-center gap-3 min-h-[56px]"
                  >
                    {formState === 'submitting' ? (
                      <>
                        {/* Three-dot loading animation */}
                        <span className="flex items-center gap-1.5">
                          <motion.span
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              delay: 0,
                            }}
                            className="inline-block w-2 h-2 bg-nv-black rounded-full"
                          />
                          <motion.span
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              delay: 0.2,
                            }}
                            className="inline-block w-2 h-2 bg-nv-black rounded-full"
                          />
                          <motion.span
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              delay: 0.4,
                            }}
                            className="inline-block w-2 h-2 bg-nv-black rounded-full"
                          />
                        </span>
                        <span>SENDING</span>
                      </>
                    ) : (
                      'SEND MESSAGE'
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </RevealSection>

        {/* Brand Info Section */}
        <RevealSection direction="up" delay={0.35} className="mt-12">
          <div className="border-t border-nv-smoke pt-10 pb-4">
            <span className="font-bebas text-nv-gold text-xs tracking-[0.2em] block mb-6">
              GET IN TOUCH
            </span>

            <div className="space-y-4">
              <div>
                <span className="font-mono-brand text-nv-gold text-sm tracking-wide">
                  CONTACT@NVaiN.COM
                </span>
              </div>

              <div className="space-y-1">
                <p className="font-mono-brand text-nv-fog text-sm">
                  We typically respond within 24 hours
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-bebas text-nv-fog text-xs tracking-[0.2em] block">
                  OFFICE HOURS
                </span>
                <p className="font-mono-brand text-nv-fog text-sm">
                  MON &mdash; FRI, 9AM &mdash; 6PM EST
                </p>
              </div>
            </div>
          </div>
        </RevealSection>

        {/* Social Links */}
        <RevealSection direction="up" delay={0.4} className="mt-16 text-center">
          <h2 className="font-anton text-2xl md:text-3xl uppercase tracking-tight mb-3">
            FOLLOW THE MOVEMENT
          </h2>
          <p className="font-mono-brand text-nv-fog text-sm mb-8">
            Stay connected across platforms
          </p>
          <div className="flex items-center justify-center gap-5">
            <a
              href="https://instagram.com/nvaiin"
              target="_blank"
              rel="noopener noreferrer"
              className="group w-16 h-16 flex items-center justify-center bg-nv-smoke border border-nv-smoke text-nv-white hover:bg-nv-gold hover:text-nv-black hover:border-nv-gold transition-all duration-300 cursor-hover"
              aria-label="Instagram"
            >
              <Instagram className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
            </a>
            <a
              href="https://x.com/nvaiin"
              target="_blank"
              rel="noopener noreferrer"
              className="group w-16 h-16 flex items-center justify-center bg-nv-smoke border border-nv-smoke text-nv-white hover:bg-nv-gold hover:text-nv-black hover:border-nv-gold transition-all duration-300 cursor-hover font-anton text-lg"
              aria-label="X (Twitter)"
            >
              <span className="transition-transform duration-300 group-hover:scale-110">X</span>
            </a>
            <a
              href="https://tiktok.com/@nvaiin"
              target="_blank"
              rel="noopener noreferrer"
              className="group w-16 h-16 flex items-center justify-center bg-nv-smoke border border-nv-smoke text-nv-white hover:bg-nv-gold hover:text-nv-black hover:border-nv-gold transition-all duration-300 cursor-hover"
              aria-label="TikTok"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-6 h-6 fill-current transition-transform duration-300 group-hover:scale-110"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.89 2.89 2.89 0 0 1 2.88-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.72a8.27 8.27 0 0 0 4.76 1.5v-3.4a4.85 4.85 0 0 1-1-.13z" />
              </svg>
            </a>
          </div>
        </RevealSection>
      </div>
    </div>
  )
}
