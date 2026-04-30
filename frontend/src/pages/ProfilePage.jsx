import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios.js'
import { useAuth } from '../context/AuthContext.jsx'
import BookCard from '../components/BookCard.jsx'

export default function ProfilePage() {
  const { user }          = useAuth()
  const [profile, setProfile] = useState(null)
  const [library, setLibrary] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const [p, l] = await Promise.all([api.get('/users/profile'), api.get('/users/library')])
        setProfile(p.data)
        setLibrary(l.data)
      } catch {}
      setLoading(false)
    }
    fetch()
  }, [])

  if (loading) return <div className="flex justify-center py-24"><div className="w-10 h-10 border-4 border-[#0060AE] border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-10">
      <div className="container-main max-w-4xl">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 mb-8">
          <div className="flex items-center gap-5 mb-6">
            <div className="w-16 h-16 rounded-full bg-[#0060AE] flex items-center justify-center text-white font-extrabold text-2xl">
              {profile?.fullName?.[0] || 'U'}
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#374151]">{profile?.fullName}</h1>
              <p className="text-sm text-[#6B7280]">{profile?.email}</p>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${profile?.role === 'admin' ? 'bg-[#0060AE] text-white' : 'bg-[#EBF5FF] text-[#0060AE]'}`}>
                {profile?.role === 'admin' ? 'Administrator' : 'Member'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Umur',      value: profile?.age ? `${profile.age} tahun` : '-' },
              { label: 'Pekerjaan', value: profile?.job || '-' },
              { label: 'Negara',    value: profile?.country || '-' },
              { label: 'No. HP',    value: profile?.phone || '-' }
            ].map(i => (
              <div key={i.label} className="bg-[#F9FAFB] rounded-xl p-3">
                <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide">{i.label}</p>
                <p className="text-sm font-bold text-[#374151] mt-0.5">{i.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Perpustakaan Saya ({library.length} buku)</h2>
            <Link to="/library" className="text-xs text-[#0060AE] font-semibold hover:underline">Lihat Semua</Link>
          </div>
          {library.length === 0
            ? <p className="text-sm text-[#6B7280]">Belum ada buku. Checkout buku untuk mulai membaca!</p>
            : (
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                {library.slice(0, 5).map(b => (
                  <div key={b.bookId?._id} className="flex-shrink-0 w-32">
                    <BookCard book={b.bookId || {}} />
                  </div>
                ))}
              </div>
            )}
        </div>

        {profile?.myComments?.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
            <h2 className="section-title mb-4">Komentar Terbaru Saya</h2>
            <div className="space-y-3">
              {profile.myComments.slice(-5).reverse().map((c, i) => (
                <div key={i} className="border-b border-[#F3F4F6] pb-3 last:border-0">
                  <p className="text-xs text-[#0060AE] font-semibold mb-0.5">
                    Comment for Book: <Link to={`/book/${c.bookId}`} className="hover:underline">{c.bookId}</Link>
                  </p>
                  <p className="text-sm text-[#374151]">{c.text}</p>
                  <p className="text-[10px] text-[#6B7280] mt-0.5">{new Date(c.createdAt).toLocaleDateString('id-ID')}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
