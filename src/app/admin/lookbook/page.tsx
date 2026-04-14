'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  ImageIcon,
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

interface LookbookImage {
  id: string
  imageUrl: string
  title: string
  seasonLabel: string
  displayOrder: number
  isVisible: boolean
}

const emptyForm = {
  imageUrl: '',
  title: '',
  seasonLabel: '',
  displayOrder: 0,
  isVisible: true,
}

export default function AdminLookbookPage() {
  const [images, setImages] = useState<LookbookImage[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)

  const fetchImages = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/lookbook')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setImages(data)
    } catch {
      toast.error('Failed to load lookbook images')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchImages()
  }, [fetchImages])

  const handleOpenAdd = () => {
    setEditId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const handleOpenEdit = (img: LookbookImage) => {
    setEditId(img.id)
    setForm({
      imageUrl: img.imageUrl,
      title: img.title,
      seasonLabel: img.seasonLabel,
      displayOrder: img.displayOrder,
      isVisible: img.isVisible,
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.imageUrl.trim()) {
      toast.error('Image URL is required')
      return
    }
    setSaving(true)
    try {
      const isEditing = !!editId
      const res = await fetch('/api/admin/lookbook', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEditing ? { id: editId, ...form } : form),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to save')
      }
      toast.success(isEditing ? 'Image updated' : 'Image added')
      setModalOpen(false)
      fetchImages()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save image')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleVisibility = async (img: LookbookImage) => {
    try {
      const res = await fetch('/api/admin/lookbook', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: img.id,
          isVisible: !img.isVisible,
        }),
      })
      if (!res.ok) throw new Error('Failed to toggle')
      toast.success(img.isVisible ? 'Image hidden' : 'Image visible')
      fetchImages()
    } catch {
      toast.error('Failed to update visibility')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/admin/lookbook?id=${deleteId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success('Image deleted')
      setDeleteOpen(false)
      setDeleteId(null)
      fetchImages()
    } catch {
      toast.error('Failed to delete image')
    }
  }

  const inputClasses =
    'w-full bg-nv-smoke border border-nv-smoke text-nv-white font-mono-brand text-sm px-4 py-3 placeholder:text-nv-fog focus:border-nv-gold focus:outline-none transition-colors duration-200 rounded-none'
  const labelClasses =
    'font-bebas tracking-wider text-nv-fog text-sm uppercase block mb-2'

  return (
    <div className="min-h-screen bg-nv-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <h1 className="font-anton text-3xl uppercase tracking-wider">
            LOOKBOOK
          </h1>
          <button
            onClick={handleOpenAdd}
            className="bg-nv-gold text-nv-black font-anton tracking-wider text-sm px-6 py-3 hover:bg-nv-white transition-colors duration-200 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            ADD IMAGE
          </button>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-nv-concrete border border-nv-smoke">
                <Skeleton className="aspect-[4/5] w-full bg-nv-smoke" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4 bg-nv-smoke" />
                  <Skeleton className="h-3 w-1/2 bg-nv-smoke" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && images.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <ImageIcon className="w-16 h-16 text-nv-fog mx-auto mb-4 opacity-30" />
            <p className="font-anton text-xl text-nv-fog mb-2">
              NO LOOKBOOK IMAGES YET
            </p>
            <p className="font-mono-brand text-sm text-nv-fog/60">
              Add your first lookbook image to get started.
            </p>
          </motion.div>
        )}

        {/* Image Grid */}
        {!loading && images.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <AnimatePresence>
              {images.map((img) => (
                <motion.div
                  key={img.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`bg-nv-concrete border border-nv-smoke overflow-hidden group ${
                    !img.isVisible ? 'opacity-60' : ''
                  }`}
                >
                  {/* Image */}
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={img.imageUrl}
                      alt={img.title || 'Lookbook image'}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    {/* Overlay with title + season */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="font-anton text-lg uppercase tracking-wider">
                        {img.title || 'Untitled'}
                      </p>
                      {img.seasonLabel && (
                        <p className="font-bebas text-sm tracking-wider text-nv-gold">
                          {img.seasonLabel}
                        </p>
                      )}
                    </div>
                    {/* Visibility badge */}
                    {!img.isVisible && (
                      <div className="absolute top-3 right-3 bg-nv-black/80 px-2 py-1">
                        <span className="font-mono-brand text-xs text-nv-fog uppercase">
                          Hidden
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card footer with actions */}
                  <div className="p-4 flex items-center justify-between border-t border-nv-smoke">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleVisibility(img)}
                        className="p-2 text-nv-fog hover:text-nv-gold transition-colors"
                        title={img.isVisible ? 'Hide image' : 'Show image'}
                      >
                        {img.isVisible ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </button>
                      <span className="font-mono-brand text-xs text-nv-fog">
                        #{img.displayOrder}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(img)}
                        className="p-2 text-nv-fog hover:text-nv-gold transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setDeleteId(img.id)
                          setDeleteOpen(true)
                        }}
                        className="p-2 text-nv-fog hover:text-nv-red transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
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
              {editId ? 'EDIT IMAGE' : 'ADD IMAGE'}
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-5">
            <div>
              <label className={labelClasses}>Image URL</label>
              <input
                type="url"
                value={form.imageUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, imageUrl: e.target.value }))
                }
                placeholder="https://..."
                className={inputClasses}
              />
            </div>
            <div>
              <label className={labelClasses}>Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Product name"
                className={inputClasses}
              />
            </div>
            <div>
              <label className={labelClasses}>Season Label</label>
              <input
                type="text"
                value={form.seasonLabel}
                onChange={(e) =>
                  setForm((f) => ({ ...f, seasonLabel: e.target.value }))
                }
                placeholder="e.g. SS24"
                className={inputClasses}
              />
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
            <div className="flex items-center justify-between">
              <label className={labelClasses}>Visible</label>
              <button
                type="button"
                onClick={() =>
                  setForm((f) => ({ ...f, isVisible: !f.isVisible }))
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  form.isVisible ? 'bg-nv-gold' : 'bg-nv-smoke'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                    form.isVisible
                      ? 'translate-x-6 bg-nv-black'
                      : 'translate-x-1 bg-nv-fog'
                  }`}
                />
              </button>
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
              {editId ? 'UPDATE' : 'ADD IMAGE'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-nv-concrete border border-nv-smoke">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-anton text-lg uppercase tracking-wider text-nv-white">
              DELETE IMAGE
            </AlertDialogTitle>
            <AlertDialogDescription className="font-mono-brand text-sm text-nv-fog">
              This action cannot be undone. This will permanently delete this
              lookbook image.
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
