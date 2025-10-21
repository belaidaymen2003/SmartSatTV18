import React, { useState } from 'react'

type Filters = {
  q?: string
  category?: 'iptv' | 'streaming' | 'all'
  minCredit?: number | null
  maxCredit?: number | null
  duration?: string
  sortBy?: 'newest' | 'price' | 'name' | 'rating'
  sortDir?: 'asc' | 'desc'
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
    <div className="glass rounded-xl p-6 mb-8 border border-white/10">
      <div className="flex flex-col md:flex-row gap-4 md:items-end md:justify-between">
        <div className="flex-1">
          <label className="text-sm text-white/60">Search</label>
          <input
            aria-label="Search"
            value={q}
            onChange={e => setQ(e.target.value)}
            className="w-full mt-2 px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white"
            placeholder="Search by channel name, keyword..."
          />
        </div>

        <div className="w-44">
          <label className="text-sm text-white/60">Category</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value as Filters['category'])}
            className="w-full mt-2 px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white"
          >
            <option value="all">All</option>
            <option value="streaming">Streaming</option>
            <option value="iptv">IPTV</option>
          </select>
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
          <div>
            <label className="text-sm text-white/60">Duration</label>
            <select
              value={duration}
              onChange={e => setDuration(e.target.value)}
              className="mt-2 px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white"
            >
              <option value="">Any</option>
              <option value="ONE_MONTH">1 Month</option>
              <option value="SIX_MONTHS">6 Months</option>
              <option value="ONE_YEAR">1 Year</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-white/60">Sort</label>
            <div className="flex gap-2 mt-2">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as Filters['sortBy'])}
                className="px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white"
              >
                <option value="newest">Newest</option>
                <option value="price">Price</option>
                <option value="name">Name</option>
                <option value="rating">Rating</option>
              </select>

              <select
                value={sortDir}
                onChange={e => setSortDir(e.target.value as Filters['sortDir'])}
                className="px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white"
              >
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
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
