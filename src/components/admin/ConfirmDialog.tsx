'use client'

import { Loader2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => void
  variant?: 'danger' | 'default'
  loading?: boolean
}

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  onConfirm,
  variant = 'default',
  loading = false,
}: ConfirmDialogProps) {
  const isDanger = variant === 'danger'

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-nv-concrete border border-nv-smoke rounded-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-anton text-lg text-nv-white uppercase tracking-wider">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="font-mono-brand text-sm text-nv-fog">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className="bg-nv-smoke border border-nv-smoke text-nv-fog hover:text-nv-white hover:bg-nv-smoke/80 rounded-sm cursor-pointer"
            disabled={loading}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            className={`rounded-sm cursor-pointer font-mono-brand text-sm ${
              isDanger
                ? 'bg-nv-red text-white hover:bg-nv-red/90 border-0'
                : 'bg-nv-gold text-nv-black hover:bg-nv-gold/90 border-0'
            }`}
            disabled={loading}
          >
            {loading && (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            )}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
