import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-white/80 backdrop-blur-xl border-t border-white/50 mt-16 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
      <div className="container-main py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="mb-3">
              <span style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                <span className="font-extrabold text-2xl leading-none text-transparent bg-clip-text bg-gradient-to-r from-black to-gray-500 tracking-tighter uppercase drop-shadow-sm">FOLIO</span>
                <span className="font-extrabold text-2xl leading-none text-black">.</span>
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-xs uppercase tracking-widest">
              Platform katalog buku digital terlengkap. Temukan, baca, dan nikmati ribuan judul buku pilihan.
            </p>
          </div>

          <div>
            <h4 className="font-extrabold text-xs text-black mb-4 uppercase tracking-widest">Navigasi</h4>
            <ul className="space-y-3">
              {[['/', 'Beranda'],['/search','Katalog Buku'],['/search?hot=1','Hot Books'],['/search?sort=commented','Most Commented']].map(([to, label]) => (
                <li key={to}><Link to={to} className="text-[10px] font-bold text-gray-400 hover:text-black uppercase tracking-widest transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-xs text-black mb-4 uppercase tracking-widest">Akun</h4>
            <ul className="space-y-3">
              {[['/login','Masuk'],['/register','Daftar'],['/profile','Profil Saya'],['/library','Perpustakaan']].map(([to, label]) => (
                <li key={to}><Link to={to} className="text-[10px] font-bold text-gray-400 hover:text-black uppercase tracking-widest transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-xs text-black mb-4 uppercase tracking-widest">Genre Populer</h4>
            <div className="flex flex-wrap gap-2">
              {['Fiksi','Non-Fiksi','Sains','Biografi','Self-Help','Bisnis','Psikologi'].map(g => (
                <Link key={g} to={`/search?genre=${g}`} className="text-[9px] font-bold text-gray-500 bg-white/60 border border-white/50 hover:bg-black hover:text-white px-3 py-1.5 rounded-full uppercase tracking-widest transition-all shadow-sm">{g}</Link>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200/50 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">© 2026 Folio. Semua hak dilindungi.</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dibuat untuk pecinta buku Indonesia</p>
        </div>
      </div>
    </footer>
  )
}
