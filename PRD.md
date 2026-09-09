# Product Requirements Document (PRD)

## Portal PPID Kantor Kementerian Agama Kabupaten Kutai Barat

| Atribut | Nilai |
| --- | --- |
| Status | Draft implementasi v1.0 |
| Tanggal | 4 September 2026 |
| Pemilik produk | Kantor Kementerian Agama Kabupaten Kutai Barat |
| Produk | Portal Pejabat Pengelola Informasi dan Dokumentasi (PPID) |
| Bahasa utama | Bahasa Indonesia |
| Arsitektur | TanStack Start modular monolith + Supabase project yang sudah ada |
| Hosting aplikasi | Vercel |

## 1. Ringkasan

Portal PPID Kemenag Kutai Barat adalah kanal resmi untuk mempublikasikan informasi publik, menjelaskan standar layanan, menerima permohonan informasi, menangani keberatan, dan menyediakan pelacakan proses yang dapat dipertanggungjawabkan.

Produk memakai proyek Supabase Kemenag Kutai Barat yang sudah ada. Tabel autentikasi `user`, `session`, `account`, dan `verification` tetap menjadi sumber identitas. Fitur PPID baru ditempatkan pada schema PostgreSQL `ppid` agar batas domain, hak akses, migrasi, dan audit tidak bercampur dengan layanan umum Kemenag Kubar.

Pengalaman utama bukan halaman promosi. Pengunjung harus dapat menemukan dokumen atau memulai permohonan informasi dari layar pertama, sementara petugas memperoleh antrean kerja berbasis tenggat dan jejak audit.

## 2. Latar belakang dan masalah

Informasi PPID saat ini berisiko tersebar di halaman, berkas, dan kanal layanan yang berbeda. Dampaknya:

- masyarakat sulit membedakan informasi berkala, serta-merta, setiap saat, dan dikecualikan;
- permohonan dan keberatan sulit dilacak secara konsisten;
- petugas tidak memiliki satu antrean kerja dengan tenggat hari kerja;
- publikasi dokumen, versi, dan status peninjauan tidak terdokumentasi secara utuh;
- data pribadi pemohon berisiko tercampur dengan konten publik;
- laporan layanan harus direkap secara manual.

Portal ini menyatukan katalog informasi, konten kelembagaan, layanan permohonan, keberatan, administrasi, dan pelaporan tanpa mengganti sistem autentikasi yang telah berjalan.

## 3. Tujuan produk

1. Memudahkan publik menemukan dan mengunduh informasi resmi tanpa harus mengajukan permohonan.
2. Menyediakan proses permohonan informasi dan keberatan yang jelas, terlacak, dan berbasis tenggat.
3. Membantu petugas PPID mengelola dokumen, disposisi, jawaban, dan bukti layanan dalam satu sistem.
4. Melindungi identitas, lampiran, serta dokumen jawaban yang tidak boleh menjadi publik.
5. Menghasilkan register dan statistik layanan yang dapat diaudit.
6. Menjaga konsistensi struktur menu dengan PPID Kementerian Agama RI, disesuaikan untuk Kemenag Kutai Barat.

## 4. Sasaran non-tujuan

### Dalam cakupan v1

- situs publik dengan enam menu utama;
- katalog dan pencarian dokumen publik;
- CMS halaman dan dokumen dengan alur draf–tinjau–terbit;
- permohonan informasi daring;
- akun pemohon dan pelacakan status;
- keberatan yang terkait dengan permohonan;
- dashboard petugas, disposisi, jawaban, dan tenggat;
- notifikasi email transaksional;
- register, statistik, dan audit log;
- penyimpanan publik dan privat di Supabase Storage.

### Di luar cakupan v1

- penggantian penuh autentikasi lama dengan Supabase Auth;
- aplikasi mobile native;
- integrasi sengketa langsung dengan Komisi Informasi;
- tanda tangan elektronik tersertifikasi;
- chatbot atau pencarian berbasis AI;
- pembayaran daring;
- multi-instansi di luar Kemenag Kutai Barat;
- migrasi otomatis seluruh konten dari situs PPID lain.

## 5. Pengguna dan kebutuhan

