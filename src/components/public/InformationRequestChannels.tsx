import { Button } from '@/components/ui/button'
import {
  AtSign,
  BadgeCheck,
  CalendarDays,
  Clock3,
  Coffee,
  Mail,
  MapPin,
  MessageCircle,
} from 'lucide-react'

const serviceSchedule = [
  {
    label: 'Hari pelayanan',
    value: 'Senin–Jumat',
    detail: 'Sabtu–Minggu dan hari libur nasional tutup.',
    icon: CalendarDays,
  },
  {
    label: 'Waktu pelayanan',
    value: '08.00–16.00 WITA',
    detail: 'Waktu setempat Kabupaten Kutai Barat.',
    icon: Clock3,
  },
  {
    label: 'Jam istirahat',
    value: '12.00–13.00 WITA',
    detail: 'Pelayanan dilanjutkan setelah jam istirahat.',
    icon: Coffee,
  },
  {
    label: 'Komitmen layanan',
    value: 'Cepat, tepat, transparan',
    detail: 'Setiap permohonan dicatat dan dapat dilacak.',
    icon: BadgeCheck,
  },
] as const

const requestChannels = [
  {
    title: 'Email',
    detail: 'kemenagkutaibarat03@gmail.com',
    href: 'mailto:kemenagkutaibarat03@gmail.com',
    icon: Mail,
  },
  {
    title: 'WhatsApp',
    detail: '0813 5054 3313',
    href: 'https://wa.me/6281350543313',
    icon: MessageCircle,
  },
  {
    title: 'Media sosial',
    detail: '@kemenagkutaibarat',
    href: 'https://www.instagram.com/kemenagkutaibarat/',
    icon: AtSign,
  },
  {
    title: 'Datang langsung',
    detail:
      'Kantor Kementerian Agama Kabupaten Kutai Barat, Jl. Moh. Hatta, RT. XIX, Melak Ulu',
    href: 'https://maps.google.com/?q=Kantor+Kementerian+Agama+Kabupaten+Kutai+Barat',
    icon: MapPin,
  },
] as const

export function InformationRequestChannels() {
  return (
    <section
      className="section section-muted information-request-channels"
      aria-labelledby="request-channels-title"
    >
      <div className="page-container request-channels-layout">
        <div className="request-channels-intro">
          <p className="section-kicker">Layanan PPID</p>
          <h2 id="request-channels-title">
            Saluran permintaan informasi publik
          </h2>
          <p className="lead">
            Sampaikan kebutuhan informasi Anda melalui kanal yang paling sesuai,
            atau gunakan formulir online agar permohonan memperoleh nomor tanda
            terima untuk pelacakan.
          </p>
          <div className="request-schedule" aria-label="Jadwal pelayanan">
            <h3>Jadwal pelayanan</h3>
            <dl>
              {serviceSchedule.map((item) => {
                const Icon = item.icon

                return (
                  <div key={item.label}>
                    <Icon aria-hidden="true" />
                    <dt>{item.label}</dt>
                    <dd>
                      <strong>{item.value}</strong>
                      <span>{item.detail}</span>
                    </dd>
                  </div>
                )
              })}
            </dl>
          </div>
        </div>

        <div className="request-channels-actions">
          <Button asChild>
            <a href="/layanan-informasi/permohonan">
              Ajukan permohonan informasi
            </a>
          </Button>
          <p className="request-channels-or">atau</p>
          <div className="request-channel-panel">
            <h3>Sampaikan permintaan informasi Anda melalui:</h3>
            <ol>
              {requestChannels.map((channel, index) => {
                const Icon = channel.icon

                return (
                  <li key={channel.title}>
                    <span className="request-channel-number" aria-hidden="true">
                      {index + 1}
                    </span>
                    <Icon className="request-channel-icon" aria-hidden="true" />
                    <div>
                      <h4>{channel.title}</h4>
                      <a
                        href={channel.href}
                        target={
                          channel.href.startsWith('http') ? '_blank' : undefined
                        }
                        rel={
                          channel.href.startsWith('http')
                            ? 'noreferrer'
                            : undefined
                        }
                      >
                        {channel.detail}
                      </a>
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
