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

  const pageTitle = hot ? 'HOT BOOKS' : sort === 'commented' ? 'MOST DISCUSSED' : sort === 'viewed' ? 'MOST VIEWED' : q ? `HASIL: "${q}"` : genre ? `GENRE: ${genre}` : 'KATALOG BUKU'

  return (
    <div className="min-h-screen bg-mesh-gradient py-12">
      <div className="container-main">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {!hot && !sort && (
            <aside className="w-full lg:w-72 flex-shrink-0">
              <div className="glass-panel rounded-[3rem] p-8 sticky top-32">
                <h3 className="font-extrabold text-lg text-black mb-6 uppercase tracking-tighter text-gradient">FILTER PENCARIAN</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest">JUDUL / PENULIS</label>
                    <input
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && applyFilter()}
                      placeholder="CARI..."
                      className="input-field w-full bg-white/60 backdrop-blur-md border-white/50 rounded-full px-5 py-3 text-sm font-semibold text-black placeholder-gray-400 outline-none focus:ring-2 focus:ring-black/5 transition-all shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest">GENRE</label>
                    <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto scrollbar-hide">
                      <button
                        onClick={() => setSelGenre('')}
                        className={`text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full transition-all shadow-sm ${!selGenre ? 'bg-black text-white shadow-black/20' : 'bg-white/60 text-gray-500 hover:bg-white/90 border border-white/50'}`}
                      >SEMUA</button>
                      {GENRES.map(g => (
                        <button
                          key={g}
                          onClick={() => setSelGenre(g === selGenre ? '' : g)}
                          className={`text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full transition-all shadow-sm ${selGenre === g ? 'bg-black text-white shadow-black/20' : 'bg-white/60 text-gray-500 hover:bg-white/90 border border-white/50'}`}
                        >{g}</button>
                      ))}
                    </div>
                  </div>
                  <button onClick={applyFilter} className="btn-primary w-full mt-4">TERAPKAN FILTER</button>
                </div>
              </div>
            </aside>
          )}

          <div className="flex-1">
            <div className="flex items-end justify-between mb-8 border-b border-gray-200/50 pb-4">
              <div className="animate-float">
                <h1 className="text-3xl lg:text-4xl font-extrabold text-black uppercase tracking-tighter text-gradient">{pageTitle}</h1>
                <p className="text-[10px] font-bold text-gray-500 mt-2 uppercase tracking-widest">{total} BUKU DITEMUKAN</p>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-32">
                <div className="w-10 h-10 border-4 border-white border-t-black rounded-full animate-spin shadow-lg" />
              </div>
            ) : books.length === 0 ? (
              <div className="text-center py-32 glass-panel rounded-[3rem]">
                <div className="text-6xl mb-6 opacity-80 animate-float">😶</div>
                <p className="text-black font-extrabold text-2xl mb-2 uppercase tracking-tighter text-gradient">TIDAK ADA HASIL</p>
                <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">COBA KATA KUNCI ATAU FILTER YANG BERBEDA</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
                  {books.map(b => <BookCard key={b._id} book={b} />)}
                </div>

                {pages > 1 && (
                  <div className="flex justify-center gap-3 mt-16">
                    {Array.from({ length: pages }, (_, i) => i + 1).map(n => (
                      <button
                        key={n}
                        onClick={() => goPage(n)}
                        className={`w-10 h-10 rounded-full text-sm font-extrabold transition-all duration-300 ${n === page ? 'bg-black text-white shadow-lg shadow-black/20 scale-110' : 'glass-panel text-gray-500 hover:bg-white'}`}
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
