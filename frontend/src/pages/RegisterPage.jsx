import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { JOBS, COUNTRIES } from '../constants/data.js'

const reqs = [
  { id: 'len',   label: 'Minimal 10 karakter',          test: v => v.length >= 10 },
  { id: 'upper', label: 'Mengandung huruf besar (A-Z)', test: v => /[A-Z]/.test(v) },
  { id: 'lower', label: 'Mengandung huruf kecil (a-z)', test: v => /[a-z]/.test(v) },
  { id: 'num',   label: 'Mengandung angka (0-9)',       test: v => /\d/.test(v) },
  { id: 'sym',   label: 'Mengandung karakter spesial',  test: v => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(v) }
]

export default function RegisterPage() {
  const { register, loading } = useAuth()
  const navigate              = useNavigate()
  const [form, setForm]       = useState({ fullName:'', phone:'', email:'', password:'', age:'', job:'', country:'', customJob:'' })
  const [show, setShow]       = useState(false)
  const [err, setErr]         = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErr('')
    const payload = {
      fullName: form.fullName,
      phone:    form.phone,
      email:    form.email,
      password: form.password,
      age:      Number(form.age),
      job:      form.job === 'Other' ? form.customJob : form.job,
      country:  form.country
    }
    const res = await register(payload)
    if (res.ok) navigate('/')
    else setErr(res.message)
  }

  const metPass = reqs.map(r => r.test(form.password))

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-0.5 mb-1">
              <span className="text-2xl font-extrabold" style={{ color: '#0060AE' }}>Folio</span>
              <span className="text-2xl font-extrabold" style={{ color: '#F59E0B' }}>!</span>
            </div>
            <p className="text-sm text-[#6B7280]">Bergabung dengan Folio!</p>
          </div>

          {err && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-5">{err}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Nama Lengkap" required>
              <input value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="Nama lengkap" required className="input-field" />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="No. HP" required>
                <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="08xxxxxxxxxx" required className="input-field" />
              </Field>
              <Field label="Umur" required>
                <input type="number" min={1} max={120} value={form.age} onChange={e => set('age', e.target.value)} placeholder="25" required className="input-field" />
              </Field>
            </div>

            <Field label="Email (Gmail)" required>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@gmail.com" required className="input-field" />
            </Field>

            <Field label="Password" required>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'} value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="Buat password kuat" required className="input-field pr-24"
                />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6B7280] hover:text-[#374151]">
                  {show ? 'Sembunyikan' : 'Tampilkan'}
                </button>
              </div>
              {form.password.length > 0 && (
                <div className="mt-2 space-y-1">
                  {reqs.map((r, i) => (
                    <div key={r.id} className="flex items-center gap-2">
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${metPass[i] ? 'bg-green-500' : 'bg-[#E5E7EB]'}`}>
                        {metPass[i] ? <span className="text-white text-[8px]">OK</span> : ''}
                      </div>
                      <span className={`text-xs ${metPass[i] ? 'text-green-600' : 'text-[#6B7280]'}`}>{r.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </Field>

            <Field label="Pekerjaan" required>
              <select value={form.job} onChange={e => set('job', e.target.value)} required className="input-field">
                <option value="">Pilih pekerjaan...</option>
                {JOBS.map(j => <option key={j} value={j}>{j}</option>)}
              </select>
            </Field>

            {form.job === 'Other' && (
              <Field label="Sebutkan Pekerjaan Anda" required>
                <input
                  value={form.customJob} onChange={e => set('customJob', e.target.value)}
                  placeholder="Tuliskan pekerjaan Anda secara spesifik" required
                  className={`input-field border-red-400 focus:ring-red-400`}
                />
              </Field>
            )}

            <Field label="Negara" required>
              <select value={form.country} onChange={e => set('country', e.target.value)} required className="input-field">
                <option value="">Pilih negara...</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>

            <button type="submit" disabled={loading}
              className="btn-primary w-full py-2.5 mt-2 disabled:opacity-60">
              {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
            </button>
          </form>

          <p className="text-center text-sm text-[#6B7280] mt-6">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-[#0060AE] font-semibold hover:underline">Masuk di sini</Link>
          </p>
        </div>
      </div>
    </div>
  )
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
