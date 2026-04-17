'use client'

import { type LucideIcon, ArrowUp, ArrowDown } from 'lucide-react'
import { motion } from 'framer-motion'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  change?: {
    value: number
    trend: 'up' | 'down'
  }
  description?: string
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  change,
  description,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-nv-concrete border border-nv-smoke p-5 rounded-sm hover:border-nv-gold/30 transition-colors duration-300 relative overflow-hidden group"
    >
      {/* Icon */}
      <div className="absolute top-5 right-5 w-10 h-10 rounded-full bg-nv-gold/10 flex items-center justify-center group-hover:bg-nv-gold/20 transition-colors duration-300">
        <Icon className="h-5 w-5 text-nv-gold" />
      </div>

      {/* Content */}
      <div className="space-y-3">
        <p className="font-bebas tracking-wider text-nv-fog text-xs uppercase">
          {title}
        </p>

        <p className="font-anton text-2xl md:text-3xl text-nv-white">
          {value}
        </p>

        <div className="flex items-center gap-2">
          {change && (
            <span
              className={`inline-flex items-center gap-1 font-mono-brand text-xs ${
                change.trend === 'up' ? 'text-emerald-500' : 'text-nv-red'
              }`}
            >
              {change.trend === 'up' ? (
                <ArrowUp className="h-3 w-3" />
              ) : (
                <ArrowDown className="h-3 w-3" />
              )}
              {Math.abs(change.value)}%
            </span>
          )}
          {description && (
            <span className="font-mono-brand text-xs text-nv-fog">
              {description}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
