import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { JOBS, COUNTRIES } from '../constants/data.js'

const reqs = [
  { id: 'len',   label: 'MINIMAL 10 KARAKTER',          test: v => v.length >= 10 },
  { id: 'upper', label: 'MENGANDUNG HURUF BESAR (A-Z)', test: v => /[A-Z]/.test(v) },
  { id: 'lower', label: 'MENGANDUNG HURUF KECIL (A-Z)', test: v => /[a-z]/.test(v) },
  { id: 'num',   label: 'MENGANDUNG ANGKA (0-9)',       test: v => /\d/.test(v) },
  { id: 'sym',   label: 'MENGANDUNG KARAKTER SPESIAL',  test: v => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(v) }
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
    <div className="min-h-screen bg-mesh-gradient flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl relative">
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-gray-200 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-pulse"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-neutral-300 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-pulse" style={{ animationDelay: '2s' }}></div>

        <div className="glass-panel rounded-[3rem] p-10 relative z-10">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-1 mb-2 animate-float">
              <span className="text-4xl font-extrabold text-black uppercase tracking-tighter text-gradient">FOLIO.</span>
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">BERGABUNG DENGAN FOLIO!</p>
          </div>

          {err && (
            <div className="bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl px-4 py-3 mb-6 text-center shadow-lg shadow-red-500/20">
              {err}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Field label="NAMA LENGKAP" required>
              <input value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="NAMA LENGKAP" required className="input-field bg-white/60 backdrop-blur-md" />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="NO. HP" required>
                <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="08XXXXXXXXXX" required className="input-field bg-white/60 backdrop-blur-md" />
              </Field>
              <Field label="UMUR" required>
                <input type="number" min={1} max={120} value={form.age} onChange={e => set('age', e.target.value)} placeholder="25" required className="input-field bg-white/60 backdrop-blur-md" />
              </Field>
            </div>

            <Field label="EMAIL (GMAIL)" required>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="EMAIL@GMAIL.COM" required className="input-field bg-white/60 backdrop-blur-md" />
            </Field>

            <Field label="PASSWORD" required>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'} value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="BUAT PASSWORD KUAT" required className="input-field bg-white/60 backdrop-blur-md pr-24"
                />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 hover:text-black uppercase tracking-widest transition-colors">
                  {show ? 'TUTUP' : 'LIHAT'}
                </button>
              </div>
              {form.password.length > 0 && (
                <div className="mt-3 space-y-2">
                  {reqs.map((r, i) => (
                    <div key={r.id} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full flex items-center justify-center text-[7px] font-bold ${metPass[i] ? 'bg-black text-white shadow-sm' : 'bg-gray-200'}`}>
                        {metPass[i] ? '✓' : ''}
                      </div>
                      <span className={`text-[9px] font-bold tracking-widest ${metPass[i] ? 'text-black' : 'text-gray-400'}`}>{r.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </Field>

            <Field label="PEKERJAAN" required>
              <select value={form.job} onChange={e => set('job', e.target.value)} required className="input-field bg-white/60 backdrop-blur-md uppercase text-xs font-bold text-gray-500 focus:text-black">
                <option value="" className="uppercase">PILIH PEKERJAAN...</option>
                {JOBS.map(j => <option key={j} value={j} className="uppercase font-bold">{j.toUpperCase()}</option>)}
              </select>
            </Field>

            {form.job === 'Other' && (
              <Field label="SEBUTKAN PEKERJAAN ANDA" required>
                <input
                  value={form.customJob} onChange={e => set('customJob', e.target.value)}
                  placeholder="TULISKAN PEKERJAAN ANDA" required
                  className={`input-field bg-white/60 backdrop-blur-md border-2 border-black focus:ring-black`}
                />
              </Field>
            )}

            <Field label="NEGARA" required>
              <select value={form.country} onChange={e => set('country', e.target.value)} required className="input-field bg-white/60 backdrop-blur-md uppercase text-xs font-bold text-gray-500 focus:text-black">
                <option value="" className="uppercase">PILIH NEGARA...</option>
                {COUNTRIES.map(c => <option key={c} value={c} className="uppercase font-bold">{c.toUpperCase()}</option>)}
              </select>
            </Field>

            <button type="submit" disabled={loading}
              className="btn-primary w-full mt-8 disabled:opacity-60">
              {loading ? 'MENDAFTARKAN...' : 'DAFTAR SEKARANG'}
            </button>
          </form>

          <p className="text-center text-[10px] font-bold text-gray-400 mt-8 uppercase tracking-widest">
            SUDAH PUNYA AKUN?{' '}
            <Link to="/login" className="text-black hover:underline transition-all font-extrabold">MASUK DI SINI</Link>
          </p>
        </div>
      </div>
    </div>
  )
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
