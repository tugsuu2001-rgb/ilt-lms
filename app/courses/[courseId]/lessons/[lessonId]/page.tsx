import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

function getYoutubeEmbedUrl(url: string) {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
  if (match) return `https://www.youtube.com/embed/${match[1]}`
  return url
}

export default async function LessonPage({
  params
}: {
  params: Promise<{ courseId: string; lessonId: string }>
}) {
  const { courseId, lessonId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: lesson } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .single()

  const { data: lessons } = await supabase
    .from('lessons')
    .select('*')
    .eq('course_id', courseId)
    .order('order_index')

  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single()

  if (!lesson || !course) redirect('/dashboard')

  const currentIndex = lessons?.findIndex(l => l.id === lessonId) ?? 0
  const prevLesson = lessons?.[currentIndex - 1]
  const nextLesson = lessons?.[currentIndex + 1]
  const embedUrl = getYoutubeEmbedUrl(lesson.video_url)

  return (
    <main className="min-h-screen bg-[#f8f9fb]">
      <nav className="bg-white border-b border-gray-200 px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-black text-xl text-[#0f1a2e]">ILT</span>
          <span className="text-gray-300">/</span>
          <a href={`/courses/${courseId}`} className="text-sm text-gray-500 hover:text-[#0f1a2e]">
            {course.thumbnail_emoji} {course.title}
          </a>
        </div>
        <span className="text-sm text-gray-400">{currentIndex + 1} / {lessons?.length}</span>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-8 flex gap-8">
        {/* Main content */}
        <div className="flex-1">
          {/* Video */}
          {embedUrl && (
            <div className="bg-black rounded-2xl overflow-hidden mb-6 aspect-video">
              <iframe
                src={embedUrl}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          )}

          {/* Lesson info */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
            <h1 className="font-black text-2xl text-[#0f1a2e] mb-2">{lesson.title}</h1>
            {lesson.description && (
              <p className="text-gray-500 text-sm leading-relaxed">{lesson.description}</p>
            )}
            {lesson.duration_minutes > 0 && (
              <div className="text-xs text-gray-400 mt-3">⏱ {lesson.duration_minutes} минут</div>
            )}
          </div>

          {/* PDF */}
          {lesson.pdf_url && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📄</span>
                  <div>
                    <div className="font-medium text-[#0f1a2e] text-sm">Хичээлийн материал</div>
                    <div className="text-xs text-gray-400">PDF файл</div>
                  </div>
                </div>
                <a href={lesson.pdf_url} target="_blank" rel="noopener noreferrer"
                  className="bg-[#0f1a2e] text-white text-xs px-4 py-2 rounded-lg hover:bg-[#1d9e75] transition">
                  Татах / Үзэх
                </a>
              </div>
            </div>
          )}

          {/* Prev / Next */}
          <div className="flex gap-3">
            {prevLesson ? (
              <a href={`/courses/${courseId}/lessons/${prevLesson.id}`}
                className="flex-1 bg-white border border-gray-200 rounded-xl p-4 hover:border-[#0f1a2e] transition">
                <div className="text-xs text-gray-400 mb-1">← Өмнөх</div>
                <div className="text-sm font-medium text-[#0f1a2e]">{prevLesson.title}</div>
              </a>
            ) : <div className="flex-1"/>}
            {nextLesson ? (
              <a href={`/courses/${courseId}/lessons/${nextLesson.id}`}
                className="flex-1 bg-white border border-gray-200 rounded-xl p-4 hover:border-[#1d9e75] transition text-right">
                <div className="text-xs text-gray-400 mb-1">Дараах →</div>
                <div className="text-sm font-medium text-[#0f1a2e]">{nextLesson.title}</div>
              </a>
            ) : <div className="flex-1"/>}
          </div>
        </div>

        {/* Sidebar — хичээлийн жагсаалт */}
        <div className="w-72 flex-shrink-0">
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="font-semibold text-sm text-[#0f1a2e]">Хичээлүүд</div>
            </div>
            <div className="divide-y divide-gray-100">
              {lessons?.map((l, i) => (
                <a key={l.id} href={`/courses/${courseId}/lessons/${l.id}`}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition ${l.id === lessonId ? 'bg-green-50 border-l-2 border-[#1d9e75]' : ''}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${l.id === lessonId ? 'bg-[#1d9e75] text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm truncate ${l.id === lessonId ? 'font-semibold text-[#0f1a2e]' : 'text-gray-600'}`}>
                      {l.title}
                    </div>
                    {l.duration_minutes > 0 && (
                      <div className="text-xs text-gray-400">{l.duration_minutes} мин</div>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}