'use client'

import { type ReactNode } from 'react'
import { motion } from 'framer-motion'

interface AdminPageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode[]
}

export default function AdminPageHeader({
  title,
  description,
  actions,
}: AdminPageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between mb-6"
    >
      <div>
        <h1 className="font-anton text-2xl md:text-3xl uppercase tracking-wider text-nv-white">
          {title}
        </h1>
        {description && (
          <p className="font-mono-brand text-sm text-nv-fog mt-1">
            {description}
          </p>
        )}
      </div>

      {actions && actions.length > 0 && (
        <div className="flex items-center gap-3 mt-3 sm:mt-0">
          {actions}
        </div>
      )}
    </motion.div>
  )
}
