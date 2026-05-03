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

  return (
    <div className="min-h-screen bg-mesh-gradient">
      {loading ? (
        <div className="flex justify-center items-center h-96">
          <div className="w-10 h-10 border-4 border-neutral-200 border-t-black rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {homepage.length > 0 && (
            <section className="relative overflow-hidden bg-black h-[36rem] sm:h-[42rem] rounded-b-[3rem] mx-2 shadow-2xl shadow-black/20">
              {homepage.map((book, i) => (
                <div
                  key={book._id}
                  className={`absolute inset-0 transition-opacity duration-1000 ${i === slide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                  <div className="absolute inset-0 bg-black opacity-60 z-10" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
                  {book.coverImage && (
                    <img src={book.coverImage} alt={book.title} className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity grayscale scale-105 animate-[mesh-pulse_20s_infinite]" />
                  )}
                  <div className="relative container-main h-full flex flex-col justify-center items-start gap-4 z-20">
                    <div className="flex gap-2 flex-wrap mb-2 animate-float">
                      {book.genre?.slice(0, 2).map(g => (
                        <span key={g} className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-extrabold px-4 py-1.5 rounded-full uppercase tracking-widest">{g}</span>
                      ))}
                    </div>
                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500 leading-[1.05] max-w-4xl line-clamp-2 uppercase tracking-tighter drop-shadow-2xl">{book.title}</h1>
                    <p className="text-white/70 text-lg sm:text-2xl font-light uppercase tracking-widest drop-shadow-lg">{book.author}</p>
                    <div className="mt-8">
                      <button onClick={() => navigate(`/book/${book._id}`)} className="bg-white text-black font-extrabold uppercase tracking-widest px-8 py-4 rounded-full hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-xl shadow-white/10">
                        EXPLORE NOW
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-30 glass-panel px-5 py-3 rounded-full">
                {homepage.map((_, i) => (
                  <button key={i} onClick={() => setSlide(i)} className={`w-2.5 h-2.5 transition-all duration-500 rounded-full ${i === slide ? 'bg-black w-8' : 'bg-black/30 hover:bg-black/50'}`} />
                ))}
              </div>
            </section>
          )}

          <div className="container-main py-20 space-y-24">
            <section className="glass-panel p-8 sm:p-12 rounded-[3rem]">
              <div className="flex items-center justify-between mb-8">
                <h2 className="section-title text-gradient">BROWSE GENRES</h2>
              </div>
              <div className="flex gap-3 flex-wrap">
                {GENRES.map(g => (
                  <button key={g} onClick={() => navigate(`/search?genre=${g}`)} className="genre-pill">{g}</button>
                ))}
              </div>
            </section>

            {homepage.length > 0 && (
              <Section title="NEW ARRIVALS" link="/search" books={homepage} />
            )}
            {hot.length > 0 && (
              <Section title="HOT BOOKS" link="/search?hot=1" books={hot} />
            )}
            {commented.length > 0 && (
              <Section title="MOST DISCUSSED" link="/search?sort=commented" books={commented} />
            )}
            {viewed.length > 0 && (
              <Section title="MOST VIEWED" link="/search?sort=viewed" books={viewed} />
            )}

            {homepage.length === 0 && hot.length === 0 && (
              <div className="text-center py-32 glass-panel rounded-[3rem] mx-4">
                <div className="text-6xl mb-6 opacity-80 animate-float">😶</div>
                <h2 className="text-4xl font-extrabold text-black mb-4 uppercase tracking-tighter text-gradient">THE VOID IS EMPTY</h2>
                <p className="text-gray-500 font-medium mb-10 text-xs uppercase tracking-widest">Admin has not added any books yet.</p>
                <Link to="/login" className="btn-primary">ACCESS AS ADMIN</Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function Section({ title, link, books }) {
  return (
    <section>
      <div className="flex items-end justify-between mb-8">
        <h2 className="section-title m-0 text-gradient">{title}</h2>
        <Link to={link} className="text-[10px] text-black font-extrabold uppercase tracking-widest hover:underline transition-all py-2 px-4 glass-panel rounded-full">VIEW ALL &rarr;</Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-10">
        {books.map(b => <BookCard key={b._id} book={b} />)}
      </div>
    </section>
  )
}
