import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import {
  PublicError,
  PublicNotFound,
  PublicPending,
} from './components/public/PublicPage'

export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true,
    defaultErrorComponent: PublicError,
    defaultPendingComponent: PublicPending,
    defaultNotFoundComponent: PublicNotFound,
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
