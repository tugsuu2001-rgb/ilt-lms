'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Props = {
  lessonId: string
  courseId: string
  nextLessonId?: string
  userId: string
  isCompleted: boolean
}

export default function CompleteButton({ lessonId, courseId, nextLessonId, userId, isCompleted }: Props) {
  const [completed, setCompleted] = useState(isCompleted)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function handleComplete() {
    setLoading(true)

    if (!completed) {
      await supabase.from('lesson_progress').upsert({
        user_id: userId,
        lesson_id: lessonId,
        course_id: courseId,
      })
      setCompleted(true)
    }

    if (nextLessonId) {
      router.push(`/courses/${courseId}/lessons/${nextLessonId}`)
    } else {
      router.push(`/courses/${courseId}`)
    }

    setLoading(false)
  }

  return (
    <button
      onClick={handleComplete}
      disabled={loading}
      className={`px-8 py-2.5 rounded-full text-sm font-medium transition flex items-center gap-2 disabled:opacity-50
        ${completed ? 'bg-[#1d9e75] text-white hover:bg-green-700' : 'bg-[#0f1a2e] text-white hover:bg-[#1d9e75]'}`}>
      {loading ? 'Хадгалж байна...' : completed ? '✓ COMPLETE & CONTINUE →' : 'COMPLETE & CONTINUE →'}
    </button>
  )
}