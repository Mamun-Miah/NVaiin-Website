'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Send, Users, Mail, Loader2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'

interface Subscriber {
  id: string
  email: string
  createdAt: string
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const fetchSubscribers = useCallback(async () => {
    try {
      const res = await fetch('/api/newsletter')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setSubscribers(data)
    } catch {
      toast.error('Failed to load subscribers')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSubscribers()
  }, [fetchSubscribers])

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      toast.error('Subject and body are required')
      return
    }
    setSending(true)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to send')
      }
      const data = await res.json()
      toast.success(data.message || 'Newsletter sent successfully')
      setSubject('')
      setBody('')
      setConfirmOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send newsletter')
    } finally {
      setSending(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const inputClasses =
    'w-full bg-nv-smoke border border-nv-smoke text-nv-white font-mono-brand text-sm px-4 py-3 placeholder:text-nv-fog focus:border-nv-gold focus:outline-none transition-colors duration-200'
  const labelClasses =
    'font-bebas tracking-wider text-nv-fog text-sm uppercase block mb-2'

  return (
    <div className="min-h-screen bg-nv-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-anton text-3xl uppercase tracking-wider mb-2">
            NEWSLETTER
          </h1>
          <p className="font-mono-brand text-sm text-nv-fog">
            Manage subscribers and compose newsletters.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subscribers List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-nv-concrete border border-nv-smoke"
          >
            <div className="p-6 border-b border-nv-smoke flex items-center gap-3">
              <Users className="w-5 h-5 text-nv-gold" />
              <h2 className="font-bebas tracking-[0.2em] text-nv-gold text-xs uppercase">
                SUBSCRIBERS
              </h2>
              <span className="font-mono-brand text-xs text-nv-fog ml-auto">
                {subscribers.length} total
              </span>
            </div>

            <div className="max-h-[500px] overflow-y-auto">
              {loading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full bg-nv-smoke" />
                  ))}
                </div>
              ) : subscribers.length === 0 ? (
                <div className="p-8 text-center">
                  <Mail className="w-10 h-10 text-nv-fog mx-auto mb-3 opacity-30" />
                  <p className="font-mono-brand text-sm text-nv-fog">
                    No subscribers yet.
                  </p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-nv-smoke">
                      <th className="text-left font-bebas tracking-wider text-nv-fog text-xs uppercase px-6 py-3">
                        Email
                      </th>
                      <th className="text-right font-bebas tracking-wider text-nv-fog text-xs uppercase px-6 py-3">
                        Subscribed
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map((sub, index) => (
                      <tr
                        key={sub.id}
                        className={`border-b border-nv-smoke/50 hover:bg-nv-smoke/20 transition-colors ${
                          index === subscribers.length - 1
                            ? 'border-b-0'
                            : ''
                        }`}
                      >
                        <td className="px-6 py-3 font-mono-brand text-sm text-nv-white truncate max-w-[200px]">
                          {sub.email}
                        </td>
                        <td className="px-6 py-3 font-mono-brand text-xs text-nv-fog text-right whitespace-nowrap">
                          {formatDate(sub.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>

          {/* Compose Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-nv-concrete border border-nv-smoke"
          >
            <div className="p-6 border-b border-nv-smoke flex items-center gap-3">
              <Send className="w-5 h-5 text-nv-gold" />
              <h2 className="font-bebas tracking-[0.2em] text-nv-gold text-xs uppercase">
                COMPOSE NEWSLETTER
              </h2>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className={labelClasses}>Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="New Drop Alert ✦ SS24 Collection"
                  className={inputClasses}
                />
              </div>

              <div>
                <label className={labelClasses}>Body</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your newsletter content here..."
                  className={`${inputClasses} min-h-[200px] resize-y`}
                  rows={10}
                />
              </div>

              {/* Preview */}
              {subject || body ? (
                <div>
                  <label className={labelClasses}>Preview</label>
                  <div className="bg-nv-black border border-nv-smoke p-4">
                    {subject && (
                      <p className="font-anton text-lg uppercase tracking-wider mb-3 text-nv-white">
                        {subject}
                      </p>
                    )}
                    {body && (
                      <div className="font-mono-brand text-sm text-nv-fog whitespace-pre-line">
                        {body}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Send Button */}
              <button
                onClick={() => {
                  if (!subject.trim() || !body.trim()) {
                    toast.error('Subject and body are required')
                    return
                  }
                  setConfirmOpen(true)
                }}
                disabled={sending || subscribers.length === 0}
                className="w-full bg-nv-gold text-nv-black font-anton tracking-wider py-4 hover:bg-nv-white transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {sending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                {sending
                  ? 'SENDING...'
                  : `SEND NEWSLETTER${subscribers.length > 0 ? ` (${subscribers.length})` : ''}`}
              </button>

              {subscribers.length === 0 && (
                <p className="font-mono-brand text-xs text-nv-fog text-center -mt-2">
                  No subscribers to send to.
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Confirm Send Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="bg-nv-concrete border border-nv-smoke">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-anton text-lg uppercase tracking-wider text-nv-white">
              SEND NEWSLETTER?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-mono-brand text-sm text-nv-fog">
              This will send the newsletter to{' '}
              <span className="text-nv-gold font-bold">
                {subscribers.length}
              </span>{' '}
              subscriber{subscribers.length !== 1 ? 's' : ''}. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="flex-1 border border-nv-smoke text-nv-fog font-bebas tracking-wider hover:border-nv-white hover:text-nv-white transition-colors bg-transparent">
              CANCEL
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSend}
              className="flex-1 bg-nv-gold text-nv-black font-anton tracking-wider hover:bg-nv-white transition-colors"
            >
              SEND NOW
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
