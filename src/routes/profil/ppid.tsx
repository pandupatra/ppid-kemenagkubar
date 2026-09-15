import { Button } from '@/components/ui/button'
import { PublicShell } from '@/components/public/PublicShell'
import { TableOfContents } from '@/components/public/TableOfContents'
import { Download } from 'lucide-react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/profil/ppid')({ component: ProfilePage })

const implementers = [
  'Sulton Gamma Firmansyah, S.Sos',
  'Nurul Izza Desliana, S.Sos',
  'Sylvia Herlina, S.Sos',
  'Siti Sarah Apriani, S.Sos',
  'Syahtiar Aditiawan',
  'Nailul Author, S.E.',
  'Zul Fathir Fainul, S.E.',
  'Pandu Patra Walujo, S.Kom',
  'Miftah Lutvi, S.Kom',
]

const responsibilities = [
  {
    title: 'Atasan PPID',
    description:
      'Memutuskan keberatan atas permohonan informasi dan melakukan pengawasan terhadap pelaksanaan tugas PPID.',
  },
  {
    title: 'PPID',
    description:
      'Mengoordinasikan pengumpulan, penyimpanan, pendokumentasian, dan publikasi informasi serta pelayanan permohonan informasi publik.',
  },
  {
    title: 'PPID Pelaksana',
    description:
      'Menyediakan data dan informasi dari masing-masing unit kerja di lingkungan Kantor Kementerian Agama Kabupaten Kutai Barat kepada PPID.',
  },
]

const tableOfContents = [
  { href: '#tentang-ppid', label: 'Tentang PPID' },
  { href: '#tugas-wewenang', label: 'Tugas dan Wewenang' },
  { href: '#struktur-ppid', label: 'Struktur PPID' },
  { href: '#dasar-penetapan', label: 'Dasar Penetapan' },
]

