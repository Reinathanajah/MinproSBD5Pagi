import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios.js'
import StarRating from '../components/StarRating.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { OPTIONAL_ATTR_TYPES } from '../constants/data.js'

export default function BookDetailPage() {
  const { id }             = useParams()
  const navigate           = useNavigate()
  const { user, isAdmin }  = useAuth()
  const [book, setBook]    = useState(null)
  const [owned, setOwned]  = useState(false)
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [rating, setRating]   = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [msg, setMsg]      = useState('')
  const [attrModal, setAttrModal] = useState(false)
  const [newAttr, setNewAttr]     = useState({ key:'', label:'', type:'other', value:'' })

  const fetchBook = async () => {
    try {
      const { data } = await api.get(`/books/${id}`)
      setBook(data)
      await api.post(`/books/${id}/click`)
    } catch { navigate('/') }
    setLoading(false)
  }

  const checkOwned = async () => {
    if (!user) return
    try {
      const { data } = await api.get('/users/library')
      setOwned(data.some(b => b.bookId?._id === id || b.bookId === id))
    } catch {}
  }

  useEffect(() => { fetchBook(); checkOwned() }, [id])

  const handleCheckout = async () => {
    if (!user) return navigate('/login')
    try {
      await api.post(`/books/${id}/checkout`)
      setOwned(true)
      setMsg('Buku berhasil ditambahkan ke perpustakaan Anda!')
    } catch (e) {
      setMsg(e.response?.data?.message || 'Gagal checkout')
    }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!user) return navigate('/login')
    try {
      await api.post(`/books/${id}/comment`, { text: comment })
      setComment('')
      await fetchBook()
    } catch (e) { setMsg(e.response?.data?.message || 'Gagal kirim komentar') }
  }

  const handleRate = async (score) => {
    if (!user) return navigate('/login')
    try {
      const { data } = await api.post(`/books/${id}/rate`, { score })
      setBook(b => ({ ...b, averageRating: data.averageRating, weightedRating: data.weightedRating, totalRatings: data.totalRatings }))
    } catch {}
  }

  const handleLike = async (commentId) => {
    if (!user) return navigate('/login')
    try {
      await api.post(`/books/${id}/comment/${commentId}/like`)
      await fetchBook()
    } catch {}
  }

  const handleArchive = async () => {
    if (!window.confirm('Arsipkan buku ini?')) return
    await api.patch(`/books/${id}/archive`)
    navigate('/')
  }

  const handleDelete = async () => {
    if (!window.confirm('Hapus buku ini? Slot akan didaur ulang.')) return
    await api.delete(`/books/${id}`)
    navigate('/')
  }

  const handleAddAttr = async (e) => {
    e.preventDefault()
    try {
      await api.post(`/books/${id}/attribute`, newAttr)
      setAttrModal(false)
      setNewAttr({ key:'', label:'', type:'other', value:'' })
      await fetchBook()
    } catch (e) { setMsg(e.response?.data?.message || 'Gagal menambah atribut') }
  }

  if (loading) return (
    <div className="flex justify-center items-center h-96">
      <div className="w-10 h-10 border-4 border-[#0060AE] border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!book) return null

  const formatPrice = (p) => p === 0 ? 'Rp 0,00' : `Rp ${p?.toLocaleString('id-ID')}`

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-10">
      <div className="container-main">
        {msg && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-6">
            {msg} <button onClick={() => setMsg('')} className="ml-2 text-green-500">x</button>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
          <div className="flex flex-col md:flex-row gap-0">
            <div className="md:w-64 lg:w-80 flex-shrink-0 bg-[#F3F4F6] flex items-center justify-center p-8">
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-full max-w-[200px] rounded-xl shadow-lg object-cover aspect-[3/4]"
                onError={e => { e.target.src = 'https://via.placeholder.com/200x267?text=No+Cover' }}
              />
            </div>

            <div className="flex-1 p-8">
              <div className="flex flex-wrap gap-2 mb-3">
                {book.genre?.map(g => <span key={g} className="genre-pill">{g}</span>)}
                {book.shelf === 'hot' && <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">HOT</span>}
                {book.accessType === 'free' ? <span className="badge-free">Gratis</span> : <span className="badge-sale">Berbayar</span>}
              </div>

              <h1 className="text-2xl lg:text-3xl font-extrabold text-[#374151] mb-1 leading-tight">{book.title}</h1>
              <p className="text-[#6B7280] font-semibold mb-4">{book.author}</p>

              <StarRating score={book.averageRating || 0} total={book.totalRatings || 0} size="lg" />

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 mb-6">
                <Attr label="Penerbit"      value={book.publisher} />
                <Attr label="Tahun Rilis"   value={book.releaseYear} />
                <Attr label="Jumlah Halaman" value={`${book.pageCount} hlm`} />
                <Attr label="ISBN"          value={book.isbn} />
                <Attr label="Shelf"         value={book.shelf === 'hot' ? 'Hot Shelf' : 'Cold Shelf'} />
                <Attr label="Penayangan"    value={`${book.uniqueViewers || 0} pembaca`} />
                {book.optionalAttributes?.map(a => (
                  <Attr key={a.key} label={a.label} value={String(a.value || '-')} />
                ))}
              </div>

              <div className="border-t border-[#E5E7EB] pt-6">
                {book.accessType === 'free'
                  ? <p className="text-[#0060AE] font-extrabold text-2xl mb-4">Gratis</p>
                  : <p className="text-[#374151] font-extrabold text-2xl mb-4">{formatPrice(book.price)}</p>}

                <div className="flex flex-wrap gap-3">
                  {owned
                    ? <button onClick={() => navigate('/library')} className="btn-primary px-8 py-3 text-base">Lanjut Membaca</button>
                    : <button onClick={handleCheckout} className="btn-primary px-8 py-3 text-base">
                        {book.accessType === 'free' ? 'Akses Gratis' : 'Checkout'}
                      </button>}

                  {isAdmin && (
                    <>
                      <button onClick={handleArchive} className="btn-secondary">Arsipkan</button>
                      <button onClick={handleDelete}  className="btn-danger">Hapus</button>
                      <button onClick={() => setAttrModal(true)} className="btn-secondary">+ Atribut</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
            <h2 className="section-title mb-4">Beri Rating</h2>
            <div className="flex gap-2 mb-4">
              {[1,2,3,4,5].map(s => (
                <button
                  key={s}
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => { setRating(s); handleRate(s) }}
                  className={`text-2xl transition-transform hover:scale-110 ${s <= (hoverRating || rating) ? 'text-yellow-400' : 'text-[#E5E7EB]'}`}
                >&#9733;</button>
              ))}
              {rating > 0 && <span className="text-sm text-[#6B7280] self-center ml-2">Rating kamu: {rating}/5</span>}
            </div>

            <h2 className="section-title mb-4 pt-4 border-t border-[#E5E7EB]">Komentar</h2>
            {user && (
              <form onSubmit={handleComment} className="mb-6">
                <textarea
                  value={comment} onChange={e => setComment(e.target.value)}
                  placeholder="Tulis komentarmu tentang buku ini..."
                  rows={3} required className="input-field resize-none mb-2"
                />
                <button type="submit" className="btn-primary">Kirim Komentar</button>
              </form>
            )}
            <div className="space-y-4">
              {book.embeddedComments?.length === 0
                ? <p className="text-sm text-[#6B7280]">Belum ada komentar.</p>
                : book.embeddedComments?.map(c => (
                  <div key={c._id} className="border-b border-[#F3F4F6] pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-[#374151]">{c.userName}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${c.sentiment === 'positive' ? 'bg-green-100 text-green-700' : c.sentiment === 'negative' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                          {c.sentiment}
                        </span>
                        <span className="text-xs text-[#6B7280]">{new Date(c.createdAt).toLocaleDateString('id-ID')}</span>
                      </div>
                    </div>
                    <p className="text-sm text-[#6B7280]">{c.text}</p>
                    <button onClick={() => handleLike(c._id)} className="mt-1 text-xs text-[#0060AE] hover:underline">
                      {c.likes?.length || 0} Suka
                    </button>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
            <h2 className="section-title mb-4">Statistik Buku</h2>
            <div className="grid grid-cols-2 gap-4">
              <Stat label="Total Komentar" value={book.totalComments || 0} color="blue" />
              <Stat label="Total Rating"   value={book.totalRatings || 0}  color="yellow" />
              <Stat label="Total View"     value={book.totalViews || 0}    color="green" />
              <Stat label="Pembaca Unik"   value={book.uniqueViewers || 0} color="purple" />
              <Stat label="Rata-rata Rating" value={(book.averageRating || 0).toFixed(2)} color="orange" />
              <Stat label="Weighted Score"   value={(book.weightedRating || 0).toFixed(2)} color="red" />
            </div>
          </div>
        </div>

        {attrModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <h3 className="font-extrabold text-lg text-[#374151] mb-4">Tambah Atribut Opsional</h3>
              <form onSubmit={handleAddAttr} className="space-y-3">
                <input value={newAttr.key}   onChange={e => setNewAttr(a => ({...a, key: e.target.value}))} placeholder="Key (contoh: ebook_url)" required className="input-field" />
                <input value={newAttr.label} onChange={e => setNewAttr(a => ({...a, label: e.target.value}))} placeholder="Label tampilan" required className="input-field" />
                <select value={newAttr.type} onChange={e => setNewAttr(a => ({...a, type: e.target.value}))} className="input-field">
                  {OPTIONAL_ATTR_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <input value={newAttr.value} onChange={e => setNewAttr(a => ({...a, value: e.target.value}))} placeholder="Nilai (URL, teks, dll)" className="input-field" />
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="btn-primary flex-1">Tambahkan</button>
                  <button type="button" onClick={() => setAttrModal(false)} className="btn-secondary flex-1">Batal</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Attr({ label, value }) {
  return (
    <div className="bg-[#F9FAFB] rounded-lg p-3">
      <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm font-bold text-[#374151]">{value || '-'}</p>
    </div>
  )
}

function Stat({ label, value, color }) {
  const colors = { blue:'bg-blue-50 text-blue-700', yellow:'bg-yellow-50 text-yellow-700', green:'bg-green-50 text-green-700', purple:'bg-purple-50 text-purple-700', orange:'bg-orange-50 text-orange-700', red:'bg-red-50 text-red-700' }
  return (
    <div className={`${colors[color]} rounded-xl p-4 text-center`}>
      <p className="text-2xl font-extrabold">{value}</p>
      <p className="text-xs font-semibold mt-0.5">{label}</p>
    </div>
  )
}
