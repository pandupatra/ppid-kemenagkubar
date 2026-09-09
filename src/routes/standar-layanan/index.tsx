import { createFileRoute } from '@tanstack/react-router'
import { BadgeCheck } from 'lucide-react'
import { PublicShell } from '@/components/public/PublicShell'
import logoKemenag from '../../../logo-kemenag.png'

const commitments = [
  {
    title: 'Tepat waktu',
    description:
      'Melayani dengan standar waktu pelayanan paling lambat 3 (tiga) hari kerja sejak permintaan informasi publik diajukan.',
  },
  {
    title: 'Proses sederhana',
    description: 'Pelayanan diberikan tanpa berbelit-belit.',
  },
  {
    title: 'Tanpa biaya',
    description: 'Memberikan layanan tanpa biaya.',
  },
  {
    title: 'Cermat dan sesuai ketentuan',
    description: 'Pelayanan diberikan dengan teliti dan sesuai ketentuan.',
  },
  {
    title: 'Tanggap terhadap kebutuhan',
    description:
      'Permintaan diberikan sesuai dengan permintaan dan tanggap dengan keinginan masyarakat.',
  },
  {
    title: 'Bertanggung jawab',
    description:
      'Apabila pelayanan tidak sesuai standar, maka kami siap memberikan kompensasi.',
  },
]

const legalBases = [
  'Undang-Undang Nomor 14 Tahun 2008 tentang Keterbukaan Informasi Publik.',
  'Peraturan Pemerintah Nomor 61 Tahun 2010 tentang Pelaksanaan Undang-Undang Nomor 14 Tahun 2008 tentang Keterbukaan Informasi Publik.',
  'Keputusan Menteri Agama Nomor 92 Tahun 2019 tentang Pedoman Layanan Informasi Publik bagi PPID Kementerian Agama dan Atasan PPID Kementerian Agama.',
  'Peraturan Komisi Informasi Nomor 1 Tahun 2021 tentang Standar Layanan Informasi Publik.',
  'Peraturan Menteri Agama yang mengatur mengenai Organisasi dan Tata Kerja Kementerian Agama.',
]

export const Route = createFileRoute('/standar-layanan/')({
  component: ServiceStandardPage,
})

function ServiceStandardPage() {
  return (
    <PublicShell>
      <main id="isi-utama" className="service-charter-page">
        <article
          className="service-charter page-container"
          aria-labelledby="maklumat-title"
        >
          <header className="service-charter-header">
            <div className="service-charter-brand">
              <img
                className="service-charter-logo"
                src={logoKemenag}
                alt="Logo Kementerian Agama Republik Indonesia"
              />
              <p className="service-charter-office">
                Kantor Kementerian Agama
                <br />
                Kabupaten Kutai Barat
              </p>
            </div>
            <div className="service-charter-heading">
              <BadgeCheck aria-hidden="true" />
              <h1 id="maklumat-title">Maklumat Pelayanan</h1>
              <p className="service-charter-pledge">
                Janji kami dalam memberikan layanan informasi publik
              </p>
            </div>
          </header>

          <ol className="service-charter-commitments">
            {commitments.map(({ title, description }, index) => (
              <li key={title} className={index === 0 ? 'is-featured' : ''}>
                <span className="service-charter-number" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <h2>{title}</h2>
                  <p>{description}</p>
                </div>
              </li>
            ))}
          </ol>

          <section
            className="service-charter-legal"
            aria-labelledby="dasar-hukum-title"
          >
            <h2 id="dasar-hukum-title">Dasar hukum</h2>
            <ol>
              {legalBases.map((legalBase) => (
                <li key={legalBase}>{legalBase}</li>
              ))}
            </ol>
          </section>

          <footer className="service-charter-signature">
            <p>Sendawar, 1 Januari 2026</p>
            <p>Kepala Kantor Kementerian Agama Kabupaten Kutai Barat</p>
            <strong>A. Johan Marpaung, S.Ag., MM.</strong>
          </footer>
        </article>
      </main>
    </PublicShell>
  )
}