| Persona | Kebutuhan utama | Hak akses |
| --- | --- | --- |
| Pengunjung publik | Mencari profil, regulasi, standar layanan, dan dokumen | Konten terbit dan berkas publik |
| Pemohon | Mengirim permohonan, mengunggah syarat, melihat status, menerima jawaban | Data miliknya sendiri |
| Petugas PPID | Memverifikasi, mendisposisikan, memproses, dan menjawab permohonan | Kasus/unit yang ditugaskan |
| Editor konten | Menulis halaman dan mengelola dokumen | Konten draf; tidak otomatis menerbitkan |
| Reviewer/PPID | Meninjau klasifikasi dan menyetujui publikasi/jawaban | Persetujuan domain PPID |
| Atasan PPID | Memutus keberatan dan memantau kepatuhan | Semua keberatan dan laporan |
| Administrator | Mengelola konfigurasi, unit, anggota, dan kalender kerja | Administrasi sistem; akses data tetap tercatat |
| Auditor | Memeriksa register dan audit log | Baca-saja sesuai mandat |

## 6. Arsitektur informasi dan menu

### 6.1 Menu publik

| Menu | Submenu/isi minimum |
| --- | --- |
| Beranda | Pencarian informasi, pintasan kategori, permohonan informasi, lacak permohonan, dokumen terbaru, pengumuman penting, kontak PPID |
| Profil | Profil PPID, visi dan misi, tugas dan fungsi, struktur organisasi, profil pejabat, alamat/jam layanan/kontak |
| Regulasi | Undang-undang, peraturan pemerintah, Peraturan Komisi Informasi, regulasi Kementerian Agama, keputusan/ketetapan lokal |
| Layanan Informasi | Tata cara permohonan, formulir permohonan, pelacakan, tata cara keberatan, formulir keberatan, biaya, bantuan/kontak |
| Standar Layanan | Maklumat layanan, standar operasional, waktu layanan, jangka waktu, biaya/tarif, kanal layanan, hak dan kewajiban, mekanisme sengketa |
| Informasi Publik | Informasi berkala, serta-merta, setiap saat, Daftar Informasi Publik (DIP), informasi dikecualikan/hasil uji konsekuensi yang boleh diumumkan, laporan layanan |

### 6.2 Rute yang direkomendasikan

```text
/
/profil/:slug
/regulasi
/regulasi/:slug
/layanan-informasi
/layanan-informasi/permohonan
/layanan-informasi/lacak
/layanan-informasi/keberatan
/standar-layanan/:slug
/informasi-publik
/informasi-publik/:category
/informasi-publik/:category/:slug
/masuk
/akun/permohonan
/akun/permohonan/:receiptNumber
/akun/keberatan/:registrationNumber
/admin
/admin/konten
/admin/dokumen
/admin/permohonan
/admin/keberatan
/admin/laporan
/admin/pengaturan
```

## 7. Alur utama

### 7.1 Menemukan informasi publik

1. Pengunjung mencari dengan kata kunci atau memilih kategori.
2. Sistem menampilkan hasil terbit beserta tipe, tahun, unit pemilik, ukuran, dan tanggal pembaruan.
3. Pengunjung membuka detail, melihat metadata, lalu mengunduh dokumen.
4. Jika informasi tidak ditemukan, antarmuka menawarkan tautan langsung ke formulir permohonan dengan kata kunci pencarian diteruskan sebagai konteks.

### 7.2 Permohonan informasi

1. Pemohon masuk atau membuat akun menggunakan autentikasi yang sudah ada.
2. Pemohon mengisi identitas/perwakilan, rincian informasi, tujuan penggunaan, bentuk yang diinginkan, dan cara penyampaian.
3. Pemohon mengunggah dokumen identitas atau kuasa bila diperlukan.
4. Server memvalidasi data, membuat nomor tanda terima yang tidak berurutan, mencatat tenggat, dan mengirim bukti penerimaan.
5. Petugas memverifikasi kelengkapan, menentukan unit, dan memproses permohonan.
6. Jawaban dapat berupa diberikan seluruhnya, diberikan sebagian dengan redaksi, ditolak dengan dasar, dialihkan ke badan publik lain, atau informasi belum dikuasai/didokumentasikan.
7. Pemohon menerima pemberitahuan dan mengakses dokumen jawaban privat melalui tautan berumur pendek.
8. Seluruh perubahan penting dicatat sebagai event yang append-only.

### 7.3 Keberatan

1. Pemohon memilih permohonan asal.
2. Sistem hanya menawarkan alasan keberatan yang sah dan relevan.
3. Pemohon menyampaikan uraian dan lampiran/kuasa bila ada.
4. Sistem membuat nomor registrasi, tenggat tanggapan, dan tanda terima.
5. Atasan PPID meninjau kronologi serta memutus menerima seluruhnya, menerima sebagian, atau menolak.
6. Keputusan tertulis dan instruksi tindak lanjut tersedia bagi pemohon.

