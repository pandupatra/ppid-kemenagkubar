import { PublicShell } from '@/components/public/PublicShell'
import { TableOfContents } from '@/components/public/TableOfContents'
import { getPublicMinistryOrganizationChart } from '@/modules/documents/ministry-profile'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/profil/kantor-kemenag-kubar')({
  loader: () => getPublicMinistryOrganizationChart(),
  component: MinistryProfilePage,
})

const tableOfContents = [
  { href: '#sejarah', label: 'Sejarah' },
  { href: '#visi-misi', label: 'Visi dan Misi' },
  { href: '#struktur-organisasi', label: 'Struktur Organisasi' },
  { href: '#kua-madrasah', label: 'Profil KUA dan Madrasah' },
]

const missions = [
  'Meningkatkan kualitas kesalehan umat beragama menuju masyarakat yang taat dan berakhlak mulia.',
  'Memperkuat moderasi beragama dan kerukunan umat beragama dalam semangat persatuan dan keberagaman lokal.',
  'Memberikan layanan keagamaan yang adil, mudah, dan menjangkau seluruh wilayah Kutai Barat.',
  'Meningkatkan pemerataan dan mutu pendidikan agama dan keagamaan yang berdaya saing dan berbasis kearifan lokal.',
  'Mendorong produktivitas pendidikan keagamaan agar melahirkan generasi unggul, religius, dan beradat.',
  'Mewujudkan tata kelola pemerintahan yang bersih, digital, dan melayani demi kesejahteraan masyarakat secara merata.',
]

const religiousAffairsOffices = [
  'Melak',
  'Barong Tongkok',
  'Linggang Bigung',
  'Long Iram',
  'Muara Lawa',
  'Muara Pahu',
  'Damai',
  'Penginggahan',
  'Jempang',
  'Bongan',
]

