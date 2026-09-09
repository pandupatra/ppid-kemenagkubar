import { useMemo, useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import {
  categoryLabel,
  type DipItem,
  type DisclosureCategory,
} from '../../modules/documents/public-dip'
import { PublicPage } from './PublicPage'

const categoryLeads: Record<DisclosureCategory, string> = {
  periodic:
    'Informasi mengenai badan publik, kegiatan dan kinerja, laporan keuangan, serta informasi lain yang diumumkan secara berkala.',
  immediate:
    'Informasi yang wajib disampaikan dan diumumkan kepada publik tanpa penundaan.',
  available_anytime:
    'Daftar informasi publik, keputusan dan pertimbangannya, kebijakan beserta dokumen pendukung, rencana kerja, perjanjian, prosedur layanan, serta laporan akses informasi yang tersedia setiap saat.',
  excluded:
    'Akses informasi publik dapat dikecualikan sesuai Bab V UU No. 14 Tahun 2008, termasuk apabila dapat menghambat penegakan hukum, mengganggu perlindungan hak kekayaan intelektual, atau persaingan usaha yang sehat.',
}

export function DipPage({
  category,
  items,
}: {
  category?: DisclosureCategory
  items: DipItem[]
}) {
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<
    DisclosureCategory | 'all'
  >(category ?? 'all')
  const [selectedYear, setSelectedYear] = useState('all')
  const [selectedUnit, setSelectedUnit] = useState('all')
  const availableItems = items
  const years = useMemo(
    () =>
      [
        ...new Set(
          availableItems.map((item) => item.document_year).filter(Boolean),
        ),
      ].sort((first, second) => second! - first!),
    [availableItems],
  )
  const units = useMemo(
    () =>
      [
        ...new Set(
          availableItems.map((item) => item.owner_unit).filter(Boolean),
        ),
      ].sort((first, second) => first!.localeCompare(second!, 'id-ID')),
    [availableItems],
  )
  const visible = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('id-ID')
    return availableItems.filter((item) => {
      const matchesQuery =
        !term ||
        [
          item.official_title,
          item.description,
          item.owner_unit,
          categoryLabel[item.disclosure_category],
          item.document_year?.toString(),
        ]
          .filter(Boolean)
          .join(' ')
          .toLocaleLowerCase('id-ID')
          .includes(term)
      return (
        matchesQuery &&
        (selectedCategory === 'all' ||
          item.disclosure_category === selectedCategory) &&
        (selectedYear === 'all' ||
          item.document_year?.toString() === selectedYear) &&
        (selectedUnit === 'all' || item.owner_unit === selectedUnit)
      )
    })
  }, [availableItems, query, selectedCategory, selectedUnit, selectedYear])
  const grouped = Array.from(
    visible.reduce((groups, item) => {
      const group = groups.get(item.group_code) ?? {
        code: item.group_code,
        displayOrder: item.group_display_order,
        rows: [],
        title: item.group_title,
      }
      group.rows.push(item)
      groups.set(item.group_code, group)
      return groups
    }, new Map<string, { code: string; displayOrder: number; rows: DipItem[]; title: string }>()),
  )
    .map(([, group]) => group)
    .sort((first, second) => first.displayOrder - second.displayOrder)
  const activeCategory =
    selectedCategory === 'all' ? undefined : selectedCategory
  const title = activeCategory
    ? `Informasi ${categoryLabel[activeCategory]}`
    : 'Daftar Informasi Publik (DIP)'
  return (
    <PublicPage
      eyebrow="Informasi publik"
      title={title}
      heroAside={
        <div
          className="dip-summary dip-summary-hero"
          aria-label="Ringkasan daftar informasi"
        >
          <Card>
            <strong>{visible.length}</strong>
            <span>Total entri</span>
          </Card>
        </div>
      }
      lead={
        activeCategory
          ? categoryLeads[activeCategory]
          : 'Daftar informasi publik yang berada dalam penguasaan Kantor Kementerian Agama Kabupaten Kutai Barat.'
      }
    >
      <section className="section page-container">
        <form
          className="catalog-controls"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="catalog-search">
            <label htmlFor="catalog-search">Cari informasi publik</label>
            <div className="catalog-search-input">
              <Search aria-hidden="true" />
              <Input
                className="pl-10"
                id="catalog-search"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Judul, uraian, unit, atau tahun"
                type="search"
                value={query}
              />
            </div>
          </div>
          <fieldset className="catalog-filters">
            <label>
              <span>Kategori</span>
              <select
                onChange={(event) =>
                  setSelectedCategory(
                    event.target.value as DisclosureCategory | 'all',
                  )
                }
                value={selectedCategory}
              >
                <option value="all">Semua kategori</option>
                {Object.entries(categoryLabel).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Tahun</span>
              <select
                onChange={(event) => setSelectedYear(event.target.value)}
                value={selectedYear}
              >
                <option value="all">Semua tahun</option>
                {years.map((year) => (
                  <option key={year!} value={year!}>
                    {year}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Unit pemilik</span>
              <select
                onChange={(event) => setSelectedUnit(event.target.value)}
                value={selectedUnit}
              >
                <option value="all">Semua unit</option>
                {units.map((unit) => (
                  <option key={unit} value={unit!}>
                    {unit}
                  </option>
                ))}
              </select>
            </label>
          </fieldset>
          <div className="catalog-result-summary" aria-live="polite">
            <span>{visible.length} informasi ditemukan</span>
            {query ||
            selectedCategory !== 'all' ||
            selectedYear !== 'all' ||
            selectedUnit !== 'all' ? (
              <Button
                onClick={() => {
                  setQuery('')
                  setSelectedCategory('all')
                  setSelectedYear('all')
                  setSelectedUnit('all')
                }}
                size="sm"
                type="button"
                variant="ghost"
              >
                <X aria-hidden="true" /> Hapus filter
              </Button>
            ) : null}
          </div>
        </form>
        <div className="dip-sections">
          {grouped.map((group) => (
            <section
              className="dip-group"
              id={`bagian-${group.code}`}
              key={group.code}
            >
              <header className="dip-group-heading">
                <h2>
                  {group.code}. {group.title}
                </h2>
              </header>
              <div className="document-list">
                {group.rows.map((item) => (
                  <article className="document-row" key={item.id}>
                    <div className="document-main">
                      <h3>
                        <a
                          href={`/informasi-publik/${categoryPath[item.disclosure_category]}/${item.slug}`}
                        >
                          {item.official_title}
                        </a>
                      </h3>
                    </div>
                    <dl className="document-meta">
                      <div>
                        <dt>Kategori</dt>
                        <dd>{categoryLabel[item.disclosure_category]}</dd>
                      </div>
                    </dl>
                    <a
                      className="document-action"
                      href={`/informasi-publik/${categoryPath[item.disclosure_category]}/${item.slug}`}
                    >
                      Lihat detail
                    </a>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
        {visible.length === 0 && (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Informasi tidak ditemukan</EmptyTitle>
              <EmptyDescription>
                Coba gunakan kata kunci lain atau hapus filter yang dipilih.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </section>
    </PublicPage>
  )
}

const categoryPath: Record<keyof typeof categoryLabel, string> = {
  periodic: 'berkala',
  available_anytime: 'setiap-saat',
  immediate: 'serta-merta',
  excluded: 'dikecualikan',
}