### 7.4 Publikasi dokumen

1. Editor membuat metadata dan mengunggah versi berkas.
2. Sistem memindai tipe/ukuran dan menaruh berkas baru di area karantina.
3. Reviewer menilai klasifikasi, periode publikasi, aksesibilitas, data pribadi, dan kebutuhan redaksi.
4. Setelah disetujui, versi dipromosikan ke bucket publik dan indeks pencarian diperbarui.
5. Revisi tidak menimpa bukti versi lama; versi publik aktif ditunjuk secara eksplisit.

## 8. Persyaratan fungsional

### FR-01 Konten halaman

- Editor dapat membuat, menyunting, menjadwalkan, mengarsipkan, dan melihat pratinjau halaman.
- Status: `draft`, `in_review`, `scheduled`, `published`, `archived`.
- Halaman memiliki slug unik, judul, ringkasan, isi terstruktur, metadata SEO, dan versi.
- Hanya reviewer atau role yang diberi kewenangan dapat menerbitkan.

### FR-02 Katalog dokumen

- Dokumen memiliki kategori, judul, uraian, nomor, tahun, unit pemilik, bahasa, kata kunci, periode keterbukaan, dan versi berkas.
- Kategori minimum: `periodic`, `immediate`, `available_anytime`, `dip`, `regulation`, `service_standard`, `service_report`.
- Informasi yang dikecualikan tidak boleh dipublikasikan sebagai berkas terbuka. Yang dapat ditampilkan hanya metadata/keputusan atau hasil uji konsekuensi yang telah disetujui untuk publik.
- Filter minimum: kategori, tahun, unit, tipe dokumen. Urutan default berdasarkan pembaruan terbaru.
- Unduhan publik harus memiliki nama berkas yang aman dan `Content-Disposition` yang benar.

### FR-03 Pencarian

- Pencarian penuh pada judul, ringkasan, kata kunci, nomor, unit, dan teks dokumen jika ekstraksi tersedia.
- Salah eja ringan dan kata kosong tidak boleh menghasilkan kegagalan.
- Hasil hanya berasal dari konten/versi aktif yang telah diterbitkan.
- Query pencarian tidak boleh mengekspos metadata internal atau dokumen privat.

### FR-04 Autentikasi dan akun

- Gunakan tabel `user`, `session`, `account`, dan `verification` yang sudah ada; jangan mengasumsikan `auth.uid()` Supabase tersedia.
- Session diverifikasi pada server untuk setiap server function/route yang dilindungi.
- `user.role` lama tidak menjadi satu-satunya sumber otorisasi PPID.
- Pengguna dapat melihat permohonan dan keberatan miliknya melalui pencocokan `user_id` di server.

### FR-05 Permohonan informasi

- Validasi server wajib untuk semua field dan berkas.
- Nomor tanda terima unik, tidak mudah ditebak, dan tetap bisa dicetak.
- Status minimum: `submitted`, `needs_correction`, `verified`, `assigned`, `in_progress`, `extended`, `fulfilled`, `partially_fulfilled`, `rejected`, `withdrawn`, `closed`.
- Setiap perubahan status memerlukan aktor, waktu, dan catatan/alasan yang sesuai.
- Perpanjangan hanya satu kali dan harus menyimpan alasan serta tanggal pemberitahuan.
- Tenggat dihitung dengan kalender hari kerja yang dapat dikonfigurasi.
- Sistem mendukung permohonan yang dimasukkan petugas untuk layanan luring.

### FR-06 Lampiran dan jawaban

- Lampiran pemohon, dokumen jawaban, dan dokumen keberatan disimpan privat.
- Akses unduhan memakai signed URL berumur pendek yang dibuat setelah pemeriksaan hak akses di server.
- Tipe, ukuran, nama asli, checksum, pemilik, dan tujuan berkas dicatat.
- Berkas baru melewati validasi MIME, ekstensi, batas ukuran, dan status pemindaian malware.
- Jawaban menyimpan keputusan, dasar/alasan, catatan redaksi, biaya bila ada, metode pengiriman, dan versi berkas.

### FR-07 Keberatan

- Keberatan wajib terkait dengan permohonan asal.
- Alasan minimum: penolakan, informasi berkala tidak tersedia, tidak ditanggapi, tanggapan tidak sesuai, tidak dipenuhi, biaya tidak wajar, atau melampaui waktu.
- Hanya Atasan PPID/delegasi yang dapat mengesahkan keputusan.
- Status minimum: `submitted`, `verified`, `under_review`, `decided_accepted`, `decided_partially_accepted`, `decided_rejected`, `implemented`, `closed`.