const madrasahs = [
  [
    'RA AL-HIKMAH',
    '69750986',
    'Swasta',
    'Jalan Trans Kalimantan RT 4',
    'Rejo Basuki',
    'Barong Tongkok',
  ],
  [
    'RA AS-SALAM',
    '69898748',
    'Swasta',
    'Jalan Ahmad Yeni RT 3',
    'Muara Kedang',
    'Bongan',
  ],
  [
    'RA AZKIYA ISLAMIC SCHOOL',
    '70006253',
    'Swasta',
    'Jalan Gajah Mada RT 7',
    'Barong Tongkok',
    'Barong Tongkok',
  ],
  [
    'RA ISHLAHUL UMMAH NAHDLATUL WATHAN NW',
    '70006713',
    'Swasta',
    'Jalan Teluk Siwo RT 4',
    'Muara Lawa',
    'Muara Lawa',
  ],
  [
    'RA AL-BAYAN',
    '69750988',
    'Swasta',
    'Jalan H Nurdin RT 10',
    'Melak Ulu',
    'Melak',
  ],
  [
    "RA NI'MATUL ULUM",
    '69750989',
    'Swasta',
    'Jalan Trans Kalimantan RT 2',
    'Lambing',
    'Muara Lawa',
  ],
  [
    'RA Al-Wahdah',
    '70029738',
    'Swasta',
    'Jalan Naras Gunag RT 13',
    'Simpang Raya',
    'Barong Tongkok',
  ],
  [
    'RA SMART BEE ISTIQOMAH',
    '70041884',
    'Swasta',
    'Jalan Danau Aco RT 006',
    'Purwodadi',
    'Linggang Bigung',
  ],
  [
    'MIS AL KAUTSAR',
    '69819704',
    'Swasta',
    'Jalan Thamrin RT 4',
    'Purwodadi',
    'Linggang Bigung',
  ],
  [
    'MIS AL-HIDAYAH',
    '69819705',
    'Swasta',
    'Jalan Islamic Center 1 RT 32',
    'Melak Ulu',
    'Melak',
  ],
  [
    'MIS DDI.LONG IRAM',
    '60723277',
    'Swasta',
    'Jalan KH Abd Rahman RT 2',
    'Long Iram Seberang',
    'Long Iram',
  ],
  [
    'MIS NIMATUL ULUM',
    '69728062',
    'Swasta',
    'Jalan Trans Kalimantan RT 2',
    'Lambing',
    'Muara Lawa',
  ],
  [
    'MIS NUR SALAM',
    '60723276',
    'Swasta',
    'Jalan Trans Kalimantan RT 3',
    'Muara Tae',
    'Jempang',
  ],
  [
    'MIS AL-HIKMAH',
    '60723275',
    'Swasta',
    'Jalan Trans Kalimantan RT 4',
    'Rejo Basuki',
    'Barong Tongkok',
  ],
  [
    'MIS DARUD DAKWAH WAL IRSYAD',
    '60723278',
    'Swasta',
    'Tering Seberang RT 03',
    'Tering Seberang',
    'Tering',
  ],
  [
    'MIS SUBULUSSALAM',
    '60723274',
    'Swasta',
    'Jalan Pandan Wangi RT 18',
    'Simpang Raya',
    'Barong Tongkok',
  ],
  [
    'MTSN KUTAI BARAT',
    '30410060',
    'Negeri',
    'Jalan Islamic Center 1 RT 32',
    'Melak Ulu',
    'Melak',
  ],
  [
    'MTSS DDI TERING',
    '30410061',
    'Swasta',
    'Jalan Kapten Tausin RT 3',
    'Tering Seberang',
    'Tering',
  ],
  [
    'MTSS DDI TANJUNG JONE',
    '30410059',
    'Swasta',
    'Jalan AR Hakim No 2',
    'Tanjung Jone',
    'Jempang',
  ],
  [
    'MTSS AN-NUR',
    '69753889',
    'Swasta',
    'Jalan Trans Kalimantan RT 3',
    'Muara Tae',
    'Jempang',
  ],
  [
    'MTSS SUBULUSSALAM',
    '30410057',
    'Swasta',
    'Jalan Pandan Wangi RT 18',
    'Simpang Raya',
    'Barong Tongkok',
  ],
  [
    'MTSS NI MATUL ULUM',
    '69881747',
    'Swasta',
    'Jalan Trans Kalimantan RT 2',
    'Lambing',
    'Muara Lawa',
  ],
  [
    'MTSS BAITULMUKARRAMAH',
    '69788466',
    'Swasta',
    'Jalan Ki Hajar Dewantara RT 5',
    'Tanjung Laong',
    'Muara Pahu',
  ],
  [
    'MTSS AL KAUTSAR',
    '70006904',
    'Swasta',
    'Jalan Belibis RT 3',
    'Purwodadi',
    'Linggang Bigung',
  ],
  [
    'MTSS AL-HIKMAH',
    '69941536',
    'Swasta',
    'Jalan Trans Kalimantan RT 4',
    'Rejo Basuki',
    'Barong Tongkok',
  ],
  [
    'MAS SUBULUSSALAM',
    '30315171',
    'Swasta',
    'Jalan Pandan Wangi RT 18',
    'Simpang Raya',
    'Barong Tongkok',
  ],
  [
    'MAS AL HIKMAH',
    '70006906',
    'Swasta',
    'Jalan Trans Kalimantan RT 4',
    'Rejo Basuki',
    'Barong Tongkok',
  ],
  [
    'MAN KUTAI BARAT',
    '30315172',
    'Negeri',
    'Jalan Islamic Center 1 RT 32',
    'Melak Ulu',
    'Melak',
  ],
  [
    'MA AL KAUTSAR',
    '70027640',
    'Swasta',
    'Jalan Belibis RT 3',
    'Purwodadi',
    'Linggang Bigung',
  ],
  [
    'MA HAJI ABDUL THAIB LAGUNGGUNG',
    '70031361',
    'Swasta',
    'Jalan Kapten Tausin RT 3',
    'Tering Seberang',
    'Tering',
  ],
] as const

function SectionHeading({ children }: Readonly<{ children: string }>) {
  return (
    <div className="profile-section-heading">
      <h2>{children}</h2>
      <span aria-hidden="true" />
    </div>
  )
}

