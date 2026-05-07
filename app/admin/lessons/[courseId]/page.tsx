'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'

type Lesson = {
  id: string
  title: string
  description: string
  video_url: string
  pdf_url: string
  duration_minutes: number
  order_index: number
  is_free_preview: boolean
}

type Course = {
  id: string
  title: string
  thumbnail_emoji: string
}

export default function LessonsPage() {
  const { courseId } = useParams()
  const router = useRouter()
  const supabase = createClient()

  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    description: '',
    video_url: '',
    pdf_url: '',
    duration_minutes: 0,
    order_index: 0,
    is_free_preview: false,
  })

  useEffect(() => {
    checkAdmin()
    fetchCourse()
    fetchLessons()
  }, [courseId])

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== 'tugsuu2001@gmail.com') router.push('/')
  }

  async function fetchCourse() {
    const { data } = await supabase
      .from('courses')
      .select('id, title, thumbnail_emoji')
      .eq('id', courseId)
      .single()
    setCourse(data)
  }

  async function fetchLessons() {
    const { data } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index')
    setLessons(data || [])
    setLoading(false)
  }

  function resetForm() {
    setForm({
      title: '', description: '', video_url: '', pdf_url: '',
      duration_minutes: 0, order_index: lessons.length, is_free_preview: false,
    })
    setEditingId(null)
    setError('')
  }

  function openNew() {
    resetForm()
    setShowForm(true)
  }

  function openEdit(lesson: Lesson) {
    setForm({
      title: lesson.title,
      description: lesson.description || '',
      video_url: lesson.video_url || '',
      pdf_url: lesson.pdf_url || '',
      duration_minutes: lesson.duration_minutes,
      order_index: lesson.order_index,
      is_free_preview: lesson.is_free_preview,
    })
    setEditingId(lesson.id)
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.title) { setError('Нэр оруулна уу'); return }
    setSaving(true)
    setError('')

    const payload = { ...form, course_id: courseId }

    if (editingId) {
      const { error } = await supabase.from('lessons').update(form).eq('id', editingId)
      if (error) setError(error.message)
    } else {
      const { error } = await supabase.from('lessons').insert(payload)
      if (error) setError(error.message)
    }

    setSaving(false)
    setShowForm(false)
    fetchLessons()
  }

  async function handleDelete(id: string) {
    if (!confirm('Устгах уу?')) return
    await supabase.from('lessons').delete().eq('id', id)
    fetchLessons()
  }

  return (
    <main className="min-h-screen bg-[#f8f9fb]">
      {/* NAV */}
      <nav className="bg-[#0d1b2a] px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-black text-white text-lg">ILT</span>
          <span className="text-white/30 text-sm">/ Админ</span>
          {course && <span className="text-white/30 text-sm">/ {course.thumbnail_emoji} {course.title}</span>}
        </div>
        <a href="/admin" className="text-sm text-white/50 hover:text-white transition">
          ← Курс жагсаалт руу буцах
        </a>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-black text-2xl text-[#0f1a2e]">
              {course ? `${course.thumbnail_emoji} ${course.title}` : '...'} — Хичээлүүд
            </h1>
            <p className="text-sm text-gray-400 mt-1">{lessons.length} хичээл байна</p>
          </div>
          <button onClick={openNew}
            className="bg-[#0f1a2e] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#1d9e75] transition">
            + Шинэ хичээл
          </button>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-20">Ачааллаж байна...</div>
        ) : lessons.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🎬</div>
            <div className="text-gray-400 text-sm">Хичээл байхгүй байна. Шинэ хичээл нэмнэ үү!</div>
          </div>
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson, i) => (
              <div key={lesson.id} className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500 flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-[#0f1a2e]">{lesson.title}</span>
                    {lesson.is_free_preview && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Үнэгүй preview</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    {lesson.duration_minutes > 0 && <span>⏱ {lesson.duration_minutes} мин</span>}
                    {lesson.video_url && <span className="text-blue-400">🎬 Видео</span>}
                    {lesson.pdf_url && <span className="text-red-400">📄 PDF</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(lesson)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-[#0f1a2e] transition">
                    Засах
                  </button>
                  <button onClick={() => handleDelete(lesson.id)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-red-400 hover:border-red-300 hover:bg-red-50 transition">
                    Устгах
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-[#0f1a2e]">{editingId ? 'Хичээл засах' : 'Шинэ хичээл нэмэх'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2">{error}</div>}

              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Хичээлийн нэр *</label>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                  className="w-full px-3 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-[#1d9e75]"
                  placeholder="Жишээ: 1-р хичээл: Танилцуулга"/>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Тайлбар</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-[#1d9e75] resize-none"
                  placeholder="Хичээлийн товч тайлбар..."/>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                  🎬 Видео URL <span className="normal-case text-gray-300">(YouTube эсвэл бусад)</span>
                </label>
                <input value={form.video_url} onChange={e => setForm({...form, video_url: e.target.value})}
                  className="w-full px-3 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-[#1d9e75]"
                  placeholder="https://youtube.com/watch?v=..."/>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                  📄 PDF URL <span className="normal-case text-gray-300">(Google Drive эсвэл бусад)</span>
                </label>
                <input value={form.pdf_url} onChange={e => setForm({...form, pdf_url: e.target.value})}
                  className="w-full px-3 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-[#1d9e75]"
                  placeholder="https://drive.google.com/..."/>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Үргэлжлэх хугацаа (мин)</label>
                  <input type="number" value={form.duration_minutes} onChange={e => setForm({...form, duration_minutes: +e.target.value})}
                    className="w-full px-3 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-[#1d9e75]"/>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Дараалал</label>
                  <input type="number" value={form.order_index} onChange={e => setForm({...form, order_index: +e.target.value})}
                    className="w-full px-3 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-[#1d9e75]"/>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={() => setForm({...form, is_free_preview: !form.is_free_preview})}
                  className={`w-11 h-6 rounded-full transition relative ${form.is_free_preview ? 'bg-[#1d9e75]' : 'bg-gray-200'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.is_free_preview ? 'left-5' : 'left-0.5'}`}/>
                </button>
                <span className="text-sm text-gray-600">Үнэгүй preview (нэвтрэхгүйгээр үзэх боломжтой)</span>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowForm(false)}
                className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-2.5 text-sm hover:bg-gray-50 transition">
                Болих
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 bg-[#0f1a2e] text-white rounded-lg py-2.5 text-sm font-medium hover:bg-[#1d9e75] transition disabled:opacity-50">
                {saving ? 'Хадгалж байна...' : 'Хадгалах'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}