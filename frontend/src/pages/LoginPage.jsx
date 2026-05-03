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
    <div className="min-h-[85vh] bg-mesh-gradient flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md relative">
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-gray-200 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-pulse"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-neutral-300 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        <div className="glass-panel rounded-[3rem] p-10 relative z-10">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-1 mb-2 animate-float">
              <span className="text-4xl font-extrabold text-black uppercase tracking-tighter text-gradient">FOLIO.</span>
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">SELAMAT DATANG KEMBALI</p>
          </div>

          {err && (
            <div className="bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl px-4 py-3 mb-6 text-center shadow-lg shadow-red-500/20">
              {err}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-black mb-2 uppercase tracking-widest">EMAIL</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="NAMA@CONTOH.COM" required className="input-field bg-white/60 backdrop-blur-md"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-black mb-2 uppercase tracking-widest">PASSWORD</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'} value={pass} onChange={e => setPass(e.target.value)}
                  placeholder="MASUKKAN PASSWORD" required className="input-field bg-white/60 backdrop-blur-md pr-24"
                />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 hover:text-black uppercase tracking-widest transition-colors">
                  {show ? 'TUTUP' : 'LIHAT'}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full mt-8 disabled:opacity-60">
              {loading ? 'MEMPROSES...' : 'MASUK'}
            </button>
          </form>

          <p className="text-center text-[10px] font-bold text-gray-400 mt-8 uppercase tracking-widest">
            BELUM PUNYA AKUN?{' '}
            <Link to="/register" className="text-black hover:underline transition-all font-extrabold">DAFTAR SEKARANG</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