### FR-08 Dashboard petugas

- Ringkasan antrean: baru, perlu koreksi, jatuh tempo dekat, terlambat, menunggu unit, menunggu keputusan.
- Filter menurut status, unit, petugas, rentang tanggal, dan kondisi SLA.
- Detail kasus menampilkan data pemohon sesuai kebutuhan kerja, kronologi, lampiran, penugasan, dan tindakan yang diizinkan.
- Tindakan berisiko seperti penolakan, publikasi, atau perubahan keputusan memerlukan konfirmasi dan alasan.

### FR-09 Notifikasi

- Email minimum: tanda terima, permintaan koreksi, perpanjangan, jawaban, keputusan keberatan, dan pengingat internal.
- `email_outbox` lama dapat digunakan setelah ditambah `status`, `attempt_count`, `next_attempt_at`, `last_error`, `sent_at`, `template_key`, dan `idempotency_key`.
- Pengiriman bersifat idempoten dan dapat dicoba ulang; kegagalan email tidak membatalkan transaksi utama.

### FR-10 Pelaporan

- Register permohonan dan keberatan dapat diekspor sesuai role.
- Statistik publik tidak boleh memuat identitas atau rincian yang dapat mengidentifikasi pemohon.
- Indikator minimum: jumlah permohonan, hasil, rata-rata waktu tanggap, permohonan terlambat, keberatan, dan dokumen terbit per kategori.

### FR-11 Audit

- Audit log mencatat aktor, tindakan, objek, waktu, request ID, dan ringkasan perubahan sebelum/sesudah tanpa menyimpan rahasia mentah.
- Audit log bersifat append-only bagi aplikasi.
- Akses data pribadi, unduhan berkas privat, publikasi, penolakan, dan keputusan keberatan wajib diaudit.

## 9. Aturan bisnis dan SLA

- Baseline sistem mengikuti UU No. 14 Tahun 2008, PP No. 61 Tahun 2010, PerKI No. 1 Tahun 2021, dan ketentuan internal Kementerian Agama/Kemenag Kutai Barat yang berlaku.
- Default pemberitahuan tertulis: paling lambat 10 hari kerja sejak permohonan diterima.
- Perpanjangan default: paling lambat 7 hari kerja berikutnya, satu kali, dengan alasan tertulis.
- Tanggapan keberatan: paling lambat 30 hari sejak keberatan dicatat, mengikuti ketentuan yang berlaku dan dikonfirmasi oleh pemilik kebijakan sebelum go-live.
- Semua nilai SLA disimpan sebagai konfigurasi berversi. Perubahan konfigurasi tidak boleh mengubah tenggat kasus lama tanpa tindakan eksplisit dan audit.
- Kalender hari kerja menyimpan akhir pekan, hari libur nasional, dan hari libur lokal/khusus.
- Sistem memberi peringatan internal pada H-3, H-1, hari jatuh tempo, dan setelah lewat tenggat; nilai dapat dikonfigurasi.
- Perhitungan legal dan format formulir harus melalui legal/content review Kemenag Kutai Barat sebelum produksi.

## 10. Model data target

Semua tabel baru memakai schema `ppid`. Gunakan UUID untuk primary key kecuali ada alasan kuat. Kolom waktu menggunakan `timestamptz` UTC dan nama `snake_case`.

### 10.1 Tabel inti

| Tabel | Fungsi | Relasi penting |
| --- | --- | --- |
| `ppid.pages` | Identitas halaman dan status publikasi | active version |
| `ppid.page_versions` | Riwayat isi halaman | page, author, reviewer |
| `ppid.document_categories` | Taksonomi dokumen | parent opsional |
| `ppid.documents` | Metadata dokumen | category, owner unit, active version |
| `ppid.document_versions` | Versi berkas dan status pemindaian | document, uploader |
| `ppid.publication_reviews` | Keputusan review/redaksi | page/document/version |
| `ppid.organizational_units` | Unit kerja | parent opsional |
| `ppid.staff_memberships` | Role PPID per unit | existing `user.id`, unit |
| `ppid.information_requests` | Kasus permohonan | requester user, assignee, unit |
| `ppid.request_applicants` | Snapshot identitas pemohon/perwakilan | information request |
| `ppid.request_attachments` | Metadata berkas privat | information request |
| `ppid.request_assignments` | Riwayat disposisi | request, unit, staff |
| `ppid.request_events` | Kronologi append-only | request, actor |
| `ppid.request_responses` | Pemberitahuan/jawaban berversi | request, approver |
| `ppid.objections` | Kasus keberatan | source request, applicant |
| `ppid.objection_attachments` | Berkas privat keberatan | objection |
| `ppid.objection_events` | Kronologi append-only | objection, actor |
| `ppid.objection_decisions` | Keputusan berversi | objection, approver |
| `ppid.business_calendars` | Definisi kalender | active version |
| `ppid.calendar_days` | Libur/hari kerja khusus | business calendar |
| `ppid.audit_logs` | Jejak audit append-only | actor, resource |

