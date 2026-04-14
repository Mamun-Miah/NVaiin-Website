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
  storeName: "N'VAIIN",
  tagline: 'Not Made In Vain',
  contactEmail: 'contact@nvaiin.com',
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
  metaTitle: "N'VAIIN — Not Made In Vain",
  metaDescription: "N'VAIIN is a revolutionary clothing line with a purpose beyond fashion.",
  googleAnalyticsId: '',
}

export default function AdminSettingsPage() {
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
      toast.error('Failed to load settings')
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
      toast.success('Settings saved successfully')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const inputClasses =
    'w-full bg-nv-smoke border border-nv-smoke text-nv-white font-mono-brand text-sm px-4 py-3 placeholder:text-nv-fog focus:border-nv-gold focus:outline-none transition-colors duration-200'
  const labelClasses =
    'font-bebas tracking-wider text-nv-fog text-sm uppercase block mb-2'
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
            SETTINGS
          </h1>
          <p className="font-mono-brand text-sm text-nv-fog">
            Configure your store settings, contact info, and integrations.
          </p>
        </motion.div>

        {loading ? (
          <div className="space-y-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="bg-nv-concrete border border-nv-smoke p-6 space-y-4"
              >
                <Skeleton className="h-4 w-32 bg-nv-smoke" />
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
            {/* Store Info */}
            <div className="bg-nv-concrete border border-nv-smoke p-6">
              <h2 className={sectionTitleClasses}>STORE INFO</h2>
              <div className="space-y-5">
                <div>
                  <label className={labelClasses}>Store Name</label>
                  <input
                    type="text"
                    value={settings.storeName}
                    onChange={(e) =>
                      updateField('storeName', e.target.value)
                    }
                    placeholder="N'VAIIN"
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className={labelClasses}>Tagline</label>
                  <input
                    type="text"
                    value={settings.tagline}
                    onChange={(e) =>
                      updateField('tagline', e.target.value)
                    }
                    placeholder="Not Made In Vain"
                    className={inputClasses}
                  />
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-nv-concrete border border-nv-smoke p-6">
              <h2 className={sectionTitleClasses}>CONTACT</h2>
              <div>
                <label className={labelClasses}>Contact Email</label>
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) =>
                    updateField('contactEmail', e.target.value)
                  }
                  placeholder="contact@nvaiin.com"
                  className={inputClasses}
                />
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-nv-concrete border border-nv-smoke p-6">
              <h2 className={sectionTitleClasses}>SOCIAL LINKS</h2>
              <div className="space-y-5">
                <div>
                  <label className={labelClasses}>Instagram URL</label>
                  <input
                    type="url"
                    value={settings.instagramUrl}
                    onChange={(e) =>
                      updateField('instagramUrl', e.target.value)
                    }
                    placeholder="https://instagram.com/nvaiin"
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className={labelClasses}>Twitter / X URL</label>
                  <input
                    type="url"
                    value={settings.twitterUrl}
                    onChange={(e) =>
                      updateField('twitterUrl', e.target.value)
                    }
                    placeholder="https://x.com/nvaiin"
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className={labelClasses}>TikTok URL</label>
                  <input
                    type="url"
                    value={settings.tiktokUrl}
                    onChange={(e) =>
                      updateField('tiktokUrl', e.target.value)
                    }
                    placeholder="https://tiktok.com/@nvaiin"
                    className={inputClasses}
                  />
                </div>
              </div>
            </div>

            {/* Shipping */}
            <div className="bg-nv-concrete border border-nv-smoke p-6">
              <h2 className={sectionTitleClasses}>SHIPPING</h2>
              <div>
                <label className={labelClasses}>
                  Free Shipping Threshold ($)
                </label>
                <input
                  type="number"
                  value={settings.freeShippingAmount}
                  onChange={(e) =>
                    updateField(
                      'freeShippingAmount',
                      parseFloat(e.target.value) || 0
                    )
                  }
                  min={0}
                  step={0.01}
                  className={inputClasses}
                />
                <p className="font-mono-brand text-xs text-nv-fog/60 mt-2">
                  Orders above this amount qualify for free shipping.
                </p>
              </div>
            </div>

            {/* SEO */}
            <div className="bg-nv-concrete border border-nv-smoke p-6">
              <h2 className={sectionTitleClasses}>SEO</h2>
              <div className="space-y-5">
                <div>
                  <label className={labelClasses}>Meta Title</label>
                  <input
                    type="text"
                    value={settings.metaTitle}
                    onChange={(e) =>
                      updateField('metaTitle', e.target.value)
                    }
                    placeholder="N'VAIIN — Not Made In Vain"
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className={labelClasses}>Meta Description</label>
                  <textarea
                    value={settings.metaDescription}
                    onChange={(e) =>
                      updateField('metaDescription', e.target.value)
                    }
                    placeholder="A short description of your store for search engines..."
                    className={`${inputClasses} min-h-[100px] resize-y`}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Analytics */}
            <div className="bg-nv-concrete border border-nv-smoke p-6">
              <h2 className={sectionTitleClasses}>ANALYTICS</h2>
              <div>
                <label className={labelClasses}>Google Analytics ID</label>
                <input
                  type="text"
                  value={settings.googleAnalyticsId}
                  onChange={(e) =>
                    updateField('googleAnalyticsId', e.target.value)
                  }
                  placeholder="G-XXXXXXXXXX"
                  className={inputClasses}
                />
                <p className="font-mono-brand text-xs text-nv-fog/60 mt-2">
                  Your Google Analytics 4 measurement ID.
                </p>
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
                {saving ? 'SAVING...' : 'SAVE SETTINGS'}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
