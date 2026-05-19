'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { createBookmark } from '../actions'

export default function NewBookmarkPage() {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [urlError, setUrlError] = useState<string | null>(null)

  function validateUrl(value: string) {
    if (!value) return '필수 항목입니다.'
    if (!value.startsWith('https://')) return 'https://로 시작해야 합니다.'
    return null
  }

  function handleUrlBlur(e: React.FocusEvent<HTMLInputElement>) {
    setUrlError(validateUrl(e.target.value))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const urlVal = (formData.get('url') as string).trim()

    const urlErr = validateUrl(urlVal)
    if (urlErr) {
      setUrlError(urlErr)
      return
    }

    setError(null)
    startTransition(async () => {
      const result = await createBookmark(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-gray-400 hover:text-gray-700 transition text-lg leading-none"
            aria-label="뒤로가기"
          >
            ←
          </Link>
          <h1 className="text-xl font-bold text-gray-900">새 북마크 추가</h1>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* URL */}
            <div className="flex flex-col gap-1">
              <label htmlFor="url" className="text-sm font-medium text-gray-700">
                URL <span className="text-red-500">*</span>
              </label>
              <input
                id="url"
                name="url"
                type="url"
                required
                placeholder="https://example.com"
                onBlur={handleUrlBlur}
                onChange={() => setUrlError(null)}
                className={`rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 ${
                  urlError
                    ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
                }`}
              />
              {urlError && (
                <p className="text-xs text-red-500">{urlError}</p>
              )}
            </div>

            {/* 제목 */}
            <div className="flex flex-col gap-1">
              <label htmlFor="title" className="text-sm font-medium text-gray-700">
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                placeholder="페이지 제목을 입력하세요"
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
                name="description"
                rows={3}
                placeholder="이 링크에 대한 간단한 메모를 남겨보세요"
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
                name="tags"
                type="text"
                placeholder="예: 디자인, 개발, 참고자료"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            {/* 서버 에러 */}
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
