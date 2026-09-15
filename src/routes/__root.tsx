import type { ReactNode } from 'react'
import { useEffect } from 'react'
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  useRouter,
} from '@tanstack/react-router'
import logoKemenag from '../../logo-kemenag.png'
import { ToastProvider } from '@/components/ui/toast'
import '../styles/global.css'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        name: 'description',
        content:
          'Portal layanan informasi publik PPID Kementerian Agama Kabupaten Kutai Barat.',
      },
    ],
    links: [
      { rel: 'canonical', href: '/' },
      { rel: 'icon', type: 'image/png', href: logoKemenag },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  const router = useRouter()

  useEffect(() => {
    const handleInternalNavigation = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return
      }

      const anchor =
        event.target instanceof Element ? event.target.closest('a') : null
      if (
        !(anchor instanceof HTMLAnchorElement) ||
        anchor.target ||
        anchor.download ||
        anchor.origin !== window.location.origin
      ) {
        return
      }

      const destination = `${anchor.pathname}${anchor.search}${anchor.hash}`
      const current = `${window.location.pathname}${window.location.search}${window.location.hash}`
      const isSamePageHash =
        anchor.hash &&
        anchor.pathname === window.location.pathname &&
        anchor.search === window.location.search
      if (destination === current || isSamePageHash) return

      event.preventDefault()
      void router.navigate({ href: destination })
    }

    document.addEventListener('click', handleInternalNavigation)
    return () => document.removeEventListener('click', handleInternalNavigation)
  }, [router])

  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id">
      <head>
        <HeadContent />
      </head>
      <body>
        <ToastProvider>{children}</ToastProvider>
        <Scripts />
      </body>
    </html>
  )
}
