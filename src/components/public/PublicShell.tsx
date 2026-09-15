import { Button } from '@/components/ui/button'
import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  FileText,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquareWarning,
  MenuIcon,
  Phone,
} from 'lucide-react'
import logoKemenag from '../../../logo-kemenag.png'
import logoPpidKemenagKubar from '../../../logo-ppid-kemenag-kubar.png'
import { AccessibilityMenu } from './AccessibilityMenu'

const navigation = [
  ['Beranda', '/'],
  ['Regulasi', '/regulasi'],
  ['Layanan Informasi', '/layanan-informasi/saluran-informasi'],
  ['Standar Layanan', '/standar-layanan/maklumat-pelayanan'],
  ['Informasi Publik', '/informasi-publik/dip'],
] as const

const serviceStandardNavigation = [
  ['Maklumat Pelayanan', '/standar-layanan/maklumat-pelayanan'],
  ['SOP', '/standar-layanan/sop'],
  ['Kebijakan', '/standar-layanan/kebijakan'],
] as const

const informationServiceNavigation = [
  ['Saluran Informasi', '/layanan-informasi/saluran-informasi'],
  ['Tata Cara', '/layanan-informasi/tata-cara'],
  ['Standar Pengumuman', '/layanan-informasi/standar-pengumuman'],
] as const

const publicInformationNavigation = [
  ['Daftar Informasi Publik', '/informasi-publik/dip'],
  ['Dokumen & Laporan', '/informasi-publik/dokumen-laporan'],
] as const

const profileNavigation = [
  ['Profil PPID', '/profil/ppid'],
  ['Profil Kemenag', '/profil/kantor-kemenag-kubar'],
] as const

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle className="social-icon-dot" cx="17.25" cy="6.75" r="1.15" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13.7 21v-8h2.7l.4-3h-3.1V8.1c0-.87.24-1.46 1.49-1.46H16.8V3.96c-.28-.04-1.23-.12-2.34-.12-2.32 0-3.91 1.42-3.91 4.01V10H7.93v3h2.62v8h3.15Z" />
    </svg>
  )
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15.1 3.1c.45 2.46 1.9 3.91 4.35 4.36v3.08a8.24 8.24 0 0 1-4.31-1.26v6.16a5.57 5.57 0 1 1-5.57-5.57c.3 0 .6.02.89.07v3.1a2.53 2.53 0 1 0 1.5 2.3V3.1h3.14Z" />
    </svg>
  )
}

