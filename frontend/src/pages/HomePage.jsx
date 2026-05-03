import React, { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios.js'
import BookCard from '../components/BookCard.jsx'
import { GENRES } from '../constants/data.js'

export default function HomePage() {
  const [homepage, setHomepage] = useState([])
  const [hot, setHot] = useState([])
  const [commented, setCommented] = useState([])
  const [viewed, setViewed] = useState([])
  const [slide, setSlide] = useState(0)
  const [loading, setLoading] = useState(true)
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
      } catch { }
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
            <section className="relative overflow-hidden h-[38rem] sm:h-[45rem] rounded-b-[4rem] mx-2 shadow-2xl shadow-black/10">
              {homepage.map((book, i) => (
                <div
                  key={book._id}
                  className={`absolute inset-0 transition-all duration-1000 transform ${i === slide ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-110 z-0'}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-black via-black/40 to-transparent z-10" />
                  <div className="absolute inset-0 bg-black/20 z-10" />
                  {book.coverImage && (
                    <img
                      src={book.coverImage.replace('1000/1500', '1920/1080')}
                      alt={book.title}
                      className="absolute inset-0 w-full h-full object-cover animate-[mesh-pulse_30s_infinite]"
                    />
                  )}
                  <div className="relative container-main h-full flex flex-col justify-center items-start gap-6 z-20">
                    <div className="flex gap-3 animate-float">
                      {book.genre?.slice(0, 3).map(g => (
                        <span key={g} className="bg-white/20 backdrop-blur-xl border border-white/30 text-white text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-[0.2em] shadow-lg">{g}</span>
                      ))}
                    </div>
                    <div className="max-w-4xl space-y-4">
                      <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-white leading-[0.95] uppercase tracking-tighter drop-shadow-2xl italic">
                        {book.title}
                      </h1>
                      <div className="h-1.5 w-32 bg-white rounded-full shadow-lg" />
                      <p className="text-white/80 text-xl sm:text-3xl font-medium uppercase tracking-[0.3em] drop-shadow-lg">{book.author}</p>
                    </div>
                    <div className="mt-10 flex gap-4">
                      <button onClick={() => navigate(`/book/${book._id}`)} className="bg-white text-black font-black uppercase tracking-widest px-10 py-5 rounded-full hover:bg-black hover:text-white hover:scale-105 transition-all duration-500 shadow-2xl shadow-white/20">
                        READ NOW
                      </button>
                      <button onClick={() => navigate('/search')} className="bg-white/10 backdrop-blur-md border border-white/30 text-white font-black uppercase tracking-widest px-10 py-5 rounded-full hover:bg-white hover:text-black transition-all duration-500">
                        BROWSE ALL
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4 z-30 bg-black/20 backdrop-blur-xl px-6 py-4 rounded-full border border-white/10">
                {homepage.map((_, i) => (
                  <button key={i} onClick={() => setSlide(i)} className={`h-2 transition-all duration-500 rounded-full ${i === slide ? 'bg-white w-12' : 'bg-white/30 w-2 hover:bg-white/50'}`} />
                ))}
              </div>
            </section>
          )}

          <div className="container-main py-20 space-y-24">
            <section className="glass-panel p-10 sm:p-16 rounded-[4rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-black/5 rounded-full -mr-32 -mt-32 blur-3xl transition-all duration-700 group-hover:bg-black/10" />
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                  <div>
                    <h2 className="text-4xl sm:text-5xl font-extrabold text-black uppercase tracking-tighter text-gradient leading-none">DISCOVER GENRES</h2>
                    <p className="text-[10px] font-bold text-gray-400 mt-4 uppercase tracking-[0.2em]">Explore our vast collection by category</p>
                  </div>
                  <button onClick={() => navigate('/search')} className="text-[10px] font-extrabold uppercase tracking-widest bg-black text-white px-8 py-3 rounded-full hover:bg-neutral-800 transition-all shadow-xl shadow-black/20">VIEW ALL CATALOG</button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {GENRES.slice(0, 10).map(g => (
                    <button
                      key={g}
                      onClick={() => navigate(`/search?genre=${g}`)}
                      className="group/pill relative overflow-hidden bg-white border-2 border-gray-100 px-6 py-10 rounded-[2.5rem] text-center transition-all duration-500 hover:border-black hover:shadow-2xl hover:shadow-black/10 hover:-translate-y-3"
                    >
                      <span className="relative z-10 text-[13px] font-black text-black uppercase tracking-[0.2em]">{g}</span>
                      <div className="absolute top-0 left-0 w-full h-2 bg-black scale-x-0 group-hover/pill:scale-x-100 transition-transform duration-500 origin-left" />
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <div id="new-arrivals">
              {homepage.length > 0 && (
                <Section title="NEW ARRIVALS" link="/search" books={homepage} />
              )}
            </div>
            <div id="hot-books">
              {hot.length > 0 && (
                <Section title="HOT BOOKS" link="/search?hot=1" books={hot} />
              )}
            </div>
            <div id="most-discussed">
              {commented.length > 0 && (
                <Section title="MOST DISCUSSED" link="/search?sort=commented" books={commented} />
              )}
            </div>
            <div id="most-viewed">
              {viewed.length > 0 && (
                <Section title="MOST VIEWED" link="/search?sort=viewed" books={viewed} />
              )}
            </div>
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