### 10.2 Tabel lama yang dipakai

| Tabel existing | Keputusan |
| --- | --- |
| `user`, `session`, `account`, `verification` | Dipakai untuk autentikasi; akses hanya lewat server. Audit keamanan sebelum produksi. |
| `news_items` | Dapat ditampilkan di Beranda sebagai berita terkait; bukan sumber dokumen PPID. |
| `email_outbox` | Dipakai setelah penambahan state, retry, dan idempotensi. |
| `survey_responses` | Opsional untuk survei kepuasan setelah ditambah `survey_type` dan konteks layanan. |
| `services` | Tetap untuk katalog layanan umum, tidak menjadi katalog dokumen PPID. |
| `application_requests` dan turunannya | Tidak dipakai untuk permohonan informasi PPID; workflow dan kewajiban hukumnya berbeda. |

### 10.3 Integritas data

- Tambahkan foreign key eksplisit, index pada foreign key, unique constraint pada nomor registrasi/slug/idempotency key, dan check constraint/enum terkontrol pada status.
- Snapshot identitas pemohon disimpan pada kasus agar register historis tidak berubah ketika profil pengguna diperbarui.
- NIK tidak boleh menjadi field wajib universal. Jika benar-benar diperlukan, simpan terenkripsi atau sebagai vault reference; tampilkan selalu dalam bentuk tersamarkan.
- Event dan audit tidak boleh diperbarui/dihapus oleh role aplikasi biasa.

## 11. Penyimpanan berkas

| Bucket | Visibilitas | Isi |
| --- | --- | --- |
| `ppid-public-documents` | Public | Hanya versi dokumen yang telah disetujui untuk publik |
| `ppid-request-attachments` | Private | Identitas, surat kuasa, dan lampiran pemohon |
| `ppid-objection-attachments` | Private | Lampiran keberatan |
| `ppid-response-documents` | Private | Jawaban dan keputusan untuk pemohon tertentu |
| `ppid-quarantine` | Private/server-only | Unggahan yang belum lolos validasi/pemindaian |

Nama object tidak memakai nama asli atau NIK. Gunakan UUID/path acak; simpan nama asli hanya sebagai metadata yang terlindungi.

## 12. Keamanan dan privasi

- Browser hanya menerima Supabase public/anon key. Secret/service-role key hanya berada di server Vercel.
- Karena autentikasi existing bukan Supabase Auth, jangan membuat policy berdasarkan `auth.uid()` tanpa integrasi token yang dirancang dan diuji.
- Operasi sensitif dilakukan melalui TanStack Start server functions/server routes. Handler wajib melakukan autentikasi, otorisasi, validasi input, dan audit.
- RLS diaktifkan pada setiap tabel dalam schema yang terekspos. Schema `ppid` sebaiknya tidak diekspos langsung ke browser pada v1.
- Grants default-deny. Akses internal memakai koneksi server dengan fungsi/repository yang terkontrol.
- Terapkan CSRF protection sesuai pola autentikasi, secure/HTTP-only/SameSite cookies, rate limiting, dan anti-automation pada formulir publik.
- Jangan menulis token, NIK, nomor identitas, isi lampiran, atau signed URL ke log.
- Redaksi dokumen harus menghasilkan file turunan; file sumber tidak pernah dipublikasikan karena hanya ditutup secara visual.
- Tetapkan kebijakan retensi dan pemusnahan data sebelum go-live.
- Backup, restore drill, rotasi secret, dan penanganan insiden menjadi checklist operasional produksi.

## 13. Arsitektur aplikasi

### 13.1 Prinsip

- Modular monolith: satu aplikasi deployable, modul domain terpisah jelas.
- Server-first untuk data sensitif; client-side query untuk interaksi yang benar-benar membutuhkan revalidasi/optimistic state.
- Aturan bisnis berada di service/domain layer, bukan komponen React atau route handler.
- Repository layer menjadi satu-satunya jalur akses database dari domain service.
- Semua mutasi penting dibungkus transaksi dan menghasilkan event/audit.

