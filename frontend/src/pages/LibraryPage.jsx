import React, { useEffect, useState } from 'react'
import api from '../api/axios.js'
import BookCard from '../components/BookCard.jsx'

export default function LibraryPage() {
  const [library, setLibrary] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/users/library')
      .then(r => { setLibrary(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-mesh-gradient py-12">
      <div className="container-main">
        <h1 className="text-3xl lg:text-4xl font-extrabold text-black mb-10 uppercase tracking-tighter text-gradient animate-float inline-block">PERPUSTAKAAN SAYA</h1>
        
        {loading ? (
          <div className="flex justify-center py-32">
            <div className="w-10 h-10 border-4 border-white border-t-black rounded-full animate-spin shadow-lg" />
          </div>
        ) : library.length === 0 ? (
          <div className="text-center py-32 glass-panel rounded-[3rem]">
            <div className="text-6xl mb-6 opacity-80 animate-float">📚</div>
            <p className="text-black font-extrabold text-2xl mb-2 uppercase tracking-tighter">PERPUSTAKAAN KOSONG</p>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">CHECKOUT BUKU DARI KATALOG UNTUK MULAI MEMBACA</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 lg:gap-6">
            {library.map(b => b.bookId && <BookCard key={b.bookId._id} book={b.bookId} />)}
          </div>
        )}
      </div>
    </div>
  )
}
