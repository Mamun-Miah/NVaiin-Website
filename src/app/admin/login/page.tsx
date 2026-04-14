'use client'

import { useState, FormEvent } from 'react'
import { motion } from 'framer-motion'
import { signIn } from 'next-auth/react'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: true,
        callbackUrl: '/admin',
      })

      if (result?.error) {
        setError('Invalid email or password. Please try again.')
      }
    } catch {
      setError('An unexpected error occurred.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClasses =
    'w-full bg-nv-smoke border border-nv-smoke text-nv-white font-mono-brand text-sm px-4 py-3 placeholder:text-nv-fog focus:border-nv-gold focus:outline-none transition-colors duration-200'
  const labelClasses = 'font-bebas tracking-wider text-nv-fog text-sm uppercase block mb-2'

  return (
    <div className="min-h-screen bg-nv-black flex items-center justify-center px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center mb-10"
        >
          <img
            src="https://www.nvaiin.com/cdn/shop/files/Happy_N_Vaiin_23_x_19_in_11.png?v=1701494400"
            alt="N'VAIIN"
            className="w-[120px] h-auto"
          />
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="font-anton text-2xl uppercase tracking-wider text-center mb-10"
        >
          ADMIN LOGIN
        </motion.h1>

        {/* Login Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label htmlFor="admin-email" className={labelClasses}>
              Email
            </label>
            <input
              id="admin-email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@nvaiin.com"
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="admin-password" className={labelClasses}>
              Password
            </label>
            <input
              id="admin-password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={inputClasses}
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-nv-red font-mono-brand text-sm"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-nv-gold text-nv-black font-anton tracking-wider text-base py-4 hover:bg-nv-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
        </motion.form>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center font-mono-brand text-nv-fog text-xs mt-10"
        >
          N&apos;VAIIN Admin Portal
        </motion.p>
      </motion.div>
    </div>
  )
}
