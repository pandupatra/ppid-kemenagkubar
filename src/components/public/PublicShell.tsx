import { Button } from '@/components/ui/button'
import type { ReactNode } from 'react'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from '@/components/ui/sheet'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import logoKemenag from '../../../logo-kemenag.png'

const navigation = [
  ['Beranda', '/'],
  ['Regulasi', '/regulasi'],
  ['Layanan Informasi', '/layanan-informasi'],
  ['Standar Layanan', '/standar-layanan'],
  ['Informasi Publik', '/informasi-publik'],
] as const

const profileNavigation = [
  ['Profil PPID', '/profil'],
  ['Profil Pejabat', '/profil/pejabat'],
  ['Visi, Misi, dan Moto PPID', '/profil/visi-misi-dan-moto'],
  ['Tugas, Fungsi, dan Wewenang PPID', '/profil/tugas-fungsi-dan-wewenang'],
  ['Struktur Organisasi PPID', '/profil/struktur-organisasi-ppid'],
  ['Struktur Organisasi Kemenag', '/profil/struktur-organisasi-kemenag'],
] as const

export function PublicShell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <a className="skip-link" href="#isi-utama">
        Lewati ke isi utama
      </a>
      <header className="site-header">
        {/*<div className="utility-bar">
          <div className="page-container utility-content">
            <span>Portal resmi layanan informasi publik</span>
            <a href="#kontak">Kontak PPID</a>
          </div>
        </div>*/}
        <div className="page-container header-content">
          <a
            className="identity"
            href="/"
            aria-label="Beranda PPID Kemenag Kutai Barat"
          >
            <span className="identity-mark" aria-hidden="true">
              <img src={logoKemenag} alt="" />
            </span>
            <span className="identity-copy">
              <strong>PPID</strong>
              <small>
                Kantor Kementerian Agama
                <br />
                Kabupaten Kutai Barat
              </small>
            </span>
          </a>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="min-[1051px]:hidden">
                Menu
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Menu utama</SheetTitle>
                <SheetDescription>
                  Portal PPID Kemenag Kutai Barat
                </SheetDescription>
              </SheetHeader>
              <nav className="grid gap-2 px-4" aria-label="Navigasi utama">
                <div className="grid gap-1">
                  <span className="px-2 py-1 text-sm font-semibold text-foreground">
                    Profil
                  </span>
                  {profileNavigation.map(([label, href]) => (
                    <SheetClose asChild key={href}>
                      <Button
                        asChild
                        variant="ghost"
                        className="h-auto justify-start whitespace-normal pl-5 text-left"
                      >
                        <a href={href}>{label}</a>
                      </Button>
                    </SheetClose>
                  ))}
                </div>
                {navigation.map(([label, href]) => (
                  <SheetClose asChild key={href}>
                    <Button asChild variant="ghost" className="justify-start">
                      <a href={href}>{label}</a>
                    </Button>
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <NavigationMenu
            className="desktop-nav max-[1050px]:hidden"
            aria-label="Navigasi utama"
            viewport={false}
          >
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <a href="/">Beranda</a>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="desktop-nav-trigger">
                  Profil
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="profile-menu" aria-label="Menu profil">
                    {profileNavigation.map(([label, href]) => (
                      <li key={href}>
                        <NavigationMenuLink asChild>
                          <a href={href}>{label}</a>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <a href="/regulasi">Regulasi</a>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <a href="/layanan-informasi">Layanan Informasi</a>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <a href="/standar-layanan">Standar Layanan</a>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <a href="/informasi-publik">Informasi Publik</a>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <Button asChild className="header-cta max-[700px]:hidden">
            <a href="/layanan-informasi/permohonan">Ajukan Permohonan</a>
          </Button>
        </div>
      </header>
      {children}
      <footer className="site-footer" id="kontak">
        <div className="page-container footer-grid">
          <div>
            <strong>PPID Kementerian Agama Kabupaten Kutai Barat</strong>
            <p>Informasi publik yang jelas, akurat, dan dapat diakses.</p>
          </div>
          <address>
            <strong>Kontak PPID</strong>
            <span>
              Alamat dan kanal resmi akan ditetapkan oleh pemilik konten sebelum
              publikasi produksi.
            </span>
          </address>
          <a className="text-link" href="/regulasi">
            Regulasi dan ketentuan layanan
          </a>
        </div>
      </footer>
    </>
  )
}
