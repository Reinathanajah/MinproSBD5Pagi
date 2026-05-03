import React from 'react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-mesh-gradient py-20">
      <div className="container-main">
        <div className="glass-panel p-10 sm:p-20 rounded-[4rem] text-center max-w-5xl mx-auto shadow-2xl">
          <h1 className="text-4xl sm:text-7xl font-extrabold text-black uppercase tracking-tighter text-gradient mb-8">ABOUT FOLIO.</h1>
          <div className="h-2 w-32 bg-black mx-auto mb-12 rounded-full" />
          <p className="text-gray-600 text-lg sm:text-2xl font-medium leading-relaxed uppercase tracking-wide">
            Folio adalah perpustakaan digital masa depan yang dirancang khusus untuk generasi Z. 
            Kami bukan sekadar aplikasi, melainkan ekosistem literasi modern.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 text-left">
            <div className="p-8 bg-white/50 rounded-3xl border border-white/50">
              <h3 className="font-black text-xl mb-4 uppercase">VISI KAMI</h3>
              <p className="text-sm text-gray-500 font-bold uppercase tracking-widest leading-loose">Menjadikan membaca sebagai gaya hidup yang estetik dan esensial di era digital.</p>
            </div>
            <div className="p-8 bg-white/50 rounded-3xl border border-white/50">
              <h3 className="font-black text-xl mb-4 uppercase">KURASI TERBAIK</h3>
              <p className="text-sm text-gray-500 font-bold uppercase tracking-widest leading-loose">Setiap buku dalam katalog kami telah melalui proses kurasi ketat untuk kualitas terbaik.</p>
            </div>
            <div className="p-8 bg-white/50 rounded-3xl border border-white/50">
              <h3 className="font-black text-xl mb-4 uppercase">AKSES TANPA BATAS</h3>
              <p className="text-sm text-gray-500 font-bold uppercase tracking-widest leading-loose">Baca kapan saja, di mana saja, dengan antarmuka yang bersih dan bebas gangguan.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
