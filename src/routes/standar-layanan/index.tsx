import { createFileRoute } from '@tanstack/react-router'
import { PublicShell } from '@/components/public/PublicShell'
import { getPublicServiceCharter } from '@/modules/documents/service-charter'

export const Route = createFileRoute('/standar-layanan/')({
  loader: () => getPublicServiceCharter(),
  component: ServiceStandardPage,
})

function ServiceStandardPage() {
  const image = Route.useLoaderData()
  return (
    <PublicShell>
      <main id="isi-utama" className="maklumat-page">
        <section className="section page-container">
          <header className="maklumat-heading">
            <h1>Maklumat Pelayanan</h1>
            <p>
              Komitmen Kantor Kementerian Agama Kabupaten Kutai Barat dalam
              memberikan layanan informasi publik.
            </p>
          </header>
          <figure className="maklumat-poster">
            <img src={image.src} alt={image.alt} />
          </figure>
        </section>
      </main>
    </PublicShell>
  )
}
