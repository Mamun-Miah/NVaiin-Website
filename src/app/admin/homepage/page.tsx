'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface SiteSettings {
  id: string
  storeName: string
  tagline: string
  contactEmail: string
  instagramUrl: string
  twitterUrl: string
  tiktokUrl: string
  freeShippingAmount: number
  announcementActive: boolean
  announcementText: string
  heroTagline: string
  heroSubheading: string
  manifestoText: string
  pullQuote: string
  metaTitle: string
  metaDescription: string
  googleAnalyticsId: string
}

const defaultSettings: SiteSettings = {
  id: 'singleton',
  storeName: '',
  tagline: '',
  contactEmail: '',
  instagramUrl: '',
  twitterUrl: '',
  tiktokUrl: '',
  freeShippingAmount: 75,
  announcementActive: false,
  announcementText: '',
  heroTagline: '',
  heroSubheading: '',
  manifestoText: '',
  pullQuote: '',
  metaTitle: '',
  metaDescription: '',
  googleAnalyticsId: '',
}

export default function AdminHomepagePage() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setSettings({ ...defaultSettings, ...data })
    } catch {
      toast.error('Failed to load homepage settings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const updateField = <K extends keyof SiteSettings>(
    key: K,
    value: SiteSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (!res.ok) throw new Error('Failed to save')
      toast.success('Homepage content saved successfully')
    } catch {
      toast.error('Failed to save homepage content')
    } finally {
      setSaving(false)
    }
  }

  const inputClasses =
    'w-full bg-nv-smoke border border-nv-smoke text-nv-white font-mono-brand text-sm px-4 py-3 placeholder:text-nv-fog focus:border-nv-gold focus:outline-none transition-colors duration-200'
  const labelClasses =
    'font-bebas tracking-wider text-nv-fog text-sm uppercase block mb-2'
  const textareaClasses =
    'w-full bg-nv-smoke border border-nv-smoke text-nv-white font-mono-brand text-sm px-4 py-3 placeholder:text-nv-fog focus:border-nv-gold focus:outline-none transition-colors duration-200 min-h-[120px] resize-y'
  const sectionTitleClasses =
    'font-bebas tracking-[0.2em] text-nv-gold text-xs uppercase mb-6'

  return (
    <div className="min-h-screen bg-nv-black">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-anton text-3xl uppercase tracking-wider mb-2">
            HOMEPAGE CONTENT
          </h1>
          <p className="font-mono-brand text-sm text-nv-fog">
            Manage the content displayed on your homepage.
          </p>
        </motion.div>

        {loading ? (
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-nv-concrete border border-nv-smoke p-6 space-y-4"
              >
                <Skeleton className="h-4 w-32 bg-nv-smoke" />
                <Skeleton className="h-10 w-full bg-nv-smoke" />
                <Skeleton className="h-10 w-full bg-nv-smoke" />
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Hero Section */}
            <div className="bg-nv-concrete border border-nv-smoke p-6">
              <h2 className={sectionTitleClasses}>HERO SECTION</h2>
              <div className="space-y-5">
                <div>
                  <label className={labelClasses}>Hero Tagline</label>
                  <input
                    type="text"
                    value={settings.heroTagline}
                    onChange={(e) =>
                      updateField('heroTagline', e.target.value)
                    }
                    placeholder="NOT MADE IN VAIN"
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className={labelClasses}>Hero Subheading</label>
                  <input
                    type="text"
                    value={settings.heroSubheading}
                    onChange={(e) =>
                      updateField('heroSubheading', e.target.value)
                    }
                    placeholder="Conscious Fashion. Timeless Style."
                    className={inputClasses}
                  />
                </div>
              </div>
            </div>

            {/* Announcement Bar */}
            <div className="bg-nv-concrete border border-nv-smoke p-6">
              <h2 className={sectionTitleClasses}>ANNOUNCEMENT BAR</h2>
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <label className={labelClasses}>Active</label>
                  <button
                    type="button"
                    onClick={() =>
                      updateField(
                        'announcementActive',
                        !settings.announcementActive
                      )
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.announcementActive ? 'bg-nv-gold' : 'bg-nv-smoke'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                        settings.announcementActive
                          ? 'translate-x-6 bg-nv-black'
                          : 'translate-x-1 bg-nv-fog'
                      }`}
                    />
                  </button>
                </div>
                <div>
                  <label className={labelClasses}>Announcement Text</label>
                  <input
                    type="text"
                    value={settings.announcementText}
                    onChange={(e) =>
                      updateField('announcementText', e.target.value)
                    }
                    placeholder="FREE SHIPPING ON ORDERS OVER $75"
                    className={inputClasses}
                  />
                </div>
              </div>
            </div>

            {/* Manifesto Marquee */}
            <div className="bg-nv-concrete border border-nv-smoke p-6">
              <h2 className={sectionTitleClasses}>MANIFESTO MARQUEE</h2>
              <div>
                <label className={labelClasses}>Marquee Text</label>
                <textarea
                  value={settings.manifestoText}
                  onChange={(e) =>
                    updateField('manifestoText', e.target.value)
                  }
                  placeholder="NOT MADE IN VAIN ✦ CONSCIOUS FASHION ✦ WEAR WITH PURPOSE ✦"
                  className={textareaClasses}
                  rows={3}
                />
                <p className="font-mono-brand text-xs text-nv-fog/60 mt-2">
                  Separate phrases with ✦ for visual separators.
                </p>
              </div>
            </div>

            {/* Brand Statement */}
            <div className="bg-nv-concrete border border-nv-smoke p-6">
              <h2 className={sectionTitleClasses}>BRAND STATEMENT</h2>
              <div>
                <label className={labelClasses}>Pull Quote</label>
                <input
                  type="text"
                  value={settings.pullQuote}
                  onChange={(e) =>
                    updateField('pullQuote', e.target.value)
                  }
                  placeholder="STYLE IS A REFLECTION OF VALUES."
                  className={inputClasses}
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-nv-gold text-nv-black font-anton tracking-wider text-lg py-4 hover:bg-nv-white transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {saving ? 'SAVING...' : 'SAVE HOMEPAGE'}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
