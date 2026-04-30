import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function LoginPage() {
  const { login, loading } = useAuth()
  const navigate           = useNavigate()
  const [email, setEmail]  = useState('')
  const [pass, setPass]    = useState('')
  const [err, setErr]      = useState('')
  const [show, setShow]    = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErr('')
    const res = await login(email, pass)
    if (res.ok) navigate('/')
    else setErr(res.message)
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-0.5 mb-1">
              <span className="text-2xl font-extrabold" style={{ color: '#0060AE' }}>Folio</span>
              <span className="text-2xl font-extrabold" style={{ color: '#F59E0B' }}>!</span>
            </div>
            <p className="text-sm text-[#6B7280]">Selamat datang kembali!</p>
          </div>

          {err && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-5">{err}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="email@contoh.com" required className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'} value={pass} onChange={e => setPass(e.target.value)}
                  placeholder="Masukkan password" required className="input-field pr-10"
                />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] text-xs hover:text-[#374151]">
                  {show ? 'Sembunyikan' : 'Tampilkan'}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full py-2.5 disabled:opacity-60">
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <p className="text-center text-sm text-[#6B7280] mt-6">
            Belum punya akun?{' '}
            <Link to="/register" className="text-[#0060AE] font-semibold hover:underline">Daftar sekarang</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
