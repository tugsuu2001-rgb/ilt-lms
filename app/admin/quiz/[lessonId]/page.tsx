'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'

type Question = {
  id: string
  question: string
  options: string[]
  correct_answer: number
  order_index: number
}

type Quiz = {
  id: string
  title: string
  pass_score: number
}

export default function QuizAdminPage() {
  const { lessonId } = useParams()
  const router = useRouter()
  const supabase = createClient()

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [lessonTitle, setLessonTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showQuizForm, setShowQuizForm] = useState(false)
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [quizForm, setQuizForm] = useState({ title: '', pass_score: 70 })
  const [questionForm, setQuestionForm] = useState({
    question: '',
    options: ['', '', '', ''],
    correct_answer: 0,
    order_index: 0,
  })

  useEffect(() => {
    checkAdmin()
    fetchData()
  }, [lessonId])

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== 'tugsuu2001@gmail.com') router.push('/')
  }

  async function fetchData() {
    const lid = Array.isArray(lessonId) ? lessonId[0] : lessonId
    const { data: lesson } = await supabase
      .from('lessons').select('title').eq('id', lid).single()
    setLessonTitle(lesson?.title || '')

    const { data: quizData } = await supabase
      .from('quizzes').select('*').eq('lesson_id', lid).single()

    if (quizData) {
      setQuiz(quizData)
      setQuizForm({ title: quizData.title, pass_score: quizData.pass_score })
      const { data: qData } = await supabase
        .from('quiz_questions').select('*').eq('quiz_id', quizData.id).order('order_index')
      setQuestions(qData || [])
    }
    setLoading(false)
  }

  async function handleSaveQuiz() {
    if (!quizForm.title) { setError('Нэр оруулна уу'); return }
    setSaving(true)
    const lid = Array.isArray(lessonId) ? lessonId[0] : lessonId
    if (quiz) {
      await supabase.from('quizzes').update(quizForm).eq('id', quiz.id)
    } else {
      const { data } = await supabase.from('quizzes').insert({
        ...quizForm, lesson_id: lid,
      }).select().single()
      setQuiz(data)
    }
    setSaving(false)
    setShowQuizForm(false)
    fetchData()
  }

  function openNewQuestion() {
    setQuestionForm({ question: '', options: ['', '', '', ''], correct_answer: 0, order_index: questions.length })
    setEditingQuestionId(null)
    setError('')
    setShowQuestionForm(true)
  }

  function openEditQuestion(q: Question) {
    setQuestionForm({ question: q.question, options: q.options, correct_answer: q.correct_answer, order_index: q.order_index })
    setEditingQuestionId(q.id)
    setShowQuestionForm(true)
  }

  async function handleSaveQuestion() {
    if (!questionForm.question) { setError('Асуулт оруулна уу'); return }
    if (questionForm.options.some(o => !o)) { setError('Бүх хариултыг бөглөнө үү'); return }
    if (!quiz) { setError('Эхлээд quiz үүсгэнэ үү'); return }
    setSaving(true)
    setError('')
    if (editingQuestionId) {
      await supabase.from('quiz_questions').update(questionForm).eq('id', editingQuestionId)
    } else {
      await supabase.from('quiz_questions').insert({ ...questionForm, quiz_id: quiz.id })
    }
    setSaving(false)
    setShowQuestionForm(false)
    fetchData()
  }

  async function handleDeleteQuestion(id: string) {
    if (!confirm('Устгах уу?')) return
    await supabase.from('quiz_questions').delete().eq('id', id)
    fetchData()
  }

  return (
    <main className="min-h-screen bg-[#f8f9fb]">
      <nav className="bg-[#0d1b2a] px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-black text-white text-lg">ILT</span>
          <span className="text-white/30 text-sm">/ Админ / Quiz</span>
        </div>
        <button onClick={() => router.back()} className="text-sm text-white/50 hover:text-white transition">
          ← Буцах
        </button>
      </nav>

      <div className="max-w-3xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="font-black text-2xl text-[#0f1a2e]">Quiz удирдлага</h1>
          <p className="text-sm text-gray-400 mt-1">📖 {lessonTitle}</p>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-20">Ачааллаж байна...</div>
        ) : (
          <>
            <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[#0f1a2e]">
                    {quiz ? quiz.title : 'Quiz үүсгэгдээгүй байна'}
                  </div>
                  {quiz && (
                    <div className="text-xs text-gray-400 mt-1">
                      Тэнцэх оноо: {quiz.pass_score}% · {questions.length} асуулт
                    </div>
                  )}
                </div>
                <button onClick={() => setShowQuizForm(true)}
                  className="bg-[#0f1a2e] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#1d9e75] transition">
                  {quiz ? 'Засах' : '+ Quiz үүсгэх'}
                </button>
              </div>
            </div>

            {quiz && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-lg text-[#0f1a2e]">Асуултууд</h2>
                  <button onClick={openNewQuestion}
                    className="bg-[#0f1a2e] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#1d9e75] transition">
                    + Асуулт нэмэх
                  </button>
                </div>

                {questions.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <div className="text-4xl mb-3">❓</div>
                    <div className="text-sm">Асуулт байхгүй байна</div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {questions.map((q, i) => (
                      <div key={q.id} className="bg-white border border-gray-200 rounded-xl p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="font-medium text-[#0f1a2e] mb-3">{i + 1}. {q.question}</div>
                            <div className="grid grid-cols-2 gap-2">
                              {q.options.map((opt, idx) => (
                                <div key={idx} className={`text-xs px-3 py-2 rounded-lg border ${idx === q.correct_answer ? 'bg-green-50 border-green-200 text-green-700 font-medium' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                                  {idx === q.correct_answer ? '✓ ' : ''}{opt}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <button onClick={() => openEditQuestion(q)}
                              className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-[#0f1a2e] transition">
                              Засах
                            </button>
                            <button onClick={() => handleDeleteQuestion(q.id)}
                              className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-red-400 hover:bg-red-50 transition">
                              Устгах
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Quiz modal */}
      {showQuizForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-[#0f1a2e]">{quiz ? 'Quiz засах' : 'Quiz үүсгэх'}</h2>
              <button onClick={() => setShowQuizForm(false)} className="text-gray-400 text-xl">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2">{error}</div>}
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Quiz нэр</label>
                <input value={quizForm.title} onChange={e => setQuizForm({...quizForm, title: e.target.value})}
                  className="w-full px-3 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-[#1d9e75]"
                  placeholder="Жишээ: 1-р хичээлийн шалгалт"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Тэнцэх оноо (%)</label>
                <input type="number" value={quizForm.pass_score} onChange={e => setQuizForm({...quizForm, pass_score: +e.target.value})}
                  className="w-full px-3 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-[#1d9e75]"
                  min={0} max={100}/>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowQuizForm(false)}
                className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-2.5 text-sm hover:bg-gray-50">
                Болих
              </button>
              <button onClick={handleSaveQuiz} disabled={saving}
                className="flex-1 bg-[#0f1a2e] text-white rounded-lg py-2.5 text-sm font-medium hover:bg-[#1d9e75] disabled:opacity-50">
                {saving ? 'Хадгалж байна...' : 'Хадгалах'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Question modal */}
      {showQuestionForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-[#0f1a2e]">{editingQuestionId ? 'Асуулт засах' : 'Асуулт нэмэх'}</h2>
              <button onClick={() => setShowQuestionForm(false)} className="text-gray-400 text-xl">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2">{error}</div>}
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Асуулт</label>
                <textarea value={questionForm.question} onChange={e => setQuestionForm({...questionForm, question: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-[#1d9e75] resize-none"
                  placeholder="Асуултаа бичнэ үү..."/>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                  Хариултууд <span className="normal-case text-gray-300">(зөв хариултыг сонгоно уу)</span>
                </label>
                <div className="space-y-2">
                  {questionForm.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <button onClick={() => setQuestionForm({...questionForm, correct_answer: idx})}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${questionForm.correct_answer === idx ? 'border-[#1d9e75] bg-[#1d9e75]' : 'border-gray-300'}`}>
                        {questionForm.correct_answer === idx && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                        )}
                      </button>
                      <input value={opt}
                        onChange={e => {
                          const opts = [...questionForm.options]
                          opts[idx] = e.target.value
                          setQuestionForm({...questionForm, options: opts})
                        }}
                        className="flex-1 px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-[#1d9e75]"
                        placeholder={`${idx + 1}-р хариулт`}/>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowQuestionForm(false)}
                className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-2.5 text-sm hover:bg-gray-50">
                Болих
              </button>
              <button onClick={handleSaveQuestion} disabled={saving}
                className="flex-1 bg-[#0f1a2e] text-white rounded-lg py-2.5 text-sm font-medium hover:bg-[#1d9e75] disabled:opacity-50">
                {saving ? 'Хадгалж байна...' : 'Хадгалах'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}