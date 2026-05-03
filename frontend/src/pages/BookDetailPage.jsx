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
      try {
        await api.post(`/books/${id}/click`)
      } catch (err) {}
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
      <div className="w-10 h-10 border-4 border-white border-t-black rounded-full animate-spin shadow-lg" />
    </div>
  )
  if (!book) return null

  const formatPrice = (p) => p === 0 ? 'Rp 0,00' : `Rp ${p?.toLocaleString('id-ID')}`

  return (
    <div className="min-h-screen bg-mesh-gradient py-10">
      <div className="container-main">
        {msg && (
          <div className="bg-black/90 backdrop-blur-md text-white text-sm font-bold uppercase tracking-widest rounded-full px-6 py-4 mb-8 flex justify-between items-center shadow-lg">
            {msg} <button onClick={() => setMsg('')} className="ml-4 hover:scale-125 transition-transform">X</button>
          </div>
        )}

        <div className="glass-panel rounded-[3rem] overflow-hidden mb-12">
          <div className="flex flex-col md:flex-row gap-0">
            <div className="md:w-72 lg:w-96 flex-shrink-0 bg-black/5 flex items-center justify-center p-12">
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-full max-w-[240px] rounded-2xl shadow-2xl shadow-black/30 object-cover aspect-[3/4] animate-float"
                onError={e => { e.target.src = 'https://via.placeholder.com/200x267?text=No+Cover' }}
              />
            </div>

            <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gray-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -z-10 pointer-events-none"></div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {book.genre?.map(g => <span key={g} className="bg-white/60 border border-white/50 text-gray-600 text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">{g}</span>)}
                {book.shelf === 'hot' && <span className="bg-red-500 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-md shadow-red-500/20">HOT</span>}
                {book.accessType === 'free' ? <span className="badge-free shadow-sm">GRATIS</span> : <span className="badge-sale shadow-md">BERBAYAR</span>}
              </div>

              <h1 className="text-3xl lg:text-5xl font-extrabold text-black mb-2 leading-tight uppercase tracking-tighter text-gradient drop-shadow-sm">{book.title}</h1>
              <p className="text-gray-500 font-extrabold uppercase tracking-widest text-sm mb-6">{book.author}</p>

              <StarRating score={book.averageRating || 0} total={book.totalRatings || 0} size="lg" />

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8 mb-8">
                <Attr label="PENERBIT"      value={book.publisher} />
                <Attr label="TAHUN RILIS"   value={book.releaseYear} />
                <Attr label="JUMLAH HALAMAN" value={`${book.pageCount} HLM`} />
                <Attr label="ISBN"          value={book.isbn} />
                <Attr label="SHELF"         value={book.shelf === 'hot' ? 'HOT SHELF' : 'COLD SHELF'} />
                <Attr label="PENAYANGAN"    value={`${book.uniqueViewers || 0} PEMBACA`} />
                {book.optionalAttributes?.map(a => (
                  <Attr key={a.key} label={a.label} value={String(a.value || '-')} />
                ))}
              </div>

              <div className="border-t border-gray-200/50 pt-8 mt-auto">
                {book.accessType === 'free'
                  ? <p className="text-black font-extrabold text-3xl mb-6 uppercase tracking-tighter text-gradient">GRATIS</p>
                  : <p className="text-black font-extrabold text-3xl mb-6 tracking-tighter text-gradient">{formatPrice(book.price)}</p>}

                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={() => window.open(book.driveLink || 'https://drive.google.com/file/d/1Gs2lkAelCje1xCGzRpcgSO12ZGHhe-17/view?usp=sharing', '_blank')} 
                    className="btn-primary shadow-xl"
                  >
                    BACA BUKU
                  </button>

                  {owned
                    ? <button onClick={() => navigate('/library')} className="btn-secondary shadow-sm bg-white/60">KE PERPUSTAKAAN</button>
                    : <button onClick={handleCheckout} className="btn-secondary shadow-sm bg-white/60">
                        {book.accessType === 'free' ? 'KLAIM GRATIS' : 'CHECKOUT'}
                      </button>}

                  {isAdmin && (
                    <>
                      <button onClick={handleArchive} className="btn-secondary bg-white/60 text-red-600">ARSIPKAN</button>
                      <button onClick={handleDelete}  className="btn-danger">HAPUS</button>
                      <button onClick={() => setAttrModal(true)} className="btn-secondary bg-white/60">+ ATRIBUT</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
          <div className="glass-panel rounded-[3rem] p-8">
            <h2 className="section-title mb-6 text-gradient">BERI RATING</h2>
            <div className="flex gap-2 mb-8">
              {[1,2,3,4,5].map(s => (
                <button
                  key={s}
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => { setRating(s); handleRate(s) }}
                  className={`text-3xl transition-transform hover:scale-110 drop-shadow-sm ${s <= (hoverRating || rating) ? 'text-black' : 'text-gray-300'}`}
                >&#9733;</button>
              ))}
              {rating > 0 && <span className="text-xs font-bold text-gray-500 self-center ml-4 uppercase tracking-widest">RATING KAMU: {rating}/5</span>}
            </div>

            <h2 className="section-title mb-6 pt-6 border-t border-gray-200/50 text-gradient">KOMENTAR</h2>
            {user && (
              <form onSubmit={handleComment} className="mb-8">
                <textarea
                  value={comment} onChange={e => setComment(e.target.value)}
                  placeholder="Tulis pendapatmu tentang buku ini..."
                  rows={3} required className="input-field bg-white/60 backdrop-blur-md resize-none mb-4"
                />
                <button type="submit" className="btn-primary w-full sm:w-auto">KIRIM KOMENTAR</button>
              </form>
            )}
            <div className="space-y-6">
              {book.embeddedComments?.length === 0
                ? <p className="text-sm font-bold text-gray-400 uppercase tracking-widest text-center py-4">BELUM ADA KOMENTAR.</p>
                : book.embeddedComments?.map(c => (
                  <div key={c._id} className="border-b border-gray-200/50 pb-6 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-extrabold text-black uppercase tracking-widest">{c.userName}</span>
                      <div className="flex items-center gap-3">
                        <span className={`text-[9px] px-3 py-1 rounded-full font-bold uppercase tracking-widest shadow-sm ${c.sentiment === 'positive' ? 'bg-black text-white' : c.sentiment === 'negative' ? 'bg-red-500 text-white' : 'bg-white text-gray-500'}`}>
                          {c.sentiment}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400">{new Date(c.createdAt).toLocaleDateString('id-ID')}</span>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-600 leading-relaxed">{c.text}</p>
                    <button onClick={() => handleLike(c._id)} className="mt-3 text-[10px] font-bold text-black uppercase tracking-widest hover:text-gray-500 transition-colors">
                      &hearts; {c.likes?.length || 0} SUKA
                    </button>
                  </div>
                ))}
            </div>
          </div>

          <div className="glass-panel rounded-[3rem] p-8 h-fit">
            <h2 className="section-title mb-8 text-gradient">STATISTIK BUKU</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Stat label="TOTAL KOMENTAR" value={book.totalComments || 0} />
              <Stat label="TOTAL RATING"   value={book.totalRatings || 0} />
              <Stat label="TOTAL VIEW"     value={book.totalViews || 0} />
              <Stat label="PEMBACA UNIK"   value={book.uniqueViewers || 0} />
              <Stat label="RATA-RATA RATING" value={(book.averageRating || 0).toFixed(2)} />
              <Stat label="WEIGHTED SCORE"   value={(book.weightedRating || 0).toFixed(2)} />
            </div>
          </div>
        </div>

        {attrModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="glass-panel rounded-3xl p-8 w-full max-w-md shadow-2xl">
              <h3 className="font-extrabold text-2xl text-black mb-6 uppercase tracking-tighter text-gradient">TAMBAH ATRIBUT OPSIONAL</h3>
              <form onSubmit={handleAddAttr} className="space-y-4">
                <input value={newAttr.key}   onChange={e => setNewAttr(a => ({...a, key: e.target.value}))} placeholder="KEY (CONTOH: EBOOK_URL)" required className="input-field bg-white/60" />
                <input value={newAttr.label} onChange={e => setNewAttr(a => ({...a, label: e.target.value}))} placeholder="LABEL TAMPILAN" required className="input-field bg-white/60" />
                <select value={newAttr.type} onChange={e => setNewAttr(a => ({...a, type: e.target.value}))} className="input-field bg-white/60 font-bold uppercase text-xs">
                  {OPTIONAL_ATTR_TYPES.map(t => <option key={t.value} value={t.value} className="font-bold">{t.label.toUpperCase()}</option>)}
                </select>
                <input value={newAttr.value} onChange={e => setNewAttr(a => ({...a, value: e.target.value}))} placeholder="NILAI (URL, TEKS, DLL)" className="input-field bg-white/60" />
                <div className="flex gap-4 pt-4">
                  <button type="submit" className="btn-primary flex-1 shadow-lg">TAMBAHKAN</button>
                  <button type="button" onClick={() => setAttrModal(false)} className="btn-secondary flex-1">BATAL</button>
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
    <div className="bg-white/60 backdrop-blur-sm border border-white/40 rounded-2xl p-4 shadow-sm hover:bg-white/80 transition-colors">
      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm font-extrabold text-black uppercase truncate">{value || '-'}</p>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="bg-white/60 backdrop-blur-sm border border-white/40 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:bg-white/80 hover:-translate-y-1 transition-all">
      <p className="text-3xl font-extrabold text-black tracking-tighter">{value}</p>
      <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-2">{label}</p>
    </div>
  )
}
