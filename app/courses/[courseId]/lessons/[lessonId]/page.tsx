import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CompleteButton from './CompleteButton'

function getYoutubeEmbedUrl(url: string) {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
  if (match) return `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1`
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

  const { data: completedLessons } = await supabase
    .from('lesson_progress')
    .select('lesson_id')
    .eq('user_id', user.id)
    .eq('course_id', courseId)

  const { data: progressData } = await supabase
    .from('lesson_progress')
    .select('id')
    .eq('user_id', user.id)
    .eq('lesson_id', lessonId)
    .single()

  const completedIds = new Set(completedLessons?.map(p => p.lesson_id) || [])
  const isCompleted = !!progressData
  const currentIndex = lessons?.findIndex(l => l.id === lessonId) ?? 0
  const nextLesson = lessons?.[currentIndex + 1]
  const totalLessons = lessons?.length ?? 0
  const progress = totalLessons > 0 ? Math.round((completedIds.size / totalLessons) * 100) : 0
  const embedUrl = getYoutubeEmbedUrl(lesson.video_url)

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* SIDEBAR */}
      <div className="w-72 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col h-full">
        <div className="p-4 border-b border-gray-200">
          <a href="/dashboard" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mb-3">
            ← Dashboard руу буцах
          </a>
          <div className="font-black text-sm text-[#0f1a2e] leading-tight mb-2">
            {course.thumbnail_emoji} {course.title}
          </div>
          <div className="text-xs text-gray-400 mb-1">{progress}% complete</div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#1d9e75] rounded-full transition-all" style={{ width: `${progress}%` }}/>
          </div>
        </div>

        <div className="px-3 py-2 border-b border-gray-100">
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5">
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <span className="text-xs text-gray-400">Search by lesson title</span>
          </div>
        </div>

        <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${completedIds.size === totalLessons && totalLessons > 0 ? 'border-[#1d9e75] bg-[#1d9e75]' : 'border-gray-300'}`}>
              {completedIds.size === totalLessons && totalLessons > 0 && (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              )}
            </div>
            <span className="font-semibold text-xs text-[#0f1a2e]">{course.title}</span>
          </div>
          <span className="text-xs text-gray-400">{completedIds.size}/{totalLessons}</span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {lessons?.map((l, i) => (
            <a key={l.id} href={`/courses/${courseId}/lessons/${l.id}`}
              className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition border-b border-gray-50 ${l.id === lessonId ? 'bg-blue-50' : ''}`}>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5
                ${completedIds.has(l.id) ? 'border-[#1d9e75] bg-[#1d9e75]' :
                  l.id === lessonId ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                {completedIds.has(l.id) ? (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-white"/>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-xs leading-tight mb-0.5 ${l.id === lessonId ? 'font-semibold text-[#0f1a2e]' : 'text-gray-600'}`}>
                  {l.title}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  {l.video_url && <span>🎬 VIDEO</span>}
                  {l.pdf_url && <span>📄 PDF</span>}
                  {l.duration_minutes > 0 && <span>· {l.duration_minutes} МИН</span>}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-12 border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
          <span className="font-semibold text-sm text-[#0f1a2e]">{lesson.title}</span>
          {lesson.pdf_url && (
            <a href={lesson.pdf_url} target="_blank" rel="noopener noreferrer"
              className="text-xs text-gray-500 hover:text-[#0f1a2e] flex items-center gap-1">
              📄 Материал татах
            </a>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {embedUrl ? (
            <div className="bg-black w-full max-h-[75vh]" style={{ aspectRatio: '16/9' }}>
              <iframe
                src={embedUrl}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          ) : (
            <div className="bg-gray-100 w-full flex items-center justify-center max-h-[70vh]" style={{ aspectRatio: '16/9' }}>
              <span className="text-gray-400 text-sm">Видео байхгүй байна</span>
            </div>
          )}

          {lesson.description && (
            <div className="px-8 py-6 max-w-4xl">
              <h2 className="font-bold text-lg text-[#0f1a2e] mb-2">{lesson.title}</h2>
              <p className="text-gray-500 text-sm leading-relaxed">{lesson.description}</p>
            </div>
          )}
        </div>

        <div className="h-14 border-t border-gray-200 flex items-center justify-center flex-shrink-0 bg-white">
          <CompleteButton
            lessonId={lessonId}
            courseId={courseId}
            nextLessonId={nextLesson?.id}
            userId={user.id}
            isCompleted={isCompleted}
          />
        </div>
      </div>
    </div>
  )
}