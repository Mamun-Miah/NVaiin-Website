'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  BarChart3,
  Package,
  ImageIcon,
  ShoppingCart,
  Users,
  Home,
  Mail,
  HelpCircle,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  ChevronRight,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

// ── Navigation Config ─────────────────────────────────────────────────────────

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

interface NavSection {
  title: string
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'MAIN',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'CATALOG',
    items: [
      { href: '/admin/products', label: 'Products', icon: Package },
      { href: '/admin/lookbook', label: 'Lookbook', icon: ImageIcon },
    ],
  },
  {
    title: 'SALES',
    items: [
      { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
      { href: '/admin/customers', label: 'Customers', icon: Users },
    ],
  },
  {
    title: 'CONTENT',
    items: [
      { href: '/admin/homepage', label: 'Homepage', icon: Home },
      { href: '/admin/newsletter', label: 'Newsletter', icon: Mail },
      { href: '/admin/faq', label: 'FAQs', icon: HelpCircle },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { href: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
]

const ALL_NAV_ITEMS = NAV_SECTIONS.flatMap((s) => s.items)

// ── Sidebar Content ──────────────────────────────────────────────────────────

function SidebarContent({
  pathname,
  session,
  onNavigate,
}: {
  pathname: string
  session: { user?: { name?: string | null; email?: string | null } } | null
  onNavigate?: () => void
}) {
  const isActive = useCallback(
    (href: string) =>
      href === '/admin' ? pathname === '/admin' : pathname.startsWith(href),
    [pathname]
  )

  const userName = session?.user?.name ?? 'Admin'
  const userInitial = userName.charAt(0).toUpperCase()

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 pb-5">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="block cursor-pointer"
        >
          <img
            src="https://www.nvaiin.com/cdn/shop/files/Happy_N_Vaiin_23_x_19_in_11.png?v=1701494400"
            alt="N'VAIIN"
            className="h-8 w-auto"
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-6">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="font-bebas text-[10px] tracking-[0.2em] text-nv-fog/60 uppercase px-3 mb-2">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map(({ href, label, icon: Icon }) => {
                const active = isActive(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onNavigate}
                    className={`
                      group flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-mono-brand
                      transition-all duration-200 cursor-pointer relative
                      ${
                        active
                          ? 'text-nv-gold bg-nv-smoke/50'
                          : 'text-nv-fog hover:text-nv-white hover:bg-nv-smoke/30'
                      }
                    `}
                  >
                    {/* Active indicator */}
                    <div
                      className={`
                        absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full
                        transition-all duration-300
                        ${
                          active
                            ? 'h-6 bg-nv-gold'
                            : 'h-0 bg-transparent group-hover:h-3 group-hover:bg-nv-gold/40'
                        }
                      `}
                    />
                    <Icon className="h-[18px] w-[18px] shrink-0" />
                    <span className="truncate">{label}</span>
                    <ChevronRight
                      className={`h-3.5 w-3.5 ml-auto opacity-0 -translate-x-1 transition-all duration-200 ${
                        active
                          ? 'opacity-60 translate-x-0'
                          : 'group-hover:opacity-40 group-hover:translate-x-0'
                      }`}
                    />
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-nv-smoke p-3">
        <div className="flex items-center gap-3 px-3 py-2">
          <Avatar className="h-8 w-8 border border-nv-smoke">
            <AvatarFallback className="bg-nv-gold/10 font-anton text-xs text-nv-gold">
              {userInitial}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-mono-brand text-sm text-nv-white truncate">
              {userName}
            </p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-mono-brand
            text-nv-fog hover:text-nv-red hover:bg-nv-red/10 w-full
            transition-all duration-200 cursor-pointer"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )
}

// ── Main Layout ──────────────────────────────────────────────────────────────

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Auth guard
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  // Loading state
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

  // Don't render while redirecting
  if (status === 'unauthenticated') {
    return null
  }

  const closeSidebar = () => setSidebarOpen(false)

  // Breadcrumb: resolve current page label
  const getPageLabel = () => {
    const match = ALL_NAV_ITEMS.find(
      (item) =>
        item.href === '/admin'
          ? pathname === '/admin'
          : pathname.startsWith(item.href)
    )
    return match?.label ?? 'Admin'
  }

  // Build breadcrumb segments
  const getBreadcrumbs = () => {
    const label = getPageLabel()
    if (pathname === '/admin') return ['Dashboard']
    const segments = pathname.replace('/admin/', '').split('/')
    const breadcrumbLabels = segments.map((seg, i) => {
      if (i === segments.length - 1) return label
      // Map known segments
      const navMatch = ALL_NAV_ITEMS.find(
        (item) => item.href === `/admin/${segments.slice(0, i + 1).join('/')}`
      )
      return navMatch?.label ?? seg.charAt(0).toUpperCase() + seg.slice(1)
    })
    return ['Dashboard', ...breadcrumbLabels]
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <div className="min-h-screen bg-nv-black flex">
      {/* ── Desktop Sidebar (fixed, 280px) ── */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-[280px] bg-nv-concrete border-r border-nv-smoke z-30">
        {/* Gold gradient line at top */}
        <div className="h-[2px] bg-gradient-to-r from-nv-gold via-nv-gold/60 to-transparent shrink-0" />
        <SidebarContent
          pathname={pathname}
          session={session}
        />
      </aside>

      {/* ── Mobile Sidebar Overlay ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
              onClick={closeSidebar}
            />
            {/* Sidebar panel */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="fixed inset-y-0 left-0 w-[280px] bg-nv-concrete border-r border-nv-smoke z-50 lg:hidden flex flex-col"
            >
              {/* Gold gradient line at top */}
              <div className="h-[2px] bg-gradient-to-r from-nv-gold via-nv-gold/60 to-transparent shrink-0" />
              {/* Close button */}
              <button
                onClick={closeSidebar}
                className="absolute top-4 right-4 text-nv-fog hover:text-nv-white transition-colors cursor-pointer z-10 p-1"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
              <SidebarContent
                pathname={pathname}
                session={session}
                onNavigate={closeSidebar}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content ── */}
      <main className="flex-1 lg:ml-[280px] min-h-screen flex flex-col">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 bg-nv-black/90 backdrop-blur-md border-b border-nv-smoke">
          <div className="flex items-center justify-between px-4 lg:px-6 h-14">
            {/* Left: Hamburger + Breadcrumb */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-nv-fog hover:text-nv-white transition-colors cursor-pointer p-1"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <nav className="flex items-center gap-1.5 text-sm">
                {breadcrumbs.map((crumb, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    {i > 0 && (
                      <span className="text-nv-fog/40 font-mono-brand">/</span>
                    )}
                    <span
                      className={`font-mono-brand ${
                        i === breadcrumbs.length - 1
                          ? 'text-nv-white'
                          : 'text-nv-fog hover:text-nv-white cursor-pointer transition-colors'
                      }`}
                    >
                      {crumb}
                    </span>
                  </span>
                ))}
              </nav>
            </div>

            {/* Center: Search trigger */}
            <div className="hidden md:flex items-center">
              <button
                className="flex items-center gap-2 px-3 py-1.5 rounded-sm border border-nv-smoke bg-nv-concrete/50 text-nv-fog hover:text-nv-white hover:border-nv-smoke transition-colors cursor-pointer"
              >
                <Search className="h-4 w-4" />
                <span className="font-mono-brand text-xs">Search...</span>
                <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-sm bg-nv-smoke/50 border border-nv-smoke font-mono-brand text-[10px] text-nv-fog/60 ml-2">
                  <span className="text-[9px]">&#8984;</span>K
                </kbd>
              </button>
            </div>

            {/* Right: Notifications + Avatar */}
            <div className="flex items-center gap-3">
              {/* Notification bell */}
              <button
                className="relative text-nv-fog hover:text-nv-white transition-colors cursor-pointer p-1"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-nv-gold text-nv-black text-[9px] font-anton rounded-full flex items-center justify-center">
                  3
                </span>
              </button>

              {/* User avatar */}
              <div className="hidden sm:flex items-center gap-2">
                <Avatar className="h-8 w-8 border border-nv-smoke">
                  <AvatarFallback className="bg-nv-gold/10 font-anton text-xs text-nv-gold">
                    {session?.user?.name?.charAt(0)?.toUpperCase() ?? 'A'}
                  </AvatarFallback>
                </Avatar>
                <span className="font-mono-brand text-sm text-nv-fog hidden lg:inline max-w-[120px] truncate">
                  {session?.user?.name ?? 'Admin'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 lg:p-6">{children}</div>
      </main>
    </div>
  )
}
