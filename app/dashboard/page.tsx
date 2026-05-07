import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  return (
    <main className="min-h-screen bg-[#f8f9fb]">
      <nav className="bg-white border-b border-gray-200 px-16 h-16 flex items-center justify-between">
        <div className="font-black text-xl text-[#0f1a2e]">ILT</div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{user.email}</span>
          <form action="/auth/signout" method="post">
            <button className="text-sm text-red-500 hover:underline">Гарах</button>
          </form>
        </div>
      </nav>
      <section className="max-w-6xl mx-auto px-8 py-12">
        <h1 className="font-black text-3xl text-[#0f1a2e] mb-2">Сайн байна уу! 👋</h1>
        <p className="text-gray-500 mb-10">Өнөөдөр юу сурах вэ?</p>
        <div className="grid grid-cols-3 gap-5">
          {[
            { icon: "📊", name: "Манлайлал үндэс", lessons: "12 хичээл", hours: "6 цаг", price: "Үнэгүй", bg: "bg-amber-50", progress: 0 },
            { icon: "🎯", name: "Стратегийн сэтгэлгээ", lessons: "8 хичээл", hours: "4 цаг", price: "₮49,000", bg: "bg-green-50", progress: 0 },
            { icon: "🌐", name: "Олон улсын харилцаа", lessons: "10 хичээл", hours: "5 цаг", price: "₮69,000", bg: "bg-blue-50", progress: 0 },
          ].map((c) => (
            <div key={c.name} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition cursor-pointer">
              <div className={`h-40 ${c.bg} flex items-center justify-center text-5xl`}>{c.icon}</div>
              <div className="p-5">
                <div className="font-semibold text-[#0f1a2e] mb-1">{c.name}</div>
                <div className="text-xs text-gray-400 mb-3">{c.lessons} · {c.hours}</div>
                <div className="h-1.5 bg-gray-100 rounded-full mb-3">
                  <div className="h-full bg-[#1d9e75] rounded-full" style={{ width: `${c.progress}%` }}/>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#1d9e75]">{c.price}</span>
                  <button className="bg-[#0f1a2e] text-white text-xs px-3 py-1.5 rounded-lg hover:bg-[#1d9e75] transition">
                    Эхлэх
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}