### 13.2 Stack

| Lapisan | Pilihan |
| --- | --- |
| Full-stack framework | TanStack Start + React + TypeScript strict |
| Routing/SSR | TanStack Router / Start route loaders |
| Server API | TanStack server functions; server routes untuk download, webhook, sitemap, dan feed |
| Data client | TanStack Query bila state server interaktif diperlukan |
| Form | TanStack Form + schema validation |
| Tabel admin | TanStack Table |
| Database | Supabase PostgreSQL existing project |
| Auth | Sistem existing pada `user/session/account/verification` |
| Object storage | Supabase Storage |
| Email | Provider transaksional melalui worker/outbox |
| Hosting | Vercel |
| Observability | Structured logs, error tracking, audit log domain, health checks |

### 13.3 Modul kode

```text
src/
  routes/
    _public/
    _applicant/
    _admin/
    api/
  modules/
    auth/
    content/
    documents/
    information-requests/
    objections/
    reporting/
    notifications/
    audit/
  server/
    db/
    storage/
    email/
    security/
    observability/
  components/
    ui/
    public/
    applicant/
    admin/
  lib/
  styles/
supabase/
  migrations/
  seed.sql
```

## 14. Pendekatan desain

### 14.1 Tesis visual

**“Arsip layanan publik yang tegas dan mudah dipindai.”** Tampilan memadukan kewibawaan instansi dengan kepadatan informasi yang teratur. Pencarian dan status layanan menjadi elemen visual utama; dekorasi tidak boleh mengalahkan tugas pengguna.

### 14.2 Prinsip pengalaman

1. **Temukan dulu, minta bila perlu.** Pencarian dokumen tampil pada viewport pertama Beranda.
2. **Bahasa layanan, bukan bahasa sistem.** Gunakan “Permohonan sedang diperiksa”, bukan nama enum internal.
3. **Status selalu punya makna dan langkah berikutnya.** Setiap detail kasus menjelaskan kondisi, tanggal, tenggat, dan tindakan yang tersedia.
4. **Mobile sebagai kondisi nyata.** Form panjang dibagi dalam langkah logis, dapat disimpan sebagai draf, dan tidak kehilangan data ketika koneksi terputus singkat.
5. **Privasi terlihat.** Jelaskan mengapa data/lampiran diminta dan siapa yang dapat mengaksesnya.
6. **Aksesibilitas bukan mode tambahan.** Struktur heading, fokus, label, kontras, target sentuh, dan pesan error menjadi bagian komponen dasar.

### 14.3 Sistem visual

- Gunakan identitas resmi Kementerian Agama sesuai pedoman yang disetujui instansi; jangan menggambar ulang atau memodifikasi logo.
- Arah warna: hijau institusional sebagai warna aksi utama, hijau gelap/charcoal untuk teks, putih dan abu netral untuk permukaan, emas hanya sebagai aksen terbatas. Nilai final harus diambil dari pedoman merek resmi.
- Font utama: sans-serif yang sangat terbaca dan mendukung Bahasa Indonesia; gunakan font sistem sebagai fallback. Body minimum 16 px, label rutin minimum 14 px, metadata minimum 12 px.
- Sudut komponen sedang, border jelas, bayangan ringan. Hindari glassmorphism, gradient dekoratif berlebihan, dan hero fotografi generik.
- Ikon hanya dari satu library dengan label teks pada tindakan penting.
- Animasi 150–250 ms untuk feedback; hormati `prefers-reduced-motion`.

### 14.4 Siluet halaman

- Header ringkas: identitas, enam menu, pencarian, dan tombol “Ajukan Permohonan”.
- Beranda: pencarian besar namun tidak menjadi hero kosong; di bawahnya kategori informasi dan dua tindakan layanan utama.
- Daftar dokumen: panel filter di desktop, filter sheet di mobile, hasil berupa daftar padat dan mudah dipindai—bukan grid kartu besar.
- Detail dokumen: metadata dan unduh pada bagian atas, konteks/versi/dokumen terkait di bawah.
- Form permohonan: stepper pendek, ringkasan sebelum kirim, upload dengan status nyata, dan tanda terima setelah sukses.
- Dashboard petugas: sidebar, ringkasan SLA, tabel antrean, filter tersimpan, dan detail dalam halaman/sheet sesuai kompleksitas.