function MobileNavigationGroup({
  label,
  items,
}: Readonly<{
  label: string
  items: readonly (readonly [string, string])[]
}>) {
  return (
    <AccordionItem value={label}>
      <AccordionTrigger className="px-2 py-3 font-semibold hover:no-underline">
        {label}
      </AccordionTrigger>
      <AccordionContent className="grid gap-1 pb-2">
        {items.map(([itemLabel, href]) => (
          <SheetClose asChild key={href}>
            <Button
              asChild
              variant="ghost"
              className="h-auto justify-start whitespace-normal p-2 pl-5 text-left"
            >
              <Link to={href as never}>{itemLabel}</Link>
            </Button>
          </SheetClose>
        ))}
      </AccordionContent>
    </AccordionItem>
  )
}

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
          <Link
            className="identity"
            to="/"
            aria-label="Beranda PPID Kemenag Kutai Barat"
          >
            <span className="identity-mark" aria-hidden="true">
              <img src={logoPpidKemenagKubar} alt="" />
            </span>
          </Link>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="mobile-menu-trigger min-[1051px]:hidden"
                aria-label="Buka menu utama"
              >
                <MenuIcon aria-hidden="true" />
                <span className="sr-only">Buka menu utama</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Menu utama</SheetTitle>
                <SheetDescription>
                  Portal PPID Kemenag Kutai Barat
                </SheetDescription>
              </SheetHeader>
              <nav className="px-4" aria-label="Navigasi utama">
                {navigation
                  .filter(
                    ([label]) =>
                      label !== 'Standar Layanan' &&
                      label !== 'Layanan Informasi' &&
                      label !== 'Informasi Publik',
                  )
                  .map(([label, href]) => (
                    <SheetClose asChild key={href}>
                      <Button
                        asChild
                        variant="ghost"
                        className="mb-1 w-full justify-start p-2"
                      >
                        <Link to={href}>{label}</Link>
                      </Button>
                    </SheetClose>
                  ))}
                <Accordion type="single" collapsible className="w-full">
                  <MobileNavigationGroup
                    label="Profil"
                    items={profileNavigation}
                  />
                  <MobileNavigationGroup
                    label="Standar Layanan"
                    items={serviceStandardNavigation}
                  />
                  <MobileNavigationGroup
                    label="Layanan Informasi"
                    items={informationServiceNavigation}
                  />
                  <MobileNavigationGroup
                    label="Informasi Publik"
                    items={publicInformationNavigation}
                  />
                </Accordion>
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
                <NavigationMenuLink asChild className="desktop-nav-link !p-2">
                  <Link to="/">Beranda</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="desktop-nav-trigger px-2">
                  Profil
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="profile-menu" aria-label="Menu profil">
                    {profileNavigation.map(([label, href]) => (
                      <li key={href}>
                        <NavigationMenuLink asChild>
                          <Link to={href}>{label}</Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild className="desktop-nav-link !p-2">
                  <Link to="/regulasi">Regulasi</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="desktop-nav-trigger px-2">
                  Layanan Informasi
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul
                    className="profile-menu"
                    aria-label="Menu layanan informasi"
                  >
                    {informationServiceNavigation.map(([label, href]) => (
                      <li key={href}>
                        <NavigationMenuLink asChild>
                          <Link to={href}>{label}</Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="desktop-nav-trigger px-2">
                  Standar Layanan
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul
                    className="profile-menu"
                    aria-label="Menu standar layanan"
                  >
                    {serviceStandardNavigation.map(([label, href]) => (
                      <li key={href}>
                        <NavigationMenuLink asChild>
                          <Link to={href}>{label}</Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="desktop-nav-trigger px-2">
                  Informasi Publik
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul
                    className="profile-menu"
                    aria-label="Menu informasi publik"
                  >
                    {publicInformationNavigation.map(([label, href]) => (
                      <li key={href}>
                        <NavigationMenuLink asChild>
                          <Link to={href}>{label}</Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="header-cta max-[700px]:hidden">
                Ajukan Permohonan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Pilih formulir layanan</DialogTitle>
                <DialogDescription>
                  Pilih formulir sesuai kebutuhan Anda.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 sm:grid-cols-2">
                <DialogClose asChild>
                  <Link
                    className="group grid min-h-40 content-start gap-3 rounded-lg border border-border bg-card p-5 text-foreground no-underline transition-colors hover:border-primary hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    to="/layanan-informasi/permohonan"
                  >
                    <FileText
                      className="size-6 text-primary"
                      aria-hidden="true"
                    />
                    <span className="font-semibold">
                      Formulir Permohonan Informasi Publik
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Ajukan permintaan informasi publik baru.
                    </span>
                  </Link>
                </DialogClose>
                <DialogClose asChild>
                  <Link
                    className="group grid min-h-40 content-start gap-3 rounded-lg border border-border bg-card p-5 text-foreground no-underline transition-colors hover:border-primary hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    to="/layanan-informasi/keberatan"
                  >
                    <MessageSquareWarning
                      className="size-6 text-primary"
                      aria-hidden="true"
                    />
                    <span className="font-semibold">
                      Formulir Pengajuan Keberatan Informasi
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Ajukan keberatan atas layanan informasi yang diterima.
                    </span>
                  </Link>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>
      {children}
      <AccessibilityMenu />
      <footer className="site-footer" id="kontak">
        <div className="page-container footer-grid">
          <div className="footer-identity">
            <div className="footer-brand">
              <img src={logoKemenag} alt="" aria-hidden="true" />
              <div>
                <strong>PPID Kementerian Agama</strong>
                <span>Kabupaten Kutai Barat</span>
              </div>
            </div>
            <p>Informasi publik yang jelas, akurat, dan dapat diakses.</p>
          </div>

          <address className="footer-contact">
            <h2>Hubungi kami</h2>
            <ul>
              <li>
                <Mail aria-hidden="true" />
                <a href="mailto:kemenagkutaibarat03@gmail.com">
                  kemenagkutaibarat03@gmail.com
                </a>
              </li>
              <li>
                <MessageCircle aria-hidden="true" />
                <a
                  href="https://wa.me/6281350543313"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp 0813 5054 3313
                </a>
              </li>
              <li>
                <Phone aria-hidden="true" />
                <a href="tel:+6281350543313">Telepon 0813 5054 3313</a>
              </li>
              <li>
                <MapPin aria-hidden="true" />
                <span>Jl. Moh Hatta RT XIX Melak Ulu</span>
              </li>
            </ul>
          </address>

          <div className="footer-social">
            <h2>Ikuti kanal resmi</h2>
            <nav aria-label="Media sosial Kemenag Kutai Barat">
              <a
                href="https://instagram.com/kemenagkutaibarat"
                target="_blank"
                rel="noopener noreferrer"
              >
                <InstagramIcon />
                <span>
                  <strong>Instagram</strong>
                  <small>@kemenagkutaibarat</small>
                </span>
              </a>
              <a
                href="https://facebook.com/p/Kemenag-Kutai-Barat-61577500157637/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FacebookIcon />
                <span>
                  <strong>Facebook</strong>
                  <small>Kemenag Kutai Barat</small>
                </span>
              </a>
              <a
                href="https://tiktok.com/@kemenagkubar"
                target="_blank"
                rel="noopener noreferrer"
              >
                <TikTokIcon />
                <span>
                  <strong>TikTok</strong>
                  <small>@kemenagkubar</small>
                </span>
              </a>
            </nav>
          </div>
        </div>
        <div className="page-container footer-bottom">
          <span>Portal resmi PPID Kemenag Kabupaten Kutai Barat</span>
          <Link to="/regulasi">Regulasi dan ketentuan layanan</Link>
        </div>
      </footer>
    </>
  )
}