function MinistryProfilePage() {
  const organizationChart = Route.useLoaderData()

  return (
    <PublicShell>
      <main id="isi-utama">
        <section className="profile-hero" aria-labelledby="profile-title">
          <div className="page-container profile-hero-layout">
            <div className="profile-hero-copy">
              <h1 id="profile-title">Profil Kemenag</h1>
              <p className="lead profile-subtitle">
                Kantor Kementerian Agama Kabupaten Kutai Barat
              </p>
            </div>
          </div>
        </section>

        <div className="page-container profile-page-layout">
          <aside className="profile-page-toc">
            <TableOfContents items={tableOfContents} />
          </aside>

          <div className="profile-page-content ministry-profile-content">
            <section className="section" id="sejarah">
              <SectionHeading>Sejarah</SectionHeading>
              <div className="profile-prose">
                <p>
                  Kantor Kementerian Agama Kabupaten Kutai Barat hadir seiring
                  pembentukan Kabupaten Kutai Barat pada 5 November 1999
                  berdasarkan Undang-Undang Nomor 47 Tahun 1999.
                </p>
                <p>
                  Pada awal tahun 2000, Bapak Abdul Hamid yang saat itu menjabat
                  sebagai Kepala KUA Kecamatan Melak menerima mandat untuk
                  menyiapkan pembentukan kantor sekaligus menjalankan tugas
                  sebagai Pelaksana Harian Kepala Kantor Kementerian Agama
                  Kabupaten Kutai Barat.
                </p>
                <p>
                  Sejak masa awal tersebut, kantor ini berperan dalam pelayanan
                  keagamaan, pembinaan umat, pendidikan agama, dan penguatan
                  kerukunan masyarakat di wilayah Kutai Barat.
                </p>
              </div>
            </section>

            <section
              className="section section-muted ministry-vision"
              id="visi-misi"
            >
              <SectionHeading>Visi dan Misi</SectionHeading>
              <div className="ministry-vision-statement">
                <h3>Visi</h3>
                <p>
                  Kementerian Agama yang profesional dan andal dalam membangun
                  masyarakat Kutai Barat yang saleh, moderat, cerdas, dan unggul
                  dalam semangat keberagaman, beradat, dan gotong royong menuju
                  daerah yang sejahtera, aman, adil, dan merata.
                </p>
              </div>
              <div className="ministry-missions">
                <h3>Misi</h3>
                <ol>
                  {missions.map((mission) => (
                    <li key={mission}>{mission}</li>
                  ))}
                </ol>
              </div>
            </section>

            <section className="section" id="struktur-organisasi">
              <SectionHeading>Struktur Organisasi</SectionHeading>
              {organizationChart.src ? (
                <figure className="ministry-organization-chart">
                  <img
                    src={organizationChart.src}
                    alt={organizationChart.alt}
                  />
                  <figcaption>
                    Struktur Organisasi Kantor Kementerian Agama Kabupaten Kutai
                    Barat
                  </figcaption>
                </figure>
              ) : (
                <p className="ministry-chart-empty">
                  Bagan struktur organisasi belum tersedia.
                </p>
              )}
            </section>

            <section className="section" id="kua-madrasah">
              <SectionHeading>Profil KUA dan Madrasah</SectionHeading>
              <div className="ministry-directory-block">
                <h3>Kantor Urusan Agama (KUA)</h3>
                <ul className="ministry-kua-list">
                  {religiousAffairsOffices.map((office) => (
                    <li key={office}>{office}</li>
                  ))}
                </ul>
              </div>

              <div className="ministry-directory-block">
                <div className="ministry-table-heading">
                  <h3>Madrasah se-Kutai Barat</h3>
                  <p>30 satuan pendidikan</p>
                </div>
                <div
                  className="ministry-table-scroll"
                  tabIndex={0}
                  role="region"
                  aria-label="Daftar madrasah se-Kutai Barat"
                >
                  <table className="ministry-school-table">
                    <thead>
                      <tr>
                        <th scope="col">No.</th>
                        <th scope="col">Satuan pendidikan</th>
                        <th scope="col">NPSN</th>
                        <th scope="col">Status</th>
                        <th scope="col">Alamat</th>
                        <th scope="col">Desa</th>
                        <th scope="col">Kecamatan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {madrasahs.map((school, index) => (
                        <tr key={school[1]}>
                          <td>{index + 1}</td>
                          {school.map((value, columnIndex) => (
                            <td key={`${school[1]}-${columnIndex}`}>{value}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </PublicShell>
  )
}
