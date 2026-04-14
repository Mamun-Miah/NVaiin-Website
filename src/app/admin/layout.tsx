'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ImageIcon,
  Settings,
  Mail,
  HelpCircle,
  Wrench,
  LogOut,
  Menu,
  X,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/lookbook', label: 'Lookbook', icon: ImageIcon },
  { href: '/admin/homepage', label: 'Homepage', icon: Settings },
  { href: '/admin/newsletter', label: 'Newsletter', icon: Mail },
  { href: '/admin/faq', label: 'FAQs', icon: HelpCircle },
  { href: '/admin/settings', label: 'Settings', icon: Wrench },
] as const

function SidebarContent({
  pathname,
  onNavigate,
}: {
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-nv-smoke">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="block"
        >
          <img
            src="https://www.nvaiin.com/cdn/shop/files/Happy_N_Vaiin_23_x_19_in_11.png?v=1701494400"
            alt="N'VAIIN"
            className="h-8 w-auto"
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(href)

          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-mono-brand
                transition-colors duration-200
                ${
                  isActive
                    ? 'text-nv-gold bg-nv-smoke border-l-2 border-nv-gold'
                    : 'text-nv-fog hover:text-nv-white hover:bg-nv-smoke/50 border-l-2 border-transparent'
                }
              `}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Sign Out */}
      <div className="p-3 border-t border-nv-smoke">
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-mono-brand
            text-nv-fog hover:text-nv-red hover:bg-nv-smoke/50 w-full
            transition-colors duration-200 cursor-pointer border-l-2 border-transparent"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  // Show loading while checking auth
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-nv-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-nv-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-mono-brand text-nv-fog text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render anything while redirecting
  if (status === 'unauthenticated') {
    return null
  }

  const closeSidebar = () => setSidebarOpen(false)

  const getPageTitle = () => {
    const match = NAV_ITEMS.find(
      (item) =>
        item.href === '/admin'
          ? pathname === '/admin'
          : pathname.startsWith(item.href)
    )
    return match?.label ?? 'Admin'
  }

  return (
    <div className="min-h-screen bg-nv-black flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 bg-nv-concrete border-r border-nv-smoke z-30">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={closeSidebar}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-64 bg-nv-concrete border-r border-nv-smoke z-50 lg:hidden"
            >
              {/* Close button */}
              <button
                onClick={closeSidebar}
                className="absolute top-4 right-4 text-nv-fog hover:text-nv-white transition-colors cursor-pointer z-10"
              >
                <X className="h-5 w-5" />
              </button>
              <SidebarContent pathname={pathname} onNavigate={closeSidebar} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-nv-black/80 backdrop-blur-sm border-b border-nv-smoke">
          <div className="flex items-center justify-between px-4 lg:px-6 py-4">
            <div className="flex items-center gap-4">
              {/* Mobile Hamburger */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-nv-fog hover:text-nv-white transition-colors cursor-pointer"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="font-anton text-xl tracking-wider text-nv-white">
                {getPageTitle()}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-nv-smoke border border-nv-smoke flex items-center justify-center">
                  <span className="font-anton text-xs text-nv-gold">
                    {session?.user?.name?.charAt(0)?.toUpperCase() ?? 'A'}
                  </span>
                </div>
                <span className="font-mono-brand text-sm text-nv-fog hidden md:inline">
                  {session?.user?.name ?? 'Admin'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  )
}
