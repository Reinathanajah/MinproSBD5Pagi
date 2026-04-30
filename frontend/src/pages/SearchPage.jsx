import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api/axios.js'
import BookCard from '../components/BookCard.jsx'
import { GENRES } from '../constants/data.js'

export default function SearchPage() {
  const [params, setParams] = useSearchParams()
  const [books, setBooks]   = useState([])
  const [total, setTotal]   = useState(0)
  const [pages, setPages]   = useState(1)
  const [loading, setLoading] = useState(false)

  const q     = params.get('q')     || ''
  const genre = params.get('genre') || ''
  const hot   = params.get('hot')   || ''
  const sort  = params.get('sort')  || ''
  const page  = Number(params.get('page') || 1)

  const [query, setQuery]       = useState(q)
  const [selGenre, setSelGenre] = useState(genre)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        if (hot) {
          const { data } = await api.get('/search/hot')
          setBooks(data); setTotal(data.length); setPages(1)
        } else if (sort === 'commented') {
          const { data } = await api.get('/search/most-commented')
          setBooks(data); setTotal(data.length); setPages(1)
        } else if (sort === 'viewed') {
          const { data } = await api.get('/search/most-viewed')
          setBooks(data); setTotal(data.length); setPages(1)
        } else {
          const p = new URLSearchParams()
          if (q)     p.set('q', q)
          if (genre) p.set('genre', genre)
          p.set('page', page)
          p.set('limit', 24)
          const { data } = await api.get(`/search/search?${p}`)
          setBooks(data.books); setTotal(data.total); setPages(data.pages)
        }
      } catch {}
      setLoading(false)
    }
    fetch()
  }, [q, genre, hot, sort, page])

  const applyFilter = () => {
    const p = new URLSearchParams()
    if (query)    p.set('q', query)
    if (selGenre) p.set('genre', selGenre)
    p.set('page', 1)
    setParams(p)
  }

  const goPage = (n) => {
    const p = new URLSearchParams(params)
    p.set('page', n)
    setParams(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const pageTitle = hot ? 'Hot Books' : sort === 'commented' ? 'Most Commented' : sort === 'viewed' ? 'Most Viewed' : q ? `Hasil untuk "${q}"` : genre ? `Genre: ${genre}` : 'Katalog Buku'

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-8">
      <div className="container-main">
        <div className="flex flex-col lg:flex-row gap-8">
          {!hot && !sort && (
            <aside className="w-full lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 sticky top-28">
                <h3 className="font-extrabold text-sm text-[#374151] mb-4">Filter Pencarian</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#6B7280] mb-1.5">Judul / Penulis</label>
                    <input
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && applyFilter()}
                      placeholder="Cari..."
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#6B7280] mb-1.5">Genre</label>
                    <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto scrollbar-hide">
                      <button
                        onClick={() => setSelGenre('')}
                        className={`text-xs px-2 py-1 rounded-full border transition-colors ${!selGenre ? 'bg-[#0060AE] text-white border-[#0060AE]' : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#0060AE] hover:text-[#0060AE]'}`}
                      >Semua</button>
                      {GENRES.map(g => (
                        <button
                          key={g}
                          onClick={() => setSelGenre(g === selGenre ? '' : g)}
                          className={`text-xs px-2 py-1 rounded-full border transition-colors ${selGenre === g ? 'bg-[#0060AE] text-white border-[#0060AE]' : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#0060AE] hover:text-[#0060AE]'}`}
                        >{g}</button>
                      ))}
                    </div>
                  </div>
                  <button onClick={applyFilter} className="btn-primary w-full">Terapkan Filter</button>
                </div>
              </div>
            </aside>
          )}

          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-extrabold text-[#374151]">{pageTitle}</h1>
                <p className="text-xs text-[#6B7280] mt-0.5">{total} buku ditemukan</p>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-24">
                <div className="w-10 h-10 border-4 border-[#0060AE] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : books.length === 0 ? (
              <div className="text-center py-24">
                <div className="text-5xl mb-3"></div>
                <p className="text-[#374151] font-bold text-lg mb-1">Tidak ada hasil</p>
                <p className="text-[#6B7280] text-sm">Coba kata kunci atau filter yang berbeda</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                  {books.map(b => <BookCard key={b._id} book={b} />)}
                </div>

                {pages > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    {Array.from({ length: pages }, (_, i) => i + 1).map(n => (
                      <button
                        key={n}
                        onClick={() => goPage(n)}
                        className={`w-9 h-9 rounded-full text-sm font-semibold transition-colors ${n === page ? 'bg-[#0060AE] text-white' : 'bg-white border border-[#E5E7EB] text-[#374151] hover:border-[#0060AE] hover:text-[#0060AE]'}`}
                      >{n}</button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
