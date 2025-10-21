import React, { useEffect, useRef, useState } from 'react'

type Filters = {
  q?: string
  category?: 'iptv' | 'streaming' | 'all'
  minCredit?: number | null
  maxCredit?: number | null
  duration?: string
  sortBy?: 'newest' | 'price' | 'name' | 'rating'
  sortDir?: 'asc' | 'desc'
}

function useOutsideClick(handler: () => void) {
  const ref = useRef<HTMLElement | null>(null)
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) handler()
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [handler])
  return ref
}

function Dropdown<T extends string | number | undefined>({
  label,
  value,
  options,
  onChange,
  placeholder,
}: {
  label?: string
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useOutsideClick(() => setOpen(false))

  return (
    <div className="relative" ref={ref as any}>
      {label && <div className="text-sm text-white/60">{label}</div>}
      <button
        type="button"
        onClick={() => setOpen(s => !s)}
        className="w-full mt-2 px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white text-left flex items-center justify-between"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate">{options.find(o => o.value === value)?.label ?? placeholder ?? 'Select'}</span>
        <svg className={`ml-2 w-4 h-4 text-white/60 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          tabIndex={-1}
          className="absolute z-50 mt-2 w-full max-h-56 overflow-auto backdrop-blur-3xl rounded-md bg-white/5 border border-white/10 py-1 shadow-lg"
        >
          {options.map((opt) => (
            <li
              key={String(opt.value)}
              role="option"
              aria-selected={opt.value === value}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={`px-3 py-2 cursor-pointer hover:bg-white/10 ${opt.value === value ? 'bg-white/10' : ''}`}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function AdvancedFilter({
  initial = {},
  onApply,
  onReset,
}: {
  initial?: Filters
  onApply: (f: Filters) => void
  onReset?: () => void
}) {
  const [q, setQ] = useState(initial.q || '')
  const [category, setCategory] = useState<Filters['category']>(initial.category || 'all')
  const [minCredit, setMinCredit] = useState<string>(initial.minCredit?.toString() || '')
  const [maxCredit, setMaxCredit] = useState<string>(initial.maxCredit?.toString() || '')
  const [duration, setDuration] = useState(initial.duration || '')
  const [sortBy, setSortBy] = useState<Filters['sortBy']>(initial.sortBy || 'newest')
  const [sortDir, setSortDir] = useState<Filters['sortDir']>(initial.sortDir || 'desc')

  function apply() {
    const out: Filters = {
      q: q.trim() || undefined,
      category,
      minCredit: minCredit ? Number(minCredit) : null,
      maxCredit: maxCredit ? Number(maxCredit) : null,
      duration: duration || undefined,
      sortBy,
      sortDir,
    }
    onApply(out)
  }

  function reset() {
    setQ('')
    setCategory('all')
    setMinCredit('')
    setMaxCredit('')
    setDuration('')
    setSortBy('newest')
    setSortDir('desc')
    onReset && onReset()
  }

  return (
    <div className=" bg-white/10 rounded-xl p-6 mb-8 border border-white/20">
      <div className="flex flex-col md:flex-row gap-4 md:items-end md:justify-between">
        <div className="flex-1">
          <label className="text-sm text-white/60">Search</label>
          <input
            aria-label="Search"
            value={q}
            onChange={e => setQ(e.target.value)}
            className="w-full mt-2 px-3 py-2 rounded-md outline-white/5 outline-offset-[1px]   bg-white/5 border border-white/10 text-white"
            placeholder="Search by channel name, keyword..."
          />
        </div>

        <div className="w-44">
          <Dropdown
            label="Category"
            value={category}
            onChange={(v) => setCategory(v || 'all')}
            placeholder="All"
            options={[
              { value: 'all', label: 'All' },
              { value: 'streaming', label: 'Streaming' },
              { value: 'iptv', label: 'IPTV' },
            ]}
          />
        </div>

        <div className="w-40">
          <label className="text-sm text-white/60">Min Credits</label>
          <input
            value={minCredit}
            onChange={e => setMinCredit(e.target.value.replace(/[^0-9]/g, ''))}
            className="w-full mt-2 px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white"
            placeholder="0"
          />
        </div>

        <div className="w-40">
          <label className="text-sm text-white/60">Max Credits</label>
          <input
            value={maxCredit}
            onChange={e => setMaxCredit(e.target.value.replace(/[^0-9]/g, ''))}
            className="w-full mt-2 px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white"
            placeholder="Any"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="flex gap-3 items-center">
          <div className="w-40">
            <Dropdown
              label="Duration"
              value={duration}
              onChange={(v) => setDuration(v || '')}
              placeholder="Any"
              options={[
                { value: '', label: 'Any' },
                { value: 'ONE_MONTH', label: '1 Month' },
                { value: 'SIX_MONTHS', label: '6 Months' },
                { value: 'ONE_YEAR', label: '1 Year' },
              ]}
            />
          </div>

          <div>
            <div className="text-sm text-white/60">Sort</div>
            <div className="flex gap-2 ">
              <div className="w-44">
                <Dropdown
                  value={sortBy}
                  onChange={(v) => setSortBy((v as any) || 'newest')}
                  options={[
                    { value: 'newest', label: 'Newest' },
                    { value: 'price', label: 'Price' },
                    { value: 'name', label: 'Name' },
                    { value: 'rating', label: 'Rating' },
                  ]}
                />
              </div>

              <div className="w-28">
                <Dropdown
                  value={sortDir}
                  onChange={(v) => setSortDir((v as any) || 'desc')}
                  options={[
                    { value: 'desc', label: 'Desc' },
                    { value: 'asc', label: 'Asc' },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={reset} className="px-4 py-2 rounded-md bg-white/5 border border-white/10 text-white/80">Reset</button>
          <button onClick={apply} className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold">Apply Filters</button>
        </div>
      </div>
    </div>
  )
}
