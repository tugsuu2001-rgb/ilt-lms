import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .eq('is_published', true)
    .order('order_index')

  return (
    <main className="min-h-screen bg-[#f8f9fb]">
      <nav className="bg-white border-b border-gray-200 px-16 h-16 flex items-center justify-between">
        <div className="font-black text-xl text-[#0f1a2e]">ILT</div>
        <div className="flex items-center gap-4">
          {user.email === 'tugsuu2001@gmail.com' && (
            <a href="/admin" className="text-xs bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg hover:bg-amber-200 transition">
              ⚙️ Админ
            </a>
          )}
          <span className="text-sm text-gray-500">{user.email}</span>
          <form action="/auth/signout" method="post">
            <button className="text-sm text-red-500 hover:underline">Гарах</button>
          </form>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-8 py-12">
        <h1 className="font-black text-3xl text-[#0f1a2e] mb-2">Сайн байна уу! 👋</h1>
        <p className="text-gray-500 mb-10">Өнөөдөр юу сурах вэ?</p>

        {!courses || courses.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">📚</div>
            <div>Одоогоор курс байхгүй байна</div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-5">
            {courses.map((course) => (
              <div key={course.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition cursor-pointer">
                <div className="h-40 bg-amber-50 flex items-center justify-center text-6xl">
                  {course.thumbnail_emoji}
                </div>
                <div className="p-5">
                  <div className="font-semibold text-[#0f1a2e] mb-1">{course.title}</div>
                  {course.description && (
                    <div className="text-xs text-gray-400 mb-2 line-clamp-2">{course.description}</div>
                  )}
                  <div className="text-xs text-gray-400 mb-3">
                    {course.lesson_count} хичээл · {course.duration_hours} цаг
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full mb-3">
                    <div className="h-full bg-[#1d9e75] rounded-full w-0"/>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#1d9e75]">
                      {course.is_free ? 'Үнэгүй' : `₮${course.price.toLocaleString()}`}
                    </span>
                      <button className="bg-[#0f1a2e] text-white text-xs px-3 py-1.5 rounded-lg hover:bg-[#1d9e75] transition">
                      Эхлэх
                     </button>
					 
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}