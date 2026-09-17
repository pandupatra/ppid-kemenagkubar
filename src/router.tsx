import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { PublicError, PublicNotFound } from './components/public/PublicPage'

export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true,
    defaultViewTransition: true,
    defaultErrorComponent: PublicError,
    defaultNotFoundComponent: PublicNotFound,
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
