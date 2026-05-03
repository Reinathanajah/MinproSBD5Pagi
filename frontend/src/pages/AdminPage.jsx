import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios.js'
import { GENRES } from '../constants/data.js'

export default function AdminPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title:'', author:'', releaseYear:'', isbn:'', accessType:'free',
    price:'', pageCount:'', publisher:'', genre:[], coverImage:''
  })
  const [msg, setMsg]   = useState('')
  const [err, setErr]   = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const toggleGenre = (g) => {
    setForm(f => ({
      ...f,
      genre: f.genre.includes(g) ? f.genre.filter(x => x !== g) : [...f.genre, g]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErr(''); setMsg(''); setLoading(true)
    try {
      const payload = {
        ...form,
        releaseYear: Number(form.releaseYear),
        pageCount:   Number(form.pageCount),
        price:       form.accessType === 'sale' ? Number(form.price) : 0
      }
      const { data } = await api.post('/books/add', payload)
      setMsg(`BUKU "${data.title}" BERHASIL DITAMBAHKAN!`)
      setForm({ title:'', author:'', releaseYear:'', isbn:'', accessType:'free', price:'', pageCount:'', publisher:'', genre:[], coverImage:'' })
    } catch (e) {
      setErr(e.response?.data?.message || 'GAGAL MENAMBAHKAN BUKU')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-mesh-gradient py-12">
      <div className="container-main max-w-3xl">
        <div className="flex items-center gap-3 mb-10 border-b border-gray-200/50 pb-6">
          <div className="animate-float">
            <div className="flex items-center gap-1 mb-2">
              <span className="text-3xl font-extrabold text-black uppercase tracking-tighter text-gradient">FOLIO.</span>
              <span className="text-[10px] font-bold bg-black text-white px-2 py-1 rounded-full uppercase tracking-widest ml-2 shadow-sm">ADMIN</span>
            </div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">TAMBAHKAN BUKU BARU KE KATALOG</p>
          </div>
        </div>

        {msg && <div className="bg-black/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest rounded-xl px-4 py-3 mb-6 shadow-lg">{msg}</div>}
        {err && <div className="bg-red-500/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest rounded-xl px-4 py-3 mb-6 shadow-lg">{err}</div>}

        <div className="glass-panel rounded-[3rem] p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Row>
              <Field label="JUDUL BUKU" required>
                <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="JUDUL BUKU" required className="input-field bg-white/60 backdrop-blur-md" />
              </Field>
              <Field label="PENULIS" required>
                <input value={form.author} onChange={e => set('author', e.target.value)} placeholder="NAMA PENULIS" required className="input-field bg-white/60 backdrop-blur-md" />
              </Field>
            </Row>

            <Row>
              <Field label="TAHUN RILIS" required>
                <input type="number" value={form.releaseYear} onChange={e => set('releaseYear', e.target.value)} placeholder="2024" required className="input-field bg-white/60 backdrop-blur-md" />
              </Field>
              <Field label="JUMLAH HALAMAN" required>
                <input type="number" value={form.pageCount} onChange={e => set('pageCount', e.target.value)} placeholder="300" required className="input-field bg-white/60 backdrop-blur-md" />
              </Field>
            </Row>

            <Row>
              <Field label="ISBN" required>
                <input value={form.isbn} onChange={e => set('isbn', e.target.value)} placeholder="978-XXX-XXX" required className="input-field bg-white/60 backdrop-blur-md" />
              </Field>
              <Field label="PENERBIT" required>
                <input value={form.publisher} onChange={e => set('publisher', e.target.value)} placeholder="NAMA PENERBIT" required className="input-field bg-white/60 backdrop-blur-md" />
              </Field>
            </Row>

            <Field label="URL COVER BUKU" required>
              <input value={form.coverImage} onChange={e => set('coverImage', e.target.value)} placeholder="HTTPS://..." required className="input-field bg-white/60 backdrop-blur-md" />
              {form.coverImage && (
                <img src={form.coverImage} alt="preview" className="mt-4 h-32 rounded-2xl object-cover border border-white/40 shadow-lg"
                  onError={e => { e.target.style.display='none' }} />
              )}
            </Field>

            <Field label="TIPE AKSES" required>
              <div className="flex gap-6">
                {['free','sale'].map(t => (
                  <label key={t} className="flex items-center gap-3 cursor-pointer group">
                    <input type="radio" name="accessType" value={t} checked={form.accessType === t}
                      onChange={() => set('accessType', t)} className="w-4 h-4 text-black focus:ring-black border-gray-300" />
                    <span className="text-[10px] font-bold text-gray-600 group-hover:text-black uppercase tracking-widest transition-colors">
                      {t === 'free' ? 'GRATIS' : 'BERBAYAR (SALE)'}
                    </span>
                  </label>
                ))}
              </div>
            </Field>

            {form.accessType === 'sale' && (
              <Field label="HARGA (RP)" required>
                <input type="number" min={0} value={form.price} onChange={e => set('price', e.target.value)}
                  placeholder="0" required className="input-field bg-white/60 backdrop-blur-md" />
                <p className="text-[9px] font-bold text-gray-400 mt-2 uppercase tracking-widest">UNTUK TESTING, ISI 0 = RP 0,00</p>
              </Field>
            )}

            <Field label="GENRE (PILIH MINIMAL 1)" required>
              <div className="flex flex-wrap gap-2 p-4 bg-white/40 backdrop-blur-md border border-white/50 rounded-[2rem]">
                {GENRES.map(g => (
                  <button type="button" key={g} onClick={() => toggleGenre(g)}
                    className={`text-[9px] font-bold px-4 py-2 rounded-full uppercase tracking-widest transition-all ${form.genre.includes(g) ? 'bg-black text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'}`}>
                    {g}
                  </button>
                ))}
              </div>
              {form.genre.length > 0 && (
                <p className="text-[9px] font-extrabold text-black mt-2 uppercase tracking-widest">DIPILIH: {form.genre.join(', ')}</p>
              )}
            </Field>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button type="submit" disabled={loading} className="btn-primary flex-1 py-4 text-sm disabled:opacity-60">
                {loading ? 'MENYIMPAN...' : '+ TAMBAH BUKU'}
              </button>
              <button type="button" onClick={() => navigate('/')} className="btn-secondary px-8 py-4">BATAL</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function Row({ children }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">{children}</div>
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-black mb-2 uppercase tracking-widest">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}
