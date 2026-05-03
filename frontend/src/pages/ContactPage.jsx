import React from 'react'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-mesh-gradient py-20">
      <div className="container-main">
        <div className="glass-panel p-10 sm:p-20 rounded-[4rem] flex flex-col md:flex-row gap-16 items-center shadow-2xl">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl sm:text-6xl font-extrabold text-black uppercase tracking-tighter text-gradient mb-6 leading-none">GET IN TOUCH</h1>
            <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-sm mb-12">Punya pertanyaan atau ingin bekerja sama? Hubungi tim Folio sekarang.</p>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-black">@</div>
                <p className="font-bold text-black uppercase tracking-widest text-sm">support@folio.com</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-black">#</div>
                <p className="font-bold text-black uppercase tracking-widest text-sm">@folio_catalog</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 w-full glass-panel p-8 sm:p-12 rounded-[3rem] space-y-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">NAMA LENGKAP</label>
              <input placeholder="JOHN DOE" className="input-field" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">EMAIL AKTIF</label>
              <input placeholder="HELLO@WEBSITE.COM" className="input-field" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">PESAN ANDA</label>
              <textarea placeholder="TULIS SESUATU..." className="input-field min-h-[150px] pt-4" />
            </div>
            <button className="btn-primary w-full py-5 text-base">KIRIM PESAN SEKARANG</button>
          </div>
        </div>
      </div>
    </div>
  )
}