### 14.5 Komponen inti

- Search input/combobox dengan saran dan state kosong.
- Category chips atau tabs yang tetap dapat digunakan keyboard.
- Document result row dengan badge klasifikasi, tahun, unit, format, ukuran, dan tanggal pembaruan.
- Status badge dengan ikon/teks; warna bukan satu-satunya penanda.
- Timeline kronologi permohonan.
- Deadline panel dengan tanggal absolut dan jumlah hari kerja tersisa.
- File uploader dengan tipe/ukuran, progress, retry, remove, dan hasil pemindaian.
- Data table responsif yang beralih ke item list bermakna pada layar kecil.
- Alert/dialog khusus tindakan legal berisiko.

### 14.6 State wajib

Setiap halaman data/form harus memiliki loading, kosong, error, offline/timeout, akses ditolak, tidak ditemukan, sukses, dan data kedaluwarsa bila relevan. Skeleton meniru bentuk konten; jangan memakai spinner sebagai satu-satunya feedback untuk proses panjang.

### 14.7 Aksesibilitas

- Target WCAG 2.2 AA.
- Semua fungsi dapat dijalankan dengan keyboard dan memiliki fokus terlihat.
- Kontras teks/kontrol diuji, termasuk status dan placeholder.
- Error terhubung ke field, dirangkum di awal form, dan diumumkan dengan tepat ke assistive technology.
- CAPTCHA, jika digunakan, harus memiliki alternatif aksesibel.
- PDF terbit harus melalui pemeriksaan dasar keterbacaan, tagging/OCR bila relevan, judul dokumen, dan urutan baca.

## 15. Persyaratan nonfungsional

| Area | Target v1 |
| --- | --- |
| Ketersediaan | Target operasional disepakati sebelum produksi; tampilkan kanal alternatif ketika layanan terganggu |
| Performa publik | LCP p75 ≤ 2,5 s, INP p75 ≤ 200 ms, CLS p75 ≤ 0,1 pada data lapangan yang memadai |
| Respons API | p95 baca publik ≤ 800 ms; mutasi utama ≤ 2 s di luar upload/email |
| Keamanan | Tidak ada temuan kritis/tinggi yang terbuka saat go-live |
| Aksesibilitas | WCAG 2.2 AA untuk alur prioritas |
| SEO | SSR metadata, canonical URL, sitemap, robots, Open Graph; halaman privat `noindex` |
| Observability | correlation/request ID, structured log, error alert, audit domain |
| Kompatibilitas | Dua versi terbaru browser utama; Android mobile kelas menengah menjadi baseline uji |
| Data | UTC di database, tampilan WITA (`Asia/Makassar`) untuk pengguna |

## 16. Analitik dan ukuran keberhasilan

Analitik publik harus bebas data pribadi dan menghormati persetujuan/kebijakan instansi.

| Metrik | Definisi |
| --- | --- |
| Search success rate | Sesi pencarian yang berakhir pada pembukaan/unduhan dokumen |
| Self-service rate | Pengunjung yang menemukan dokumen tanpa membuat permohonan |
| Completion rate | Form permohonan yang berhasil dikirim dibanding dimulai |
| Median processing time | Median hari kerja dari diterima sampai keputusan/jawaban |
| On-time response rate | Persentase kasus selesai dalam SLA |
| Objection rate | Keberatan dibanding permohonan selesai |
| Publication freshness | Persentase dokumen berkala yang diperbarui sesuai jadwal |
| Accessibility defects | Temuan AA terbuka pada alur prioritas |

## 17. Kriteria penerimaan rilis v1

- Semua enam menu dan subkonten minimum tersedia dan dapat dikelola tanpa deploy ulang.
- Pencarian hanya mengembalikan konten terbit dan menyelesaikan alur detail–unduh.
- Pemohon dapat mengirim, memperoleh tanda terima, melacak, dan mengunduh jawaban miliknya.
- Petugas dapat memverifikasi, mendisposisikan, memperpanjang, menjawab, dan menutup kasus dengan audit lengkap.
- Keberatan dapat diajukan dari permohonan, diputus oleh role berwenang, dan dilacak pemohon.
- Pengguna A tidak dapat membaca metadata, lampiran, atau jawaban pengguna B.
- Tidak ada bucket privat yang dapat di-list atau diunduh tanpa otorisasi server.
- Tenggat hari kerja lulus pengujian akhir pekan, hari libur, perpanjangan, dan perubahan zona waktu.
- Route publik utama lulus pemeriksaan keyboard, zoom 200%, kontras, dan mobile 360 px.
- Backup/restore, pengiriman email ulang, dan prosedur insiden telah diuji di staging.
- Legal/content owner menyetujui teks layanan, formulir, SLA, klasifikasi, dan dokumen awal.

