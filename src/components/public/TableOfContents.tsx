export type TableOfContentsItem = Readonly<{
  href: string
  label: string
}>

export function TableOfContents({
  items,
  title = 'Daftar isi',
}: Readonly<{
  items: ReadonlyArray<TableOfContentsItem>
  title?: string
}>) {
  return (
    <nav className="table-of-contents" aria-label={title}>
      <p className="section-kicker">{title}</p>
      <ol>
        {items.map(({ href, label }) => (
          <li key={href}>
            <a href={href}>{label}</a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
