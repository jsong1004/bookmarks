'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { createBookmark } from '../actions'

export default function NewBookmarkPage() {
  const [pending, startTransition] = useTransition()
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [urlError, setUrlError] = useState<string | null>(null)

  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')

  function validateUrl(value: string) {
    if (!value) return '필수 항목입니다.'
    if (!value.startsWith('https://')) return 'https://로 시작해야 합니다.'
    return null
  }

  async function handleGenerate() {
    const urlErr = validateUrl(url)
    if (urlErr) { setUrlError(urlErr); return }

    setGenerating(true)
    setError(null)
    try {
      const res = await fetch('/api/generate-bookmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      if (data.title) setTitle(data.title)
      if (data.description) setDescription(data.description)
      if (data.tags) setTags(data.tags)
    } catch {
      setError('AI 생성 중 오류가 발생했습니다.')
    } finally {
      setGenerating(false)
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const urlErr = validateUrl(url)
    if (urlErr) { setUrlError(urlErr); return }
    setError(null)

    const formData = new FormData()
    formData.set('url', url)
    formData.set('title', title)
    formData.set('description', description)
    formData.set('tags', tags)

    startTransition(async () => {
      const result = await createBookmark(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-700 transition text-lg leading-none">
            ←
          </Link>
          <h1 className="text-xl font-bold text-gray-900">새 북마크 추가</h1>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* URL + AI 생성 버튼 */}
            <div className="flex flex-col gap-1">
              <label htmlFor="url" className="text-sm font-medium text-gray-700">
                URL <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  id="url"
                  type="url"
                  required
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setUrlError(null) }}
                  onBlur={() => setUrlError(validateUrl(url))}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 ${
                    urlError
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={generating || !url}
                  className="shrink-0 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-100 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {generating ? (
                    <>
                      <span className="inline-block w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                      생성 중…
                    </>
                  ) : (
                    <>✦ AI 자동 생성</>
                  )}
                </button>
              </div>
              {urlError && <p className="text-xs text-red-500">{urlError}</p>}
              <p className="text-xs text-gray-400">URL 입력 후 AI 자동 생성을 누르거나 직접 아래 항목을 입력하세요</p>
            </div>

            {/* 제목 */}
            <div className="flex flex-col gap-1">
              <label htmlFor="title" className="text-sm font-medium text-gray-700">
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                required
                placeholder="페이지 제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            {/* 설명 */}
            <div className="flex flex-col gap-1">
              <label htmlFor="description" className="text-sm font-medium text-gray-700">
                설명
                <span className="ml-1 text-xs font-normal text-gray-400">(선택)</span>
              </label>
              <textarea
                id="description"
                rows={3}
                placeholder="이 링크에 대한 간단한 메모를 남겨보세요"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition resize-none"
              />
            </div>

            {/* 태그 */}
            <div className="flex flex-col gap-1">
              <label htmlFor="tags" className="text-sm font-medium text-gray-700">
                태그
                <span className="ml-1 text-xs font-normal text-gray-400">(선택, 쉼표로 구분)</span>
              </label>
              <input
                id="tags"
                type="text"
                placeholder="예: 디자인, 개발, 참고자료"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            {/* 에러 */}
            {error && (
              <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            {/* 버튼 */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={pending}
                className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 active:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pending ? '저장 중…' : '저장'}
              </button>
              <Link
                href="/dashboard"
                className="flex-1 rounded-lg border border-gray-300 py-2 text-center text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                취소
              </Link>
            </div>

          </form>
        </div>
      </main>
    </div>
  )
}
