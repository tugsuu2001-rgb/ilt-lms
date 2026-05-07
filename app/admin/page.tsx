'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Course = {
  id: string
  title: string
  description: string
  price: number
  is_free: boolean
  thumbnail_emoji: string
  lesson_count: number
  duration_hours: number
  is_published: boolean
  order_index: number
}

const EMOJIS = ['📊', '🎯', '🌐', '🚀', '💡', '📈', '🏆', '🎓', '💼', '🔑']

export default function AdminPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: 0,
    is_free: false,
    thumbnail_emoji: '📚',
    lesson_count: 0,
    duration_hours: 0,
    is_published: false,
    order_index: 0,
  })
  const [error, setError] = useState('')

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    checkAdmin()
    fetchCourses()
  }, [])

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== 'tugsuu2001@gmail.com') {
      router.push('/')
    }
  }

  async function fetchCourses() {
    const { data } = await supabase
      .from('courses')
      .select('*')
      .order('order_index')
    setCourses(data || [])
    setLoading(false)
  }

  function resetForm() {
    setForm({
      title: '', description: '', price: 0, is_free: false,
      thumbnail_emoji: '📚', lesson_count: 0, duration_hours: 0,
      is_published: false, order_index: courses.length,
    })
    setEditingId(null)
    setError('')
  }

  function openNew() {
    resetForm()
    setShowForm(true)
  }

  function openEdit(course: Course) {
    setForm({
      title: course.title,
      description: course.description || '',
      price: course.price,
      is_free: course.is_free,
      thumbnail_emoji: course.thumbnail_emoji,
      lesson_count: course.lesson_count,
      duration_hours: course.duration_hours,
      is_published: course.is_published,
      order_index: course.order_index,
    })
    setEditingId(course.id)
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.title) { setError('Нэр оруулна уу'); return }
    setSaving(true)
    setError('')

    if (editingId) {
      const { error } = await supabase
        .from('courses')
        .update(form)
        .eq('id', editingId)
      if (error) setError(error.message)
    } else {
      const { error } = await supabase
        .from('courses')
        .insert(form)
      if (error) setError(error.message)
    }

    setSaving(false)
    setShowForm(false)
    fetchCourses()
  }

  async function handleDelete(id: string) {
    if (!confirm('Устгах уу?')) return
    await supabase.from('courses').delete().eq('id', id)
    fetchCourses()
  }

  async function togglePublish(course: Course) {
    await supabase
      .from('courses')
      .update({ is_published: !course.is_published })
      .eq('id', course.id)
    fetchCourses()
  }

  return (
    <main className="min-h-screen bg-[#f8f9fb]">
      {/* NAV */}
      <nav className="bg-[#0d1b2a] px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-black text-white text-lg">ILT</span>
          <span className="text-white/30 text-sm">/ Админ</span>
        </div>
        <a href="/dashboard" className="text-sm text-white/50 hover:text-white transition">
          ← Dashboard руу буцах
        </a>
      </nav>

      <div className="max-w-5xl mx-auto px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-black text-2xl text-[#0f1a2e]">Курс удирдлага</h1>
            <p className="text-sm text-gray-400 mt-1">{courses.length} курс байна</p>
          </div>
          <button
            onClick={openNew}
            className="bg-[#0f1a2e] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#1d9e75] transition">
            + Шинэ курс
          </button>
        </div>

        {/* Course list */}
        {loading ? (
          <div className="text-center text-gray-400 py-20">Ачааллаж байна...</div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📚</div>
            <div className="text-gray-400 text-sm">Курс байхгүй байна. Шинэ курс нэмнэ үү!</div>
          </div>
        ) : (
          <div className="space-y-3">
            {courses.map((course) => (
              <div key={course.id} className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
                <div className="text-3xl w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  {course.thumbnail_emoji}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-[#0f1a2e]">{course.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${course.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {course.is_published ? 'Нийтлэгдсэн' : 'Ноорог'}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${course.is_free ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                      {course.is_free ? 'Үнэгүй' : `₮${course.price.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {course.lesson_count} хичээл · {course.duration_hours} цаг
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => togglePublish(course)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition ${course.is_published ? 'border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500' : 'border-green-200 text-green-600 hover:bg-green-50'}`}>
                    {course.is_published ? 'Нуух' : 'Нийтлэх'}
                  </button>
                  <button
                    onClick={() => openEdit(course)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-[#0f1a2e] transition">
                    Засах
                  </button>
                  <button
                    onClick={() => handleDelete(course.id)}
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
              <h2 className="font-semibold text-[#0f1a2e]">{editingId ? 'Курс засах' : 'Шинэ курс нэмэх'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2">{error}</div>}

              {/* Emoji picker */}
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Emoji</label>
                <div className="flex gap-2 flex-wrap">
                  {EMOJIS.map(e => (
                    <button key={e} onClick={() => setForm({...form, thumbnail_emoji: e})}
                      className={`text-2xl w-10 h-10 rounded-lg border-2 transition ${form.thumbnail_emoji === e ? 'border-[#1d9e75] bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Курсын нэр *</label>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                  className="w-full px-3 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-[#1d9e75]"
                  placeholder="Жишээ: Манлайлал үндэс"/>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Тайлбар</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-[#1d9e75] resize-none"
                  placeholder="Курсын тайлбар..."/>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Хичээлийн тоо</label>
                  <input type="number" value={form.lesson_count} onChange={e => setForm({...form, lesson_count: +e.target.value})}
                    className="w-full px-3 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-[#1d9e75]"/>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Нийт цаг</label>
                  <input type="number" value={form.duration_hours} onChange={e => setForm({...form, duration_hours: +e.target.value})}
                    className="w-full px-3 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-[#1d9e75]"/>
                </div>
              </div>

              {/* Free toggle */}
              <div className="flex items-center gap-3">
                <button onClick={() => setForm({...form, is_free: !form.is_free})}
                  className={`w-11 h-6 rounded-full transition relative ${form.is_free ? 'bg-[#1d9e75]' : 'bg-gray-200'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.is_free ? 'left-5' : 'left-0.5'}`}/>
                </button>
                <span className="text-sm text-gray-600">Үнэгүй курс</span>
              </div>

              {!form.is_free && (
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Үнэ (₮)</label>
                  <input type="number" value={form.price} onChange={e => setForm({...form, price: +e.target.value})}
                    className="w-full px-3 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-[#1d9e75]"
                    placeholder="49000"/>
                </div>
              )}

              {/* Published toggle */}
              <div className="flex items-center gap-3">
                <button onClick={() => setForm({...form, is_published: !form.is_published})}
                  className={`w-11 h-6 rounded-full transition relative ${form.is_published ? 'bg-[#1d9e75]' : 'bg-gray-200'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.is_published ? 'left-5' : 'left-0.5'}`}/>
                </button>
                <span className="text-sm text-gray-600">Нийтлэх</span>
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