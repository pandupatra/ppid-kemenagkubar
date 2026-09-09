import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createFileRoute } from '@tanstack/react-router'
import { InformationRequestChannels } from '../../components/public/InformationRequestChannels'
import { PublicPage } from '../../components/public/PublicPage'

export const Route = createFileRoute('/layanan-informasi/')({
  component: InformationServicePage,
})

function InformationServicePage() {
  return (
    <PublicPage
      eyebrow="Layanan informasi"
      title="Layanan Informasi"
      lead="Gunakan katalog untuk mencari dokumen terlebih dahulu. Ajukan permohonan bila informasi belum tersedia."
    >
      <InformationRequestChannels />
    </PublicPage>
  )
}