## 18. Tahapan implementasi

### Fase 0 — Fondasi dan keputusan kebijakan

- audit schema/grants/RLS proyek Supabase existing;
- konfirmasi penyedia autentikasi dan kontrak session;
- setujui data wajib, retensi, kalender kerja, SLA, dan role;
- inventaris konten serta dokumen awal;
- tetapkan token merek dan komponen dasar.

### Fase 1 — Publikasi publik

- halaman publik dan navigasi;
- CMS halaman/dokumen, review, dan versi;
- katalog, pencarian, filter, detail, unduh;
- regulasi, standar layanan, dan informasi publik;
- aksesibilitas/SEO dasar.

### Fase 2 — Permohonan

- autentikasi existing dalam TanStack Start;
- formulir, lampiran privat, tanda terima, pelacakan;
- dashboard petugas, disposisi, jawaban, SLA, email;
- audit log dan register.

### Fase 3 — Keberatan dan pelaporan

- formulir dan keputusan keberatan;
- dashboard Atasan PPID;
- statistik publik dan ekspor internal;
- hardening, load test, restore drill, dan UAT.

## 19. Risiko dan mitigasi

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Auth existing tidak kompatibel dengan RLS berbasis Supabase Auth | Kebocoran/penolakan akses | Server-only data access v1; definisikan adapter session dan tes otorisasi negatif |
| NIK tersimpan plaintext pada `user` | Dampak privasi tinggi | Minimalkan penggunaan, enkripsi/vault, masking, pembatasan akses, rencana migrasi |
| Reuse tabel permohonan layanan umum | Workflow PPID rusak | Gunakan tabel `ppid.information_requests` terpisah |
| Dokumen sumber terpublikasi tanpa redaksi aman | Kebocoran permanen | Review dua tahap, file turunan, karantina, checksum, audit publikasi |
| Perhitungan hari kerja salah | Pelanggaran SLA | Kalender berversi, pengujian tabel kasus, review legal/operasional |
| Free tier dipakai untuk produksi | Limit/hibernasi/dukungan tidak memadai | Staging boleh hemat; produksi memakai paket dan monitoring yang disetujui |
| Satu proyek Supabase memperbesar blast radius | Gangguan lintas layanan | Schema/grants terpisah, backup, batas koneksi, observability, rencana pemisahan jika skala/risiko naik |

## 20. Dependensi dan keputusan terbuka

Keputusan berikut wajib ditutup pada Fase 0 dan tidak boleh diasumsikan oleh implementer:

- nama domain resmi dan kepemilikan DNS;
- pedoman merek/logo resmi yang boleh dipakai;
- pejabat, unit, role, serta delegasi persetujuan;
- daftar field identitas yang benar-benar diwajibkan;
- format nomor registrasi dan surat resmi;
- daftar hari libur/kalender kerja sumber otoritatif;
- provider email, alamat pengirim, dan kebijakan retry;
- tipe/ukuran maksimum upload serta mekanisme malware scanning;
- retensi, arsip, dan pemusnahan data;
- daftar regulasi/keputusan internal Kemenag terbaru;
- target SLA operasional hosting dan dukungan.

## 21. Referensi normatif dan teknis

- [UU No. 14 Tahun 2008 tentang Keterbukaan Informasi Publik](https://peraturan.bpk.go.id/Details/39047/uu-no-14-tahun-2008)
- [PP No. 61 Tahun 2010 tentang Pelaksanaan UU No. 14 Tahun 2008](https://peraturan.bpk.go.id/Home/Details/5084/pp-no-)
- [Daftar Produk Hukum Komisi Informasi — termasuk PerKI No. 1 Tahun 2021](https://komisiinformasi.go.id/read/12/09/2023/Daftar-Produk-Hukum-Komisi-Informasi-Pusat)
- [TanStack Start Server Functions](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions)
- [TanStack Start Authentication Server Primitives](https://tanstack.com/start/latest/docs/framework/react/guide/authentication-server-primitives)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Storage Access Control](https://supabase.com/docs/guides/storage/security/access-control)

> Dokumen ini adalah spesifikasi produk/teknis, bukan pendapat hukum. Ketentuan, formulir, dan SLA final harus ditinjau pejabat PPID serta bagian hukum yang berwenang sebelum produksi.
