'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2,
  HelpCircle,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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

interface Faq {
  id: string
  question: string
  answer: string
  category: string
  displayOrder: number
}

const CATEGORIES = [
  'Orders',
  'Shipping',
  'Returns',
  'Sizing',
  'Brand',
  'General',
]

const emptyForm = {
  question: '',
  answer: '',
  category: 'General',
  displayOrder: 0,
}

export default function AdminFaqPage() {
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchFaqs = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/faqs')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setFaqs(data)
    } catch {
      toast.error('Failed to load FAQs')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFaqs()
  }, [fetchFaqs])

  const handleOpenAdd = () => {
    setEditId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const handleOpenEdit = (faq: Faq) => {
    setEditId(faq.id)
    setForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      displayOrder: faq.displayOrder,
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.question.trim() || !form.answer.trim()) {
      toast.error('Question and answer are required')
      return
    }
    setSaving(true)
    try {
      const isEditing = !!editId
      const res = await fetch('/api/admin/faqs', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEditing ? { id: editId, ...form } : form),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to save')
      }
      toast.success(isEditing ? 'FAQ updated' : 'FAQ added')
      setModalOpen(false)
      fetchFaqs()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save FAQ')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/admin/faqs?id=${deleteId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success('FAQ deleted')
      setDeleteOpen(false)
      setDeleteId(null)
      if (expandedId === deleteId) setExpandedId(null)
      fetchFaqs()
    } catch {
      toast.error('Failed to delete FAQ')
    }
  }

  const inputClasses =
    'w-full bg-nv-smoke border border-nv-smoke text-nv-white font-mono-brand text-sm px-4 py-3 placeholder:text-nv-fog focus:border-nv-gold focus:outline-none transition-colors duration-200'
  const labelClasses =
    'font-bebas tracking-wider text-nv-fog text-sm uppercase block mb-2'
  const textareaClasses =
    'w-full bg-nv-smoke border border-nv-smoke text-nv-white font-mono-brand text-sm px-4 py-3 placeholder:text-nv-fog focus:border-nv-gold focus:outline-none transition-colors duration-200 min-h-[120px] resize-y'

  return (
    <div className="min-h-screen bg-nv-black">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <h1 className="font-anton text-3xl uppercase tracking-wider">
            FAQS
          </h1>
          <button
            onClick={handleOpenAdd}
            className="bg-nv-gold text-nv-black font-anton tracking-wider text-sm px-6 py-3 hover:bg-nv-white transition-colors duration-200 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            ADD FAQ
          </button>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="bg-nv-concrete border border-nv-smoke p-6"
              >
                <Skeleton className="h-5 w-3/4 bg-nv-smoke mb-2" />
                <Skeleton className="h-4 w-1/3 bg-nv-smoke" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && faqs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <HelpCircle className="w-16 h-16 text-nv-fog mx-auto mb-4 opacity-30" />
            <p className="font-anton text-xl text-nv-fog mb-2">
              NO FAQs YET
            </p>
            <p className="font-mono-brand text-sm text-nv-fog/60">
              Add your first FAQ to help customers.
            </p>
          </motion.div>
        )}

        {/* FAQ List */}
        {!loading && faqs.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <AnimatePresence>
              {faqs.map((faq) => (
                <motion.div
                  key={faq.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`bg-nv-concrete border border-nv-smoke overflow-hidden transition-colors ${
                    expandedId === faq.id
                      ? 'border-l-2 border-l-nv-gold'
                      : ''
                  }`}
                >
                  {/* Question Row */}
                  <div
                    className="p-6 flex items-start gap-4 cursor-pointer"
                    onClick={() =>
                      setExpandedId(expandedId === faq.id ? null : faq.id)
                    }
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-bebas tracking-wider text-nv-gold text-xs uppercase px-2 py-0.5 bg-nv-gold/10">
                          {faq.category}
                        </span>
                        <span className="font-mono-brand text-xs text-nv-fog/50">
                          #{faq.displayOrder}
                        </span>
                      </div>
                      <p className="font-anton text-base uppercase tracking-wider text-nv-white">
                        {faq.question}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenEdit(faq)
                        }}
                        className="p-2 text-nv-fog hover:text-nv-gold transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteId(faq.id)
                          setDeleteOpen(true)
                        }}
                        className="p-2 text-nv-fog hover:text-nv-red transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-nv-fog hover:text-nv-gold transition-colors ml-1"
                      >
                        {expandedId === faq.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Answer */}
                  <AnimatePresence>
                    {expandedId === faq.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 border-t border-nv-smoke/50 pt-4">
                          <p className="font-mono-brand text-sm text-nv-fog whitespace-pre-line leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-nv-concrete border border-nv-smoke sm:max-w-lg p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="font-anton text-xl uppercase tracking-wider text-nv-white">
              {editId ? 'EDIT FAQ' : 'ADD FAQ'}
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-5">
            <div>
              <label className={labelClasses}>Question</label>
              <input
                type="text"
                value={form.question}
                onChange={(e) =>
                  setForm((f) => ({ ...f, question: e.target.value }))
                }
                placeholder="What is your return policy?"
                className={inputClasses}
              />
            </div>
            <div>
              <label className={labelClasses}>Answer</label>
              <textarea
                value={form.answer}
                onChange={(e) =>
                  setForm((f) => ({ ...f, answer: e.target.value }))
                }
                placeholder="We accept returns within 30 days..."
                className={textareaClasses}
                rows={5}
              />
            </div>
            <div>
              <label className={labelClasses}>Category</label>
              <div className="relative">
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                  className="w-full bg-nv-smoke border border-nv-smoke text-nv-white font-mono-brand text-sm px-4 py-3 focus:border-nv-gold focus:outline-none transition-colors duration-200 appearance-none cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-nv-concrete">
                      {cat}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nv-fog pointer-events-none" />
              </div>
            </div>
            <div>
              <label className={labelClasses}>Display Order</label>
              <input
                type="number"
                value={form.displayOrder}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    displayOrder: parseInt(e.target.value) || 0,
                  }))
                }
                min={0}
                className={inputClasses}
              />
            </div>
          </div>
          <DialogFooter className="p-6 pt-0 gap-3">
            <button
              onClick={() => setModalOpen(false)}
              className="flex-1 border border-nv-smoke text-nv-fog font-bebas tracking-wider py-3 hover:border-nv-white hover:text-nv-white transition-colors"
            >
              CANCEL
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-nv-gold text-nv-black font-anton tracking-wider py-3 hover:bg-nv-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editId ? 'UPDATE' : 'ADD FAQ'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-nv-concrete border border-nv-smoke">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-anton text-lg uppercase tracking-wider text-nv-white">
              DELETE FAQ
            </AlertDialogTitle>
            <AlertDialogDescription className="font-mono-brand text-sm text-nv-fog">
              This action cannot be undone. This will permanently delete this
              FAQ entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="flex-1 border border-nv-smoke text-nv-fog font-bebas tracking-wider hover:border-nv-white hover:text-nv-white transition-colors bg-transparent">
              CANCEL
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="flex-1 bg-nv-red text-nv-white font-anton tracking-wider hover:bg-red-700 transition-colors"
            >
              DELETE
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
