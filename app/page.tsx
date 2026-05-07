export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8f9fb]">
      {/* NAV */}
      <nav className="bg-white border-b border-gray-200 px-16 h-16 flex items-center justify-between sticky top-0 z-50">
        <div className="font-black text-xl text-[#0f1a2e]">ILT</div>
        <div className="flex gap-3">
          <a href="/auth" className="border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-700 hover:border-[#0f1a2e] transition">
            Нэвтрэх
          </a>
          <a href="/auth" className="bg-[#0f1a2e] text-white rounded-lg px-4 py-2 text-sm hover:bg-[#1d9e75] transition">
            Бүртгүүлэх
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-8 py-20 flex items-center gap-16">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1 text-xs text-gray-500 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#1d9e75] inline-block"/>
            International Leaders Team
          </div>
          <h1 className="font-black text-5xl leading-tight text-[#0f1a2e] mb-5">
            Манлайлагчийг<br/>бэлддэг<br/>
            <span className="text-[#f5a623]">платформ</span>
          </h1>
          <p className="text-gray-500 text-base leading-relaxed mb-8 max-w-md">
            Ур чадвараа хөгжүүлж, карьераа урагшлуул. Мэргэжлийн хичээлүүдийг онлайнаар үзэж суралцаарай.
          </p>
          <div className="flex gap-3">
            <a href="/auth" className="bg-[#0f1a2e] text-white rounded-xl px-7 py-3 text-sm font-medium hover:bg-[#1d9e75] transition">
              Нэвтрэн орох →
            </a>
            <button className="bg-white border border-gray-200 text-[#0f1a2e] rounded-xl px-6 py-3 text-sm hover:border-[#0f1a2e] transition">
              Дэлгэрэнгүй
            </button>
          </div>
        </div>

        {/* Mini card */}
        <div className="flex-1 flex justify-center">
          <div className="bg-white border border-gray-200 rounded-2xl p-7 w-80 shadow-sm">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Хичээлүүд</div>
            {[
              { icon: "📊", name: "Манлайлал үндэс", lessons: "12 хичээл", progress: 70 },
              { icon: "🎯", name: "Стратегийн сэтгэлгээ", lessons: "8 хичээл", progress: 40 },
              { icon: "🌐", name: "Олон улсын харилцаа", lessons: "10 хичээл", progress: 20 },
            ].map((c) => (
              <div key={c.name} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-lg flex-shrink-0">{c.icon}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-[#0f1a2e]">{c.name}</div>
                  <div className="text-xs text-gray-400 mb-1">{c.lessons}</div>
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#1d9e75] rounded-full" style={{ width: `${c.progress}%` }}/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="bg-[#0d1b2a] py-10">
        <div className="max-w-6xl mx-auto flex justify-around">
          {[
            { n: "120+", l: "Идэвхтэй суралцагч" },
            { n: "3", l: "Мэргэжлийн курс" },
            { n: "98%", l: "Сэтгэл ханамж" },
            { n: "24/7", l: "Хүртээмжтэй" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <div className="font-black text-4xl text-[#f5a623]">{s.n}</div>
              <div className="text-xs text-white/40 mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* COURSES LOCKED */}
      <section className="max-w-6xl mx-auto px-8 py-16">
        <div className="mb-6">
          <div className="font-black text-3xl text-[#0f1a2e]">Курсууд</div>
          <div className="text-sm text-gray-400 mt-1">Нэвтэрч орсноор бүх курс харагдана</div>
        </div>
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800 mb-7">
          🔒 Курсуудыг үзэхийн тулд нэвтрэн орно уу
          <a href="/auth" className="ml-auto bg-[#0f1a2e] text-white rounded-lg px-4 py-1.5 text-xs hover:bg-[#1d9e75] transition">
            Нэвтрэх
          </a>
        </div>
        <div className="grid grid-cols-3 gap-5">
          {[
            { icon: "📊", name: "Манлайлал үндэс", lessons: "12 хичээл", hours: "6 цаг", price: "Үнэгүй", bg: "bg-amber-50" },
            { icon: "🎯", name: "Стратегийн сэтгэлгээ", lessons: "8 хичээл", hours: "4 цаг", price: "₮49,000", bg: "bg-green-50" },
            { icon: "🌐", name: "Олон улсын харилцаа", lessons: "10 хичээл", hours: "5 цаг", price: "₮69,000", bg: "bg-blue-50" },
          ].map((c) => (
            <div key={c.name} className="bg-white border border-gray-200 rounded-2xl overflow-hidden relative">
              <div className="blur-sm pointer-events-none select-none">
                <div className={`h-40 ${c.bg} flex items-center justify-center text-5xl`}>{c.icon}</div>
                <div className="p-4">
                  <div className="font-semibold text-[#0f1a2e] mb-1">{c.name}</div>
                  <div className="text-xs text-gray-400">{c.lessons} · {c.hours}</div>
                  <div className="text-sm font-semibold text-[#1d9e75] mt-2">{c.price}</div>
                </div>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/50">
                <div className="text-2xl">🔒</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-[#0d1b2a] py-8 text-center">
        <p className="text-xs text-white/30">© 2026 International Leaders Team. Бүх эрх хуулиар хамгаалагдсан.</p>
      </footer>
    </main>
  )
}