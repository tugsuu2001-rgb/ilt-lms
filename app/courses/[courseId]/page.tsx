import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single()

  const { data: lessons } = await supabase
    .from('lessons')
    .select('*')
    .eq('course_id', courseId)
    .order('order_index')

  if (!course) redirect('/dashboard')

  return (
    <main className="min-h-screen bg-[#f8f9fb]">
      <nav className="bg-white border-b border-gray-200 px-16 h-16 flex items-center justify-between">
        <div className="font-black text-xl text-[#0f1a2e]">ILT</div>
        <a href="/dashboard" className="text-sm text-gray-500 hover:text-[#0f1a2e] transition">
          ← Dashboard руу буцах
        </a>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-10">
        <div className="bg-[#0d1b2a] rounded-2xl p-8 mb-8 flex items-center gap-6">
          <div className="text-6xl">{course.thumbnail_emoji}</div>
          <div>
            <h1 className="font-black text-2xl text-white mb-2">{course.title}</h1>
            {course.description && <p className="text-white/50 text-sm mb-3">{course.description}</p>}
            <div className="flex gap-4 text-xs text-white/40">
              <span>📚 {course.lesson_count} хичээл</span>
              <span>⏱ {course.duration_hours} цаг</span>
              <span className={course.is_free ? 'text-green-400' : 'text-amber-400'}>
                {course.is_free ? '✓ Үнэгүй' : `₮${course.price.toLocaleString()}`}
              </span>
            </div>
          </div>
        </div>

        <h2 className="font-black text-xl text-[#0f1a2e] mb-4">Хичээлүүд</h2>
        <div className="space-y-3">
          {lessons?.map((lesson, i) => (
            <a key={lesson.id} href={`/courses/${courseId}/lessons/${lesson.id}`}
              className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 hover:border-[#1d9e75] hover:shadow-sm transition block">
              <div className="w-9 h-9 rounded-full bg-[#0d1b2a] flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="font-medium text-[#0f1a2e] mb-1">{lesson.title}</div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  {lesson.duration_minutes > 0 && <span>⏱ {lesson.duration_minutes} мин</span>}
                  {lesson.video_url && <span className="text-blue-400">🎬 Видео</span>}
                  {lesson.pdf_url && <span className="text-red-400">📄 PDF</span>}
                </div>
              </div>
              {lesson.is_free_preview && (
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Үнэгүй</span>
              )}
              <span className="text-gray-300">›</span>
            </a>
          ))}
        </div>
      </div>
    </main>
  )
}