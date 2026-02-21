import type { ReactNode } from 'react'
import { Link, usePage } from '@inertiajs/react'

type Props = {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
}

export function AppLayout({ title, description, actions, children }: Props) {
  const { url } = usePage()

  const navItems = [
    { href: '/', label: 'Home', active: url === '/' },
    { href: '/privacy', label: 'Privacy', active: url.startsWith('/privacy') },
    { href: '/todos', label: 'Todos', active: url.startsWith('/todos') },
  ]

  return (
    <main className="mx-auto max-w-4xl p-6">
      <header className="mb-6 border-b pb-4">
        <nav className="flex items-center gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-2 text-sm transition-colors ${
                item.active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground mt-2 text-sm">{description}</p>}
        </div>
        {actions}
      </header>

      {children}
    </main>
  )
}