function ProfilePage() {
  return (
    <PublicShell>
      <main id="isi-utama">
        <section className="profile-hero" aria-labelledby="profile-title">
          <div className="page-container profile-hero-layout">
            <div className="profile-hero-copy">
              <h1 id="profile-title">Profil PPID</h1>
              <p className="lead profile-subtitle">
                Pejabat Pengelola Informasi dan Dokumentasi
              </p>
            </div>
          </div>
        </section>
        <div className="page-container profile-page-layout">
          <aside className="profile-page-toc">
            <TableOfContents items={tableOfContents} />
          </aside>
          <div className="profile-page-content">
            <section className="profile-introduction section" id="tentang-ppid">
              <div className="profile-section-heading">
                <h2>Tentang PPID</h2>
                <span aria-hidden="true" />
              </div>
              <div className="profile-prose">
                <p>
                  Dalam rangka memberikan pelayanan Informasi Publik sebagaimana
                  diamanatkan dalam Peraturan Pemerintah Nomor 61 Tahun 2010
                  tentang Pelaksanaan Undang-Undang Nomor 14 Tahun 2008 tentang
                  Keterbukaan Informasi Publik, Menteri Agama menetapkan Pejabat
                  Pengelola informasi dan Dokumentasi (PPID) melalui Keputusan
                  Menteri Agama (KMA) Nomor 200 Tahun 2012 tentang Pejabat
                  Pengelola Informasi dan Dokumentasi (PPID) Kementerian Agama
                  dan diperbaharui menjadi Keputusan Menteri Agama (KMA) Nomor
                  533 Tahun 2018 tentang Pejabat Pengelola Informasi dan
                  Dokumentasi Kementerian Agama dan Atasan Pejabat Pengelola
                  Informasi dan Dokumentasi Kementerian Agama dan diperbaharui
                  menjadi Keputusan Menteri Agama (KMA) Nomor 461 Tahun 2020
                  tentang Pejabat Pengelola Informasi dan Dokumentasi
                  Kementerian Agama, dan Atasan Pejabat Pengelola Informasi dan
                  Dokumentasi Kementerian Agama dan diperbaharui lagi menjadi
                  Keputusan Menteri Agama (KMA) Nomor 657 Tahun 2021 tentang
                  Pejabat Pengelola Informasi dan Dokumentasi Kementerian Agama,
                  dan Atasan Pejabat Pengelola Informasi dan Dokumentasi
                  Kementerian Agama. Pada Tahun 2025 diperbaharui lagi menjadi
                  Keputusan Menteri Agama (KMA) Nomor 1518 Tahun 2025 tentang
                  Pengelola Informasi dan Dokumentasi. Pada Keputusan Menteri
                  Agama Nomor 1518 Tahun 2025 tersebut ditetapkan bahwa PPID
                  Kementerian Agama dan Atasan PPID Kementerian Agama terdiri
                  atas:
                </p>
                <h3>
                  I. Pejabat Pengelola Informasi dan Dokumentasi (PPID)
                  Kementerian Agama
                </h3>
                <ol>
                  <li>
                    PPID Utama yaitu Biro Humas dan Komunikasi Publik
                    Sekretariat Jenderal.
                  </li>
                  <li>
                    PPID Unit yaitu:
                    <ol type="a">
                      <li>
                        PPID Unit Eselon I Pusat yaitu Kepala Biro Humas dan
                        Komunikasi Publik sebagai PPID Unit Sekretariat
                        Jenderal, Sekretaris Unit Eselon I pada Satuan Kerja
                        Inspektorat Jenderal, Direktorat Jenderal Pendidikan
                        Islam, Direktorat Jenderal Bimbingan Masyarakat Islam,
                        Direktorat Jenderal Bimbingan Masyarakat Kristen,
                        Direktorat Jenderal Bimbingan Masyarakat Katolik,
                        Direktorat Jenderal Bimbingan Masyarakat Hindu,
                        Direktorat Jenderal Bimbingan Masyarakat Buddha, Badan
                        Moderasi dan Badan Pengembangan Sumber Daya Manusia.
                      </li>
                      <li>
                        PPID Unit Kantor Wilayah Kementerian Agama Provinsi
                        yaitu Kepala Bagian Tata Usaha (34 Unit).
                      </li>
                      <li>
                        PPID Unit Kantor Kementerian Agama Kabupaten/Kota yaitu
                        Kepala Subbagian Tata Usaha (512 Unit).
                      </li>
                      <li>
                        PPID Unit Universitas/Institut dijabat oleh Wakil Rektor
                        yang membidangi bagian Administrasi Umum dan Kehumasan,
                        sedangkan PPID Unit Sekolah Tinggi dijabat oleh Wakil
                        Ketua yang membidangi bagian Administrasi Umum dan
                        Kehumasan. PPID Unit Perguruan Tinggi Keagamaan Negeri
                        (PTKN) terdiri dari: Universitas Islam Negeri (23 Unit),
                        Institut Agama Islam Negeri (29 Unit), Sekolah Tinggi
                        Agama Islam Negeri (5 Unit), Institut Agama Kristen
                        Negeri (6 Unit), Sekolah Tinggi Agama Kristen Protestan
                        Negeri (1 Unit), Sekolah Tinggi Agama Katolik Negeri (1
                        Unit), Universitas Hindu Negeri (1 Unit), Institut Agama
                        Hindu Negeri (2 Unit), Sekolah Tinggi Agama Hindu Negeri
                        (1 Unit), Sekolah Tinggi Agama Buddha Negeri (2 Unit).
                      </li>
                      <li>
                        PPID Unit Balai yaitu Kepala Subbagian Tata Usaha. PPID
                        Unit Balai terdiri dari: PPID Balai Penelitian dan
                        Pengembangan Agama (3 Unit), dan PPID Balai Pendidikan
                        dan Pelatihan Keagamaan (14 Unit).
                      </li>
                    </ol>
                  </li>
                </ol>
                <h3>
                  II. Atasan Pejabat Pengelola Informasi dan Dokumentasi (PPID)
                  Kementerian Agama
                </h3>
                <ol>
                  <li>
                    Atasan PPID Kementerian Agama yaitu Sekretaris Jenderal.
                  </li>
                  <li>
                    Atasan PPID Unit yaitu:
                    <ol type="a">
                      <li>
                        Atasan PPID Unit Eselon I Pusat yaitu Sekretaris
                        Jenderal, Inspektur Jenderal, Direktur Jenderal
                        Pendidikan Islam, Direktur Jenderal Penyelenggaraan Haji
                        dan Umrah, Direktur Jenderal Bimbingan Masyarakat Islam,
                        Direktur Jenderal Bimbingan Masyarakat Kristen, Direktur
                        Jenderal Bimbingan Masyarakat Katolik, Direktur Jenderal
                        Bimbingan Masyarakat Hindu, Direktur Jenderal Bimbingan
                        Masyarakat Buddha, Kepala Badan Moderasi dan Badan
                        Pengembangan Sumber Daya Manusia.
                      </li>
                      <li>
                        Atasan PPID Unit Kantor Wilayah Kementerian Agama
                        Provinsi yaitu Kepala Kantor Kementerian Agama Wilayah
                        Provinsi (34).
                      </li>
                      <li>
                        Atasan PPID Unit Kantor Kementerian Agama Kabupaten/Kota
                        yaitu Kepala Kantor Kementerian Agama Kabupaten/Kota
                        (512).
                      </li>
                      <li>
                        Atasan PPID Unit Universitas/Institut yaitu Rektor,
                        sedangkan Atasan PPID Unit Sekolah Tinggi yaitu Ketua.
                      </li>
                      <li>Atasan PPID Unit Balai yaitu Kepala Balai.</li>
                    </ol>
                  </li>
                </ol>
                <p>
                  Agar pelaksanaan keterbukaan informasi publik pada satuan
                  kerja Pusat dan Daerah berjalan dengan baik, Menteri Agama
                  menetapkan Keputusan Menteri Agama Nomor 92 Tahun 2019 tentang
                  Pedoman Layanan Informasi Publik Bagi Pejabat Pengelola
                  Informasi dan Dokumentasi Kementerian Agama dan Atasan Pejabat
                  Pengelola Informasi dan Dokumentasi Kementerian Agama.
                </p>
                <p>
                  PPID Utama maupun PPID Unit Kementerian Agama bertanggung
                  jawab untuk melakukan penyediaan, penyimpanan,
                  pendokumentasian, pelayanan, dan pengamanan informasi publik.
                </p>
              </div>
            </section>
            <section
              className="profile-responsibilities section"
              id="tugas-wewenang"
            >
              <div>
                <div className="profile-section-heading">
                  <h2>Tugas dan Wewenang</h2>
                  <span aria-hidden="true" />
                </div>
                <ol>
                  {responsibilities.map(({ title, description }, index) => (
                    <li key={title}>
                      <span className="profile-duty-number">{index + 1}</span>
                      <div>
                        <h3>{title}</h3>
                        <p>{description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </section>
            <section className="profile-structure section" id="struktur-ppid">
              <div className="profile-section-heading">
                <h2>
                  Struktur PPID Kantor Kementerian Agama Kabupaten Kutai Barat
                </h2>
                <span aria-hidden="true" />
              </div>
              <div className="profile-leadership">
                <div>
                  <p className="section-kicker profile-label">Atasan PPID</p>
                  <h3>A. Johan.MRP, S.Ag.,M.M.</h3>
                  <p>Kepala Kantor</p>
                </div>
                <div>
                  <p className="section-kicker profile-label">PPID</p>
                  <h3>H. Achmad Syofian, S.Ag.,M.Pd.</h3>
                  <p>Kepala Sub Bagian Tata Usaha</p>
                </div>
              </div>
              <div className="profile-implementers">
                <p className="section-kicker profile-label">PPID Pelaksana</p>
                <ol>
                  {implementers.map((name) => (
                    <li key={name}>{name}</li>
                  ))}
                </ol>
              </div>
            </section>
            <section
              className="profile-decision-section section section-muted"
              id="dasar-penetapan"
            >
              <div className="profile-decision-content">
                <div className="profile-section-heading">
                  <h2>Dasar Penetapan</h2>
                  <span aria-hidden="true" />
                </div>
                <h3>SK Nomor 275 Tahun 2026</h3>
                <p>
                  tentang Penunjukan Pejabat Pengelola Informasi dan Dokumentasi
                  (PPID) pada Kantor Kementerian Agama Kabupaten Kutai Barat.
                </p>
                <p className="profile-decision-date">
                  Ditetapkan pada 13 Agustus 2026
                </p>
                <Button asChild>
                  <a href="#struktur-ppid">
                    <Download aria-hidden="true" />
                    Unduh SK PPID
                  </a>
                </Button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </PublicShell>
  )
}
