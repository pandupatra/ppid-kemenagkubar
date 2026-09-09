import { Button } from '@/components/ui/button'
import { createFileRoute } from '@tanstack/react-router'
import { PublicPage } from '../../components/public/PublicPage'

export const Route = createFileRoute('/layanan-informasi/keberatan')({
  component: ObjectionPage,
})

function ObjectionPage() {
  return (
    <PublicPage
      eyebrow="Keberatan"
      title="Keberatan diajukan dari permohonan yang sudah tercatat"
      lead="Formulir akan tersedia setelah kepemilikan permohonan, alasan yang sah, dan otorisasi server diterapkan."
    >
      <section className="section page-container">
        <Button asChild variant="outline">
          <a href="/layanan-informasi/">Kembali ke layanan informasi</a>
        </Button>
      </section>
    </PublicPage>
  )
}
