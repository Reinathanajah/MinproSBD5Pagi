import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-[#F9FAFB] border-t border-[#E5E7EB] mt-16">
      <div className="container-main py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="mb-3">
              <span style={{ display: 'flex', alignItems: 'baseline', gap: '1px' }}>
                <span className="font-extrabold text-base leading-none" style={{ color: '#0060AE' }}>Folio</span>
                <span className="font-extrabold text-base leading-none" style={{ color: '#F59E0B' }}>!</span>
              </span>
            </div>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Platform katalog buku digital terlengkap. Temukan, baca, dan nikmati ribuan judul buku pilihan.
            </p>
          </div>

          <div>
            <h4 className="font-extrabold text-sm text-[#374151] mb-3">Navigasi</h4>
            <ul className="space-y-2">
              {[['/', 'Beranda'],['/search','Katalog Buku'],['/search?hot=1','Hot Books'],['/search?sort=commented','Most Commented']].map(([to, label]) => (
                <li key={to}><Link to={to} className="text-xs text-[#6B7280] hover:text-[#0060AE] transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-sm text-[#374151] mb-3">Akun</h4>
            <ul className="space-y-2">
              {[['/login','Masuk'],['/register','Daftar'],['/profile','Profil Saya'],['/library','Perpustakaan']].map(([to, label]) => (
                <li key={to}><Link to={to} className="text-xs text-[#6B7280] hover:text-[#0060AE] transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-sm text-[#374151] mb-3">Genre Populer</h4>
            <div className="flex flex-wrap gap-2">
              {['Fiksi','Non-Fiksi','Sains','Biografi','Self-Help','Bisnis','Psikologi'].map(g => (
                <Link key={g} to={`/search?genre=${g}`} className="genre-pill">{g}</Link>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-[#E5E7EB] mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-[#6B7280]">© 2025 Folio! Semua hak dilindungi.</p>
          <p className="text-xs text-[#6B7280]">Dibuat untuk pecinta buku Indonesia</p>
        </div>
      </div>
    </footer>
  )
}
