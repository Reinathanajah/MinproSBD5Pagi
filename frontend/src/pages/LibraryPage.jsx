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
    <div className="min-h-screen bg-[#F9FAFB] py-10">
      <div className="container-main">
        <h1 className="text-2xl font-extrabold text-[#374151] mb-8">Perpustakaan Saya</h1>
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-10 h-10 border-4 border-[#0060AE] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : library.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4"></div>
            <p className="text-xl font-bold text-[#374151] mb-2">Perpustakaan kosong</p>
            <p className="text-[#6B7280]">Checkout buku dari halaman katalog untuk mulai membaca</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {library.map(b => b.bookId && <BookCard key={b.bookId._id} book={b.bookId} />)}
          </div>
        )}
      </div>
    </div>
  )
}
