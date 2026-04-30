import React, { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios.js'
import BookCard from '../components/BookCard.jsx'
import { GENRES } from '../constants/data.js'

export default function HomePage() {
  const [homepage, setHomepage]           = useState([])
  const [hot, setHot]                     = useState([])
  const [commented, setCommented]         = useState([])
  const [viewed, setViewed]               = useState([])
  const [slide, setSlide]                 = useState(0)
  const [loading, setLoading]             = useState(true)
  const navigate = useNavigate()
  const sliderRef = useRef(null)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const [h, ho, co, vi] = await Promise.all([
          api.get('/search/homepage'),
          api.get('/search/hot'),
          api.get('/search/most-commented'),
          api.get('/search/most-viewed')
        ])
        setHomepage(h.data)
        setHot(ho.data)
        setCommented(co.data)
        setViewed(vi.data)
      } catch {}
      setLoading(false)
    }
    fetch()
  }, [])

  useEffect(() => {
    if (homepage.length === 0) return
    const t = setInterval(() => setSlide(s => (s + 1) % homepage.length), 4000)
    return () => clearInterval(t)
  }, [homepage])

  const heroColors = ['from-[#0060AE]','from-[#1a3a5c]','from-[#0d5c44]','from-[#6b2d8b]','from-[#c24b1a]']

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {loading ? (
        <div className="flex justify-center items-center h-96">
          <div className="w-10 h-10 border-4 border-[#0060AE] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {homepage.length > 0 && (
            <section className="relative overflow-hidden bg-gradient-to-r from-[#0060AE] to-[#003d70] h-72 sm:h-96">
              {homepage.map((book, i) => (
                <div
                  key={book._id}
                  className={`absolute inset-0 transition-opacity duration-700 ${i === slide ? 'opacity-100' : 'opacity-0'}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${heroColors[i % heroColors.length]} to-transparent opacity-90`} />
                  {book.coverImage && (
                    <img src={book.coverImage} alt={book.title} className="absolute right-0 h-full w-1/3 object-cover opacity-30" />
                  )}
                  <div className="relative container-main h-full flex flex-col justify-center gap-3">
                    <div className="flex gap-2 flex-wrap">
                      {book.genre?.slice(0, 2).map(g => (
                        <span key={g} className="bg-white/20 text-white text-xs font-semibold px-2 py-0.5 rounded-full">{g}</span>
                      ))}
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight max-w-lg line-clamp-2">{book.title}</h1>
                    <p className="text-white/80 text-sm">{book.author}</p>
                    <button onClick={() => navigate(`/book/${book._id}`)} className="mt-2 btn-primary w-fit">
                      Lihat Buku
                    </button>
                  </div>
                </div>
              ))}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {homepage.map((_, i) => (
                  <button key={i} onClick={() => setSlide(i)} className={`w-2 h-2 rounded-full transition-all ${i === slide ? 'bg-white w-6' : 'bg-white/50'}`} />
                ))}
              </div>
            </section>
          )}

          <div className="container-main py-8 space-y-12">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="section-title">Browse Genre</h2>
              </div>
              <div className="flex gap-2 flex-wrap">
                {GENRES.map(g => (
                  <button key={g} onClick={() => navigate(`/search?genre=${g}`)} className="genre-pill">{g}</button>
                ))}
              </div>
            </section>

            {homepage.length > 0 && (
              <Section title="Baru Ditambahkan" link="/search" books={homepage} />
            )}
            {hot.length > 0 && (
              <Section title="Hot Books" link="/search?hot=1" books={hot} />
            )}
            {commented.length > 0 && (
              <Section title="Most Commented" link="/search?sort=commented" books={commented} />
            )}
            {viewed.length > 0 && (
              <Section title="Most Viewed" link="/search?sort=viewed" books={viewed} />
            )}

            {homepage.length === 0 && hot.length === 0 && (
              <div className="text-center py-24">
                <div className="text-6xl mb-4"></div>
                <h2 className="text-2xl font-extrabold text-[#374151] mb-2">Belum ada buku</h2>
                <p className="text-[#6B7280] mb-6">Admin belum menambahkan buku apapun. Tunggu sebentar!</p>
                <Link to="/login" className="btn-primary">Masuk sebagai Admin</Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function Section({ title, link, books }) {
  const navigate = useNavigate()
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title">{title}</h2>
        <Link to={link} className="text-xs text-[#0060AE] font-semibold hover:underline">Lihat Semua</Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {books.map(b => <BookCard key={b._id} book={b} />)}
      </div>
    </section>
  )
}
