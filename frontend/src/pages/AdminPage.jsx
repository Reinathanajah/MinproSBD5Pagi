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
      setMsg(`Buku "${data.title}" berhasil ditambahkan!`)
      setForm({ title:'', author:'', releaseYear:'', isbn:'', accessType:'free', price:'', pageCount:'', publisher:'', genre:[], coverImage:'' })
    } catch (e) {
      setErr(e.response?.data?.message || 'Gagal menambahkan buku')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-10">
      <div className="container-main max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <div>
            <div className="flex items-center gap-0.5">
              <span className="text-xl font-extrabold" style={{ color: '#0060AE' }}>Folio</span>
              <span className="text-xl font-extrabold" style={{ color: '#F59E0B' }}>!</span>
              <span className="text-xl font-extrabold text-[#374151] ml-1">Panel Admin</span>
            </div>
            <p className="text-sm text-[#6B7280]">Tambahkan buku baru ke katalog</p>
          </div>
        </div>

        {msg && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-5">{msg}</div>}
        {err && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">{err}</div>}

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Row>
              <Field label="Judul Buku" required>
                <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Judul buku" required className="input-field" />
              </Field>
              <Field label="Penulis" required>
                <input value={form.author} onChange={e => set('author', e.target.value)} placeholder="Nama penulis" required className="input-field" />
              </Field>
            </Row>

            <Row>
              <Field label="Tahun Rilis" required>
                <input type="number" value={form.releaseYear} onChange={e => set('releaseYear', e.target.value)} placeholder="2024" required className="input-field" />
              </Field>
              <Field label="Jumlah Halaman" required>
                <input type="number" value={form.pageCount} onChange={e => set('pageCount', e.target.value)} placeholder="300" required className="input-field" />
              </Field>
            </Row>

            <Row>
              <Field label="ISBN" required>
                <input value={form.isbn} onChange={e => set('isbn', e.target.value)} placeholder="978-xxx-xxx" required className="input-field" />
              </Field>
              <Field label="Penerbit" required>
                <input value={form.publisher} onChange={e => set('publisher', e.target.value)} placeholder="Nama penerbit" required className="input-field" />
              </Field>
            </Row>

            <Field label="URL Cover Buku" required>
              <input value={form.coverImage} onChange={e => set('coverImage', e.target.value)} placeholder="https://..." required className="input-field" />
              {form.coverImage && (
                <img src={form.coverImage} alt="preview" className="mt-2 h-24 rounded-lg object-cover border border-[#E5E7EB]"
                  onError={e => { e.target.style.display='none' }} />
              )}
            </Field>

            <Field label="Tipe Akses" required>
              <div className="flex gap-4">
                {['free','sale'].map(t => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="accessType" value={t} checked={form.accessType === t}
                      onChange={() => set('accessType', t)} className="accent-[#0060AE]" />
                    <span className="text-sm font-semibold text-[#374151]">
                      {t === 'free' ? 'Gratis' : 'Berbayar (Sale)'}
                    </span>
                  </label>
                ))}
              </div>
            </Field>

            {form.accessType === 'sale' && (
              <Field label="Harga (Rp)" required>
                <input type="number" min={0} value={form.price} onChange={e => set('price', e.target.value)}
                  placeholder="0" required className="input-field" />
                <p className="text-xs text-[#6B7280] mt-1">Untuk testing, isi 0 = Rp 0,00</p>
              </Field>
            )}

            <Field label="Genre (pilih minimal 1)" required>
              <div className="flex flex-wrap gap-2 p-3 border border-[#E5E7EB] rounded-lg">
                {GENRES.map(g => (
                  <button type="button" key={g} onClick={() => toggleGenre(g)}
                    className={`text-xs px-3 py-1 rounded-full border font-semibold transition-colors ${form.genre.includes(g) ? 'bg-[#0060AE] text-white border-[#0060AE]' : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#0060AE] hover:text-[#0060AE]'}`}>
                    {g}
                  </button>
                ))}
              </div>
              {form.genre.length > 0 && (
                <p className="text-xs text-[#0060AE] mt-1">Dipilih: {form.genre.join(', ')}</p>
              )}
            </Field>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading} className="btn-primary flex-1 py-3 text-base disabled:opacity-60">
                {loading ? 'Menyimpan...' : '+ Tambah Buku'}
              </button>
              <button type="button" onClick={() => navigate('/')} className="btn-secondary px-6">Batal</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function Row({ children }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#374151] mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}
