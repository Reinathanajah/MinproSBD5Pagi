import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const SearchIcon = () => (
  <svg className="w-4 h-4 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

const CartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 7H4L5 9z" />
  </svg>
)

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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

  const trending = ['Novel Terlaris', 'Buku Anak', 'Self-Help', 'Fiksi Ilmiah', 'Biografi']

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
        <div className="container-main flex justify-end gap-4 py-1">
          <Link to="/search?genre=Promo" className="text-xs text-[#6B7280] hover:text-[#0060AE] transition-colors">Promo</Link>
          <Link to="/about"             className="text-xs text-[#6B7280] hover:text-[#0060AE] transition-colors">Tentang Kami</Link>
          <Link to="/contact"           className="text-xs text-[#6B7280] hover:text-[#0060AE] transition-colors">Hubungi Kami</Link>
        </div>
      </div>

      <div className="container-main">
        <div className="flex items-center gap-4 py-3">
          <Link to="/" className="flex-shrink-0">
            <span style={{ display: 'flex', alignItems: 'baseline', gap: '1px' }}>
              <span className="font-extrabold text-xl leading-none" style={{ color: '#0060AE' }}>Folio</span>
              <span className="font-extrabold text-xl leading-none" style={{ color: '#F59E0B' }}>!</span>
            </span>
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-auto">
            <div className="flex items-center border border-[#E5E7EB] rounded-full bg-white px-4 py-2 gap-2 focus-within:border-[#0060AE] focus-within:ring-2 focus-within:ring-[#0060AE]/20 transition-all">
              <SearchIcon />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Cari judul buku atau nama penulis..."
                className="flex-1 text-sm outline-none text-[#374151] placeholder-[#6B7280] bg-transparent"
              />
              {query && (
                <button type="button" onClick={() => setQuery('')} className="text-[#6B7280] hover:text-[#374151] text-xs">x</button>
              )}
            </div>
            <div className="flex gap-2 mt-1.5 pl-4 flex-wrap">
              {trending.map(t => (
                <button
                  key={t} type="button"
                  onClick={() => { setQuery(t); navigate(`/search?q=${encodeURIComponent(t)}`) }}
                  className="text-xs text-[#0060AE] hover:underline"
                >{t}</button>
              ))}
            </div>
          </form>

          <div className="flex items-center gap-2 flex-shrink-0">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 btn-secondary"
                >
                  <UserIcon />
                  <span className="text-sm font-semibold hidden sm:block">{user.fullName.split(' ')[0]}</span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-lg border border-[#E5E7EB] overflow-hidden z-50">
                    <Link to="/profile"  onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm text-[#374151] hover:bg-[#F9FAFB] transition-colors">Profil Saya</Link>
                    <Link to="/library"  onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm text-[#374151] hover:bg-[#F9FAFB] transition-colors">Perpustakaan</Link>
                    {isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm text-[#0060AE] font-semibold hover:bg-[#EBF5FF] transition-colors">Panel Admin</Link>}
                    <hr className="border-[#E5E7EB]" />
                    <button onClick={() => { logout(); setMenuOpen(false) }} className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">Keluar</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login"    className="btn-secondary text-sm">Masuk</Link>
                <Link to="/register" className="btn-primary  text-sm">Daftar</Link>
              </>
            )}
          </div>
        </div>

        <nav className="flex gap-6 pb-2 border-t border-[#E5E7EB] pt-2">
          <Link to="/"             className="text-xs font-semibold text-[#374151] hover:text-[#0060AE] transition-colors">Beranda</Link>
          <Link to="/search"       className="text-xs font-semibold text-[#374151] hover:text-[#0060AE] transition-colors">Katalog</Link>
          <Link to="/search?hot=1" className="text-xs font-semibold text-[#374151] hover:text-[#0060AE] transition-colors">Hot Books</Link>
          <Link to="/search?sort=commented" className="text-xs font-semibold text-[#374151] hover:text-[#0060AE] transition-colors">Most Commented</Link>
          <Link to="/search?sort=viewed"    className="text-xs font-semibold text-[#374151] hover:text-[#0060AE] transition-colors">Most Viewed</Link>
        </nav>
      </div>
    </header>
  )
}
