import { ArrowRight } from 'lucide-react'
import { createFileRoute } from '@tanstack/react-router'
import { PublicPage } from '../../components/public/PublicPage'

type Regulation = Readonly<{ title: string; href: string }>

type RegulationGroup = Readonly<{
  title: string
  description: string
  items: readonly Regulation[]
}>

const regulationGroups: readonly RegulationGroup[] = [
  {
    title: 'Peraturan',
    description: 'Daftar peraturan terkait Keterbukaan Informasi Publik.',
    items: [
      [
        'Undang-Undang (UU) Nomor 14 Tahun 2008 tentang Keterbukaan Informasi Publik',
        'https://ppid.kemenag.go.id/v3/files/60UU_No_14_Tahun_2008_tentang_KIP.pdf',
      ],
      [
        'Peraturan Pemerintah (PP) Nomor 61 Tahun 2010 tentang Pelaksanaan Undang-Undang Keterbukaan Informasi Publik',
        'https://ppid.kemenag.go.id/v3/files/12Nomor_61_Tahun_2010_Keterbukaan_Informasi_Publik.pdf',
      ],
      [
        'Peraturan Komisi Informasi (PERKI) Nomor 1 Tahun 2021 tentang Standar Layanan Informasi Publik (SLIP)',
        'https://ppid.kemenag.go.id/v3/files/PerKIP%201%20Tahun%202021%20SLIP.pdf',
      ],
      [
        'Peraturan Komisi Informasi (PERKI) Nomor 1 Tahun 2013 tentang Prosedur Penyelesaian Sengketa Informasi Publik',
        'https://ppid.kemenag.go.id/v3/files/40Perki_No.1_Tahun_2013_.pdf',
      ],
      [
        'Peraturan Mahkamah Agung RI (Perma) Nomor 2 Tahun 2011 tentang Tata Cara Penyelesaian Sengketa Informasi Publik di Pengadilan',
        'https://ppid.kemenag.go.id/v3/files/6perma-no-2-tahun-2011-tentang-tata-cara-penyelesaian-sengketa-informasi-publik-pengadilan.pdf',
      ],
      [
        'Keputusan Menteri Agama (KMA) Nomor 92 Tahun 2019 tentang Pedoman Layanan Informasi Publik Bagi Pejabat Pengelola Informasi dan Dokumentasi Kementerian Agama dan Atasan Pejabat Pengelola Informasi dan Dokumentasi Kementerian Agama',
        'https://ppid.kemenag.go.id/v3/files/33kma-92-2019-pedoman-layanan-publik-ppid-atasan-ppid.pdf',
      ],
      [
        'Keputusan Menteri Agama Nomor 1518 Tahun 2025 tentang Pengelola Informasi dan Dokumentasi pada Kementerian Agama',
        'https://ppid.kemenag.go.id/v5/files/2025/KMA%20Nomor%201518%20Tahun%202025%20tentang%20Pengelola%20Informasi%20dan%20Dokumentasi.pdf',
      ],
      [
        'Keputusan Menteri Agama Nomor 284 Tahun 2024 tentang Pedoman Pengelolaan Kehumasan',
        'https://ppid.kemenag.go.id/v5/files/2026/KMA%20284%20Tahun%202024%20tentang%20Pedoman%20Tata%20Kelola%20Kehumasan.pdf',
      ],
    ].map(([title, href]) => ({ title, href })),
  },
  {
    title: 'Produk hukum',
    description: 'Daftar produk hukum yang dikeluarkan oleh Kementerian Agama.',
    items: [
      [
        'Surat Edaran Sekretaris Jenderal Kementerian Agama Nomor 27 Tahun 2025 tentang Pelaksanaan Gerakan Kementerian Agama Aman, Sejuk, Rindang dan Indah',
        'https://ppid.kemenag.go.id/v5/files/2026/Surat%20Edaran%20Sekjen%20No%2027%20Tahun%202025.pdf',
      ],
      [
        'Surat Edaran Sekretaris Jenderal Kementerian Agama Nomor 29 Tahun 2025 tentang Penguatan Publikasi Capaian dan Dampak Kinerja Kementerian Agama',
        'https://ppid.kemenag.go.id/v5/files/2025/SE%20No%2029%20Tahun%202025.pdf',
      ],
      [
        'Surat Edaran Sekretaris Jenderal Kementerian Agama Nomor 5 Tahun 2026 tentang Penyesuaian Tugas Kedinasan bagi Pegawai ASN Kementerian Agama pada Masa Libur Nasional dan Cuti Bersama Hari Suci Nyepi (Tahun Baru Saka 1948) dan Hari Raya Idul Fitri 1447 Hijriah',
        'https://ppid.kemenag.go.id/v5/files/2026/SE%205%20TAHUN%20%202026%20(1).pdf',
      ],
      [
        'Surat Sekretaris Jenderal Kementerian Agama tentang Optimalisasi Pengelolaan Keterbukaan Informasi Publik melalui PPID',
        'https://ppid.kemenag.go.id/v5/files/2026/20260310151110surat%20sekjen%20hasil%20monev%20ptkn%20dan%20kanwil.PDF',
      ],
      [
        'Peraturan Presiden Republik Indonesia Nomor 18 Tahun 2026 tentang Perubahan atas Peraturan Presiden Nomor 152 Tahun 2024 tentang Kementerian Agama',
        'https://ppid.kemenag.go.id/v5/files/2026/Peraturan_Presiden_No__18_Tahun_2026_Tentang_Perubahan_Atas_Peraturan_Presiden_Nomor_152_Tahun_2024_Tentang_Kementerian_Agama.pdf',
      ],
      [
        'Keputusan Menteri Agama Nomor 1644 Tahun 2025 tentang Kantor Kepala Urusan Agama',
        'https://ppid.kemenag.go.id/v5/files/2026/keputusan-menteri-agama-1644-2025_260108.pdf',
      ],
      [
        'Peraturan Menteri Agama Nomor 24 Tahun 2024 tentang Organisasi dan Tata Kerja Kantor Urusan Agama',
        'https://ppid.kemenag.go.id/v5/files/2026/pma-no-24-tahun-2024-tentang-organisasi-dan-tata-kerja-kantor-urusan-agamapdf.pdf',
      ],
      [
        'Peraturan Menteri Agama Nomor 16 Tahun 2026 tentang Perubahan atas Peraturan Menteri Agama Nomor 33 Tahun 2024 tentang Organisasi dan Tata Kerja Kementerian Agama',
        'https://ppid.kemenag.go.id/v5/files/2026/PMA%2016%20TAHUN%202026_SALINAN.pdf',
      ],
    ].map(([title, href]) => ({ title, href })),
  },
  {
    title: 'Rancangan peraturan',
    description:
      'Daftar rancangan peraturan terkait Keterbukaan Informasi Publik.',
    items: [
      [
        'Rancangan Keputusan Menteri Agama Republik Indonesia tentang Pejabat Pengelola Informasi dan Dokumentasi Kementerian Agama dan Atasan Pejabat Pengelola Informasi dan Dokumentasi',
        'https://ppid.kemenag.go.id/v3/files/64Draft-KMA-PPID-dan-Atasan-PPID-Kemenag.pdf',
      ],
      [
        'Rancangan Keputusan Menteri Agama Republik Indonesia tentang Pedoman Layanan Informasi Publik Bagi Pejabat Pengelola Informasi dan Dokumentasi Kementerian Agama dan Atasan Pejabat Pengelola Informasi dan Dokumentasi Kementerian Agama',
        'https://ppid.kemenag.go.id/v3/files/22018-12-06-Draft%20KMA%20ttg%20Pedoman%20Layanan%20Informasi%20Publik%20di%20Kemenag-edit%20final%20sblm%20ke%20rohukum.pdf',
      ],
    ].map(([title, href]) => ({ title, href })),
  },
]

export const Route = createFileRoute('/regulasi/')({
  component: RegulationsPage,
})

function RegulationsPage() {
  return (
    <PublicPage
      eyebrow="Regulasi"
      title="Landasan layanan informasi publik"
      lead="Daftar regulasi dan produk hukum Kementerian Agama yang menjadi rujukan pelayanan informasi di lingkungan Kemenag Kutai Barat."
    >
      <div className="py-8">
        {regulationGroups.map((group) => (
          <section
            className="section p-0 mb-8 page-container"
            key={group.title}
          >
            <div className="mb-5">
              <h2>{group.title}</h2>
              <p className="lead">{group.description}</p>
            </div>
            <div className="document-list">
              {group.items.map((regulation) => (
                <a
                  className="simple-row group text-foreground no-underline transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  href={regulation.href}
                  key={regulation.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Buka PDF di tab baru: ${regulation.title}`}
                >
                  <div>
                    <h3>{regulation.title}</h3>
                    <p>Dokumen PDF dari PPID Kementerian Agama RI</p>
                  </div>
                  <ArrowRight
                    className="mt-1 size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-focus-visible:translate-x-1"
                    aria-hidden="true"
                  />
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
    </PublicPage>
  )
}
