import { useState, type ReactNode } from 'react'
import {
  Bell,
  BookOpenCheck,
  ChevronRight,
  FileCheck2,
  FileText,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  UsersRound,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  { label: 'Halaman portal', icon: BookOpenCheck },
  { label: 'Kategori DIP', icon: FolderTree, href: '/admin/kategori-dip' },
  { label: 'Review publikasi', icon: FileCheck2, count: '6' },
  { label: 'Tim & akses', icon: UsersRound },
  { label: 'Audit', icon: ShieldCheck },
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
}: Readonly<{ actor: AdminShellActor; activePath: string }>) {
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
        {navigation.map(({ count, href, icon: Icon, label }) => {
          const active = href === activePath
          return (
            <a
              className={
                active
                  ? 'admin-navigation-link is-active'
                  : 'admin-navigation-link'
              }
              href={href ?? '#fitur-segera-hadir'}
              key={label}
            >
              <Icon aria-hidden="true" />
              <span>{label}</span>
              {count ? <Badge variant="secondary">{count}</Badge> : null}
            </a>
          )
        })}
      </nav>
      <div className="admin-sidebar-footer">
        <a className="admin-navigation-link" href="#fitur-segera-hadir">
          <Settings aria-hidden="true" />
          <span>Pengaturan</span>
        </a>
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
  actor: AdminShellActor
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
            <Button variant="ghost" size="icon" aria-label="Notifikasi">
              <Bell />
            </Button>
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
