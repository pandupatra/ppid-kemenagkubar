import { useState, type ReactNode } from 'react'
import {
  BookOpenCheck,
  ChevronRight,
  FileText,
  FolderTree,
  Gavel,
  LayoutDashboard,
  LogOut,
  MailQuestion,
  Menu,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { signOutAdmin } from '@/modules/auth/admin-login'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

export type AdminShellActor = { displayName: string; roles: string[] }

const navigation = [
  { label: 'Ringkasan', icon: LayoutDashboard, href: '/admin' },
  { label: 'Dokumen publik', icon: FileText, href: '/admin/dokumen' },
  {
    label: 'Permohonan informasi',
    icon: MailQuestion,
    href: '/admin/permohonan-informasi',
  },
  {
    label: 'Keberatan informasi',
    icon: Gavel,
    href: '/admin/keberatan-informasi',
  },
  {
    label: 'Layanan informasi',
    icon: BookOpenCheck,
    children: [
      { label: 'Tata Cara', href: '/admin/layanan-informasi/tata-cara' },
      {
        label: 'Standar Pengumuman',
        href: '/admin/layanan-informasi/standar-pengumuman',
      },
    ],
  },
  {
    label: 'Standar layanan',
    icon: BookOpenCheck,
    children: [
      {
        label: 'Maklumat Pelayanan',
        href: '/admin/standar-layanan/maklumat-pelayanan',
      },
      { label: 'SOP', href: '/admin/standar-layanan/sop' },
      { label: 'Kebijakan', href: '/admin/standar-layanan/kebijakan' },
    ],
  },
  {
    label: 'Dokumen & laporan',
    icon: FileText,
    href: '/admin/dokumen-laporan',
  },
  { label: 'Kategori DIP', icon: FolderTree, href: '/admin/kategori-dip' },
]

const roleLabels: Record<string, string> = {
  administrator: 'Administrator PPID',
  auditor: 'Auditor',
  content_editor: 'Editor konten',
  ppid_officer: 'Petugas PPID',
  ppid_supervisor: 'Atasan PPID',
  reviewer: 'Reviewer',
}

function actorInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function SidebarContent({
  actor,
  activePath,
}: Readonly<{ actor?: AdminShellActor; activePath: string }>) {
  return (
    <>
      <a className="admin-brand" href="/admin" aria-label="PPID Admin">
        <span className="admin-brand-mark" aria-hidden="true">
          P
        </span>
        <span>
          <strong>PPID Admin</strong>
          <small>Kemenag Kutai Barat</small>
        </span>
      </a>
      <nav className="admin-navigation" aria-label="Navigasi administrasi">
        <p className="admin-navigation-label">Ruang kerja</p>
        {navigation.map(({ children, href, icon: Icon, label }) => {
          const active = href === activePath
          return (
            <div key={label}>
              {href ? (
                <a
                  className={
                    active
                      ? 'admin-navigation-link is-active'
                      : 'admin-navigation-link'
                  }
                  href={href}
                >
                  <Icon aria-hidden="true" />
                  <span>{label}</span>
                </a>
              ) : (
                <div className="admin-navigation-group">
                  <Icon aria-hidden="true" />
                  <span>{label}</span>
                </div>
              )}
              {children ? (
                <div className="admin-navigation-children">
                  {children.map((child) => (
                    <a
                      className={
                        child.href === activePath
                          ? 'admin-navigation-child is-active'
                          : 'admin-navigation-child'
                      }
                      href={child.href}
                      key={child.href}
                    >
                      {child.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          )
        })}
      </nav>
      <div className="admin-sidebar-footer">
        {actor ? (
          <>
            <div className="admin-user-summary">
              <span className="admin-avatar" aria-hidden="true">
                {actorInitials(actor.displayName)}
              </span>
              <span>
                <strong>{actor.displayName}</strong>
                <small>{roleLabels[actor.roles[0]] ?? 'Staf PPID'}</small>
              </span>
            </div>
            <AdminSignOutButton />
          </>
        ) : (
          <div
            className="flex items-center gap-3"
            aria-label="Memuat profil staf"
            role="status"
          >
            <Skeleton className="size-9 shrink-0 rounded-full" />
            <span className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </span>
          </div>
        )}
      </div>
    </>
  )
}

export function AdminShell({
  activePath,
  actor,
  children,
}: Readonly<{
  activePath: string
  actor?: AdminShellActor
  children: ReactNode
}>) {
  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <SidebarContent actor={actor} activePath={activePath} />
      </aside>
      <div className="admin-main">
        <header className="admin-header">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="admin-mobile-menu"
                aria-label="Buka navigasi administrasi"
              >
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="admin-mobile-sheet">
              <SheetHeader>
                <SheetTitle>PPID Admin</SheetTitle>
                <SheetDescription>
                  Ruang kerja pengelolaan portal
                </SheetDescription>
              </SheetHeader>
              <div className="admin-mobile-sidebar">
                <SidebarContent actor={actor} activePath={activePath} />
              </div>
              <SheetClose className="sr-only">Tutup navigasi</SheetClose>
            </SheetContent>
          </Sheet>
          <nav className="admin-breadcrumb" aria-label="Breadcrumb">
            <a href="/">Portal publik</a>
            <ChevronRight aria-hidden="true" />
            <span>Administrasi</span>
          </nav>
          <div className="admin-header-actions">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="max-sm:hidden"
            >
              <a href="/" target="_blank" rel="noreferrer">
                Lihat portal
              </a>
            </Button>
          </div>
        </header>
        {children}
      </div>
    </div>
  )
}

function AdminSignOutButton() {
  const [isSigningOut, setIsSigningOut] = useState(false)
  async function handleSignOut() {
    if (isSigningOut) return
    setIsSigningOut(true)
    try {
      await signOutAdmin()
    } finally {
      window.location.assign('/masuk')
    }
  }
  return (
    <Button
      className="admin-sign-out"
      variant="ghost"
      size="sm"
      onClick={() => void handleSignOut()}
      disabled={isSigningOut}
    >
      <LogOut aria-hidden="true" />
      {isSigningOut ? 'Keluar…' : 'Keluar'}
    </Button>
  )
}
