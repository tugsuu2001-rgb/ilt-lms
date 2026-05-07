'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const supabase = createClient()
  const router = useRouter()

  async function handleLogin() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else router.push('/dashboard')
    setLoading(false)
  }

  async function handleRegister() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    })
    if (error) setError(error.message)
    else setMessage('И-мэйл хаяг руу баталгаажуулах линк илгээлээ!')
    setLoading(false)
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` }
    })
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* LEFT */}
      <div className="w-[48%] bg-[#0d1b2a] relative overflow-hidden flex flex-col justify-between p-12 flex-shrink-0">
        <div className="absolute w-60 h-60 rounded-full top-8 -right-8 bg-[#162336]"/>
        <div className="absolute w-80 h-80 rounded-full -bottom-24 -left-24 bg-[#1a3a5c] opacity-50"/>
        <div className="relative z-10 font-bold text-white text-lg">ILT</div>
        <div className="relative z-10">
          <div className="inline-block border border-white/10 bg-white/5 rounded-full px-4 py-1 text-xs text-white/50 uppercase tracking-widest mb-5">
            Сэр сэр сэтгэ
          </div>
          <h1 className="font-black text-5xl leading-tight text-white mb-4">
            Манлайлагчийг<br/>бэлддэг<br/>
            <span className="text-[#f5a623]">платформ</span>
          </h1>
          <p className="text-white/40 text-sm leading-relaxed mb-8 max-w-sm">
            Ур чадвараа хөгжүүлж, карьераа урагшлуул.
          </p>
          <div className="flex gap-3">
            {[
              { n: "120+", l: "Суралцагч" },
              { n: "3", l: "Курс" },
              { n: "98%", l: "Ханамж" },
            ].map((s) => (
              <div key={s.l} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <div className="font-black text-xl text-[#f5a623]">{s.n}</div>
                <div className="text-xs text-white/40 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 flex gap-3 items-start">
          <div className="w-11 h-11 rounded-full bg-[#1d4a7a] flex items-center justify-center font-black text-[#5aa8e8] text-sm flex-shrink-0">МУ</div>
          <div>
            <div className="italic text-white/60 text-sm leading-relaxed mb-1">"Суралцах нь манлайлагч болох хамгийн чухал алхам юм."</div>
            <div className="text-xs text-white/25">Мэргэжлийн Удирдагч</div>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex-1 flex items-center justify-center p-12 bg-white overflow-y-auto">
        <div className="w-full max-w-sm">
          <h2 className="text-3xl font-serif text-[#0f1a2e] mb-1">Тавтай морил</h2>
          <p className="text-sm text-gray-500 mb-8">Амжилтын академ боловсролын тогтолцоо</p>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-7">
            {(['login', 'register'] as const).map((t) => (
              <button key={t} onClick={() => { setTab(t); setError(''); setMessage('') }}
                className={`px-5 py-2.5 text-sm border-b-2 -mb-px transition ${tab === t ? 'border-[#1d9e75] text-[#0f1a2e] font-medium' : 'border-transparent text-gray-400'}`}>
                {t === 'login' ? 'Нэвтрэх' : 'Бүртгүүлэх'}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          {/* Success */}
          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-4">
              {message}
            </div>
          )}

          {tab === 'register' && (
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Нэр</label>
              <input
                value={name} onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-[#1d9e75] placeholder:text-gray-400"
                placeholder="Таны нэр"/>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">И-мэйл</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-[#1d9e75] placeholder:text-gray-400"
              placeholder="name@example.com"/>
          </div>

          <div className="mb-2">
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Нууц үг</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-[#1d9e75] placeholder:text-gray-400"
              placeholder="••••••••"/>
          </div>

          {tab === 'login' && (
            <div className="flex justify-end mb-5">
              <button className="text-xs text-[#1d9e75] hover:underline">Нууц үгээ мартсан уу?</button>
            </div>
          )}

          <button
            onClick={tab === 'login' ? handleLogin : handleRegister}
            disabled={loading}
            className="w-full bg-[#0f1a2e] text-white rounded-lg py-3 text-sm font-medium hover:bg-[#1d9e75] transition mt-3 mb-4 disabled:opacity-50">
            {loading ? 'Түр хүлээнэ үү...' : tab === 'login' ? 'Нэвтрэх' : 'Бүртгүүлэх'}
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-100"/>
            <span className="text-xs text-gray-300 uppercase tracking-wider">эсвэл</span>
            <div className="flex-1 h-px bg-gray-100"/>
          </div>

          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-lg py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google-ээр {tab === 'login' ? 'нэвтрэх' : 'бүртгүүлэх'}
          </button>
        </div>
      </div>
    </div>
  )
}