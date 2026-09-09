export type PublicDocument = {
  category: 'Berkala' | 'Setiap Saat' | 'Regulasi' | 'Standar Layanan'
  date: string
  format: string
  href: string
  id: string
  size: string
  title: string
  unit: string
  year: number
}

export const publicDocuments: PublicDocument[] = [
  {
    id: 'laporan-layanan-2025',
    href: '/informasi-publik/berkala/laporan-layanan-informasi-publik',
    title: 'Laporan Layanan Informasi Publik Tahun 2025',
    category: 'Berkala',
    year: 2025,
    unit: 'Kantor Kementerian Agama Kabupaten Kutai Barat',
    format: 'PDF',
    size: '1,8 MB',
    date: '18 Agustus 2026',
  },
  {
    id: 'standar-pelayanan-ppid',
    href: '/informasi-publik/setiap-saat/standar-pelayanan',
    title: 'Standar Pelayanan Informasi Publik',
    category: 'Standar Layanan',
    year: 2026,
    unit: 'Pejabat Pengelola Informasi dan Dokumentasi',
    format: 'PDF',
    size: '924 KB',
    date: '4 Agustus 2026',
  },
  {
    id: 'daftar-informasi-publik',
    href: '/informasi-publik/setiap-saat/daftar-informasi-publik-dip-kemenag-kutai-barat',
    title: 'Daftar Informasi Publik Kemenag Kutai Barat',
    category: 'Setiap Saat',
    year: 2026,
    unit: 'Pejabat Pengelola Informasi dan Dokumentasi',
    format: 'PDF',
    size: '2,1 MB',
    date: '29 Juli 2026',
  },
  {
    id: 'uu-kip',
    href: '/regulasi',
    title:
      'Undang-Undang Nomor 14 Tahun 2008 tentang Keterbukaan Informasi Publik',
    category: 'Regulasi',
    year: 2008,
    unit: 'Pemerintah Republik Indonesia',
    format: 'PDF',
    size: '611 KB',
    date: '12 Juli 2026',
  },
]
