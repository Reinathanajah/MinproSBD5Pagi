import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const SearchIcon = () => (
  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const [query, setQuery]         = useState('')
  const [menuOpen, setMenuOpen]   = useState(false)
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  const trending = [
    { label: 'NOVEL TERLARIS', url: '/search?sort=viewed' },
    { label: 'BUKU ANAK',      url: '/search?genre=Anak-anak' },
    { label: 'SELF-HELP',      url: '/search?genre=Self-Help' },
    { label: 'SAINS & TEKNO',  url: '/search?genre=Sains & Teknologi' },
    { label: 'BIOGRAFI',       url: '/search?genre=Biografi' }
  ]

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-white/50 sticky top-0 z-50 shadow-sm shadow-black/5">
      <div className="bg-black/5 backdrop-blur-md">
        <div className="container-main flex justify-end gap-6 py-2">
          <Link to="/search?genre=Promo" className="text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:text-black transition-colors">PROMO</Link>
          <Link to="/about" className="text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:text-black transition-colors">TENTANG KAMI</Link>
          <Link to="/contact" className="text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:text-black transition-colors">HUBUNGI KAMI</Link>
        </div>
      </div>

      <div className="container-main">
        <div className="flex items-center justify-between gap-4 py-4">
          <Link to="/" className="flex-shrink-0 animate-float" style={{animationDuration: '8s'}}>
            <span style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
              <span className="font-extrabold text-2xl lg:text-3xl leading-none text-transparent bg-clip-text bg-gradient-to-r from-black to-gray-500 tracking-tighter uppercase drop-shadow-sm">FOLIO</span>
              <span className="font-extrabold text-2xl lg:text-3xl leading-none text-black">.</span>
            </span>
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-auto hidden md:block">
            <div className="flex items-center bg-white/60 backdrop-blur-md border border-white/50 shadow-sm rounded-full px-5 py-2.5 gap-3 focus-within:ring-4 focus-within:ring-black/5 focus-within:bg-white transition-all">
              <SearchIcon />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Cari judul atau penulis..."
                className="flex-1 text-sm font-semibold outline-none text-black placeholder-gray-400 bg-transparent"
              />
              {query && (
                <button type="button" onClick={() => setQuery('')} className="text-gray-400 hover:text-black font-extrabold hover:scale-110 transition-transform">X</button>
              )}
            </div>
            <div className="flex gap-3 mt-2 pl-4 flex-wrap">
              {trending.slice(0, 4).map(t => (
                <button
                  key={t.label} type="button"
                  onClick={() => navigate(t.url)}
                  className="text-[9px] lg:text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-black transition-colors"
                >{t.label}</button>
              ))}
            </div>
          </form>

          <div className="flex items-center gap-2 flex-shrink-0">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 btn-secondary py-2 px-5 shadow-sm"
                >
                  <UserIcon />
                  <span className="text-sm font-bold hidden sm:block uppercase">{user.fullName.split(' ')[0]}</span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-full mt-3 w-56 glass-panel rounded-2xl overflow-hidden z-50 flex flex-col p-2 animate-[folio-sub-in_0.3s_ease]">
                    <Link to="/profile"  onClick={() => setMenuOpen(false)} className="px-5 py-3 text-sm font-bold text-gray-600 rounded-xl uppercase tracking-widest hover:bg-white/80 hover:text-black transition-colors">PROFIL SAYA</Link>
                    <Link to="/library"  onClick={() => setMenuOpen(false)} className="px-5 py-3 text-sm font-bold text-gray-600 rounded-xl uppercase tracking-widest hover:bg-white/80 hover:text-black transition-colors">PERPUSTAKAAN</Link>
                    {isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)} className="px-5 py-3 text-sm font-bold text-black rounded-xl uppercase tracking-widest hover:bg-white/80 transition-colors">PANEL ADMIN</Link>}
                    <button onClick={() => { logout(); setMenuOpen(false) }} className="w-full text-left px-5 py-3 mt-2 text-sm font-bold text-white rounded-xl bg-black uppercase tracking-widest hover:bg-red-500 shadow-lg transition-colors">KELUAR</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <Link to="/login"    className="btn-secondary text-xs px-4 py-2 lg:px-6 lg:py-2.5 shadow-sm">MASUK</Link>
                <Link to="/register" className="btn-primary  text-xs px-4 py-2 lg:px-6 lg:py-2.5 shadow-md">DAFTAR</Link>
              </div>
            )}
          </div>
        </div>

        <nav className="flex gap-6 lg:gap-8 pb-4 pt-1 overflow-x-auto scrollbar-hide">
          <Link to="/" className="text-xs font-bold text-gray-500 uppercase tracking-widest hover:text-black transition-colors whitespace-nowrap">BERANDA</Link>
          <Link to="/search" className="text-xs font-bold text-gray-500 uppercase tracking-widest hover:text-black transition-colors whitespace-nowrap">KATALOG</Link>
          <Link to="/search?hot=1" className="text-xs font-bold text-gray-500 uppercase tracking-widest hover:text-black transition-colors whitespace-nowrap">HOT BOOKS</Link>
          <Link to="/search?sort=commented" className="text-xs font-bold text-gray-500 uppercase tracking-widest hover:text-black transition-colors whitespace-nowrap">MOST DISCUSSED</Link>
          <Link to="/search?sort=viewed" className="text-xs font-bold text-gray-500 uppercase tracking-widest hover:text-black transition-colors whitespace-nowrap">MOST VIEWED</Link>
        </nav>
      </div>
    </header>
  )
}
