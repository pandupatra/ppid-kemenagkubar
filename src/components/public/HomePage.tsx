import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ArrowRight,
  BellRing,
  CalendarDays,
  FileText,
  Search,
  ShieldCheck,
  ClipboardList,
  FolderOpen,
} from 'lucide-react'
import { FormEvent, useId, type CSSProperties } from 'react'
import officePhoto from '../../../Foto Kantor.png'
import type { PublicNewsItem } from '../../modules/news/public-news'
import { PublicShell } from './PublicShell'

const informationCategories = [
  {
    title: 'Informasi Berkala',
    description:
      'Informasi tentang badan publik, kegiatan, kinerja, dan laporan keuangan yang diumumkan secara berkala.',
    href: '/informasi-publik/dip?category=berkala',
    icon: CalendarDays,
  },
  {
    title: 'Informasi Serta-merta',
    description:
      'Informasi yang wajib disampaikan dan diumumkan kepada publik tanpa penundaan.',
    href: '/informasi-publik/dip?category=serta-merta',
    icon: BellRing,
  },
  {
    title: 'Informasi Setiap Saat',
    description:
      'Daftar informasi, keputusan, kebijakan, dan dokumen layanan yang tersedia setiap saat.',
    href: '/informasi-publik/dip?category=setiap-saat',
    icon: FolderOpen,
  },
  {
    title: 'Informasi Dikecualikan',
    description:
      'Informasi dengan akses terbatas sesuai UU No. 14 Tahun 2008; hanya informasi yang dapat diumumkan ditampilkan.',
    href: '/informasi-publik/dip?category=dikecualikan',
    icon: FileText,
  },
] as const

export function HomePage({ news }: Readonly<{ news: PublicNewsItem[] }>) {
  const searchId = useId()

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    window.location.assign('/informasi-publik/dip')
  }

  return (
    <PublicShell>
      <main id="isi-utama">
        <section
          className="home-search-hero"
          id="beranda"
          aria-labelledby="search-title"
        >
          <div
            aria-hidden="true"
            className="home-search-hero-image"
            style={
              { '--home-hero-image': `url("${officePhoto}")` } as CSSProperties
            }
          />
          <div className="page-container home-search-layout">
            <div className="home-search-intro">
              <h1 id="search-title">Temukan informasi yang Anda perlukan.</h1>
              <p className="lead">
                Cari dokumen, regulasi, standar layanan, dan Daftar Informasi
                Publik di lingkungan Kementerian Agama Kabupaten Kutai Barat.
              </p>
            </div>
            <div className="home-search-actions">
              <form
                className="home-search-form"
                onSubmit={search}
                role="search"
              >
                <Label className="sr-only" htmlFor={searchId}>
                  Cari informasi publik
                </Label>
                <div className="home-search-control">
                  <Search aria-hidden="true" />
                  <Input
                    id={searchId}
                    type="search"
                    placeholder="Contoh: standar layanan, laporan, regulasi"
                  />
                  <Button type="submit">Cari</Button>
                </div>
              </form>
              <div
                className="home-quick-links"
                aria-label="Akses cepat layanan informasi"
              >
                <a className="home-quick-link" href="#layanan-informasi">
                  <ClipboardList aria-hidden="true" />
                  <span>
                    <strong>Ajukan permohonan informasi</strong>
                    <small>Sampaikan permohonan Anda secara online</small>
                  </span>
                </a>
                <a className="home-quick-link" href="/layanan-informasi/lacak">
                  <FileText aria-hidden="true" />
                  <span>
                    <strong>Lacak status permohonan</strong>
                    <small>Cek perkembangan permohonan Anda</small>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </section>

        <section
          className="section home-catalog"
          id="informasi-publik"
          aria-labelledby="documents-title"
        >
          <div className="page-container">
            <div className="home-catalog-heading heading-row">
              <h2 id="documents-title">Jelajahi informasi publik</h2>
              <a className="text-link" href="/informasi-publik/dip">
                Lihat semua dokumen <ArrowRight aria-hidden="true" />
              </a>
            </div>
            <div className="home-category-grid">
              {informationCategories.map((category) => {
                const Icon = category.icon

                return (
                  <a
                    className="home-category-card"
                    href={category.href}
                    key={category.title}
                  >
                    <Icon aria-hidden="true" />
                    <h3>{category.title}</h3>
                    <p>{category.description}</p>
                    <span>
                      Jelajahi kategori <ArrowRight aria-hidden="true" />
                    </span>
                  </a>
                )
              })}
            </div>
          </div>
        </section>

        <section
          className="home-service-band"
          id="layanan-informasi"
          aria-labelledby="service-title"
        >
          <div className="page-container home-service-layout">
            <div>
              <h2 id="service-title">Informasi belum tersedia di katalog?</h2>
              <p>
                Sampaikan permohonan Anda. Setelah dikirim, Anda akan menerima
                nomor tanda terima untuk pelacakan.
              </p>
            </div>
            <div className="home-service-actions">
              <Button asChild>
                <a href="/layanan-informasi/permohonan">
                  Ajukan permohonan informasi
                </a>
              </Button>
              <a
                className="text-link"
                href="/layanan-informasi/lacak"
                id="lacak-permohonan"
              >
                Lacak status permohonan
              </a>
            </div>
            <a
              className="home-standard-link"
              href="/standar-layanan/maklumat-pelayanan"
              id="standar-layanan"
            >
              <ShieldCheck aria-hidden="true" />
              <span>
                <strong>Baca standar layanan</strong>
                <small>
                  Permohonan diproses sesuai standar layanan dan ketentuan
                  keterbukaan informasi publik.
                </small>
              </span>
            </a>
          </div>
        </section>

        <section
          className="section page-container"
          id="berita"
          aria-labelledby="news-title"
        >
          <div className="home-news-heading heading-row">
            <div>
              <h2 id="news-title">Berita terbaru</h2>
              <p className="lead">
                Kabar dari Kementerian Agama Kabupaten Kutai Barat.
              </p>
            </div>
            <a
              className="text-link"
              href="https://kaltim.kemenag.go.id/berita/lists"
              target="_blank"
              rel="noopener noreferrer"
            >
              Lihat semua berita
            </a>
          </div>
          {news.length > 0 ? (
            <div className="home-news-grid" aria-label="Daftar berita terbaru">
              {news.map((item) => (
                <article className="news-card" key={item.id}>
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="news-card-image"
                      loading="lazy"
                    />
                  ) : null}
                  <div className="news-card-content">
                    <p className="news-card-date">{item.publishedLabel}</p>
                    <h3>{item.title}</h3>
                    <p className="news-card-excerpt">{item.excerpt}</p>
                    <a
                      className="news-card-link"
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Baca berita di tab baru: ${item.title}`}
                    >
                      Baca berita <ArrowRight aria-hidden="true" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="news-empty">Berita terbaru belum tersedia.</p>
          )}
        </section>
      </main>
    </PublicShell>
  )
}
