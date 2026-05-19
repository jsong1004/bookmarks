import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { DeleteButton } from './_components/DeleteButton'

export default async function DashboardPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('id, title, url, description, tags, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 헤더 */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">내 북마크</h1>
            <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
          </div>
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="text-sm font-medium text-gray-500 hover:text-gray-800 transition"
            >
              로그아웃
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* 새 북마크 추가 버튼 */}
        <div className="mb-6">
          <Link
            href="/dashboard/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 active:bg-blue-800 transition"
          >
            <span className="text-base leading-none">+</span>
            새 북마크 추가
          </Link>
        </div>

        {/* 북마크 목록 */}
        {!bookmarks || bookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-20 text-center">
            <p className="text-2xl mb-2">🔖</p>
            <p className="text-gray-500 font-medium">첫 북마크를 추가해보세요</p>
            <p className="text-sm text-gray-400 mt-1">
              관심 있는 링크를 저장하고 언제든지 꺼내보세요
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {bookmarks.map((bookmark) => (
              <li
                key={bookmark.id}
                className="bg-white rounded-xl border border-gray-200 px-5 py-4 shadow-sm hover:shadow-md transition"
              >
                {/* 제목 + 액션 */}
                <div className="flex items-start justify-between gap-4">
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-semibold text-blue-600 hover:underline leading-snug"
                  >
                    {bookmark.title}
                  </a>
                  <div className="flex items-center gap-3 shrink-0">
                    <Link
                      href={`/dashboard/${bookmark.id}/edit`}
                      className="text-xs font-medium text-gray-400 hover:text-gray-700 transition"
                    >
                      수정
                    </Link>
                    <DeleteButton id={bookmark.id} />
                  </div>
                </div>

                {/* URL */}
                <p className="mt-1 text-xs text-gray-400 truncate">{bookmark.url}</p>

                {/* 설명 */}
                {bookmark.description && (
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                    {bookmark.description}
                  </p>
                )}

                {/* 태그 */}
                {bookmark.tags && bookmark.tags.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {bookmark.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* 생성일 */}
                <p className="mt-3 text-xs text-gray-300">
                  {new Date(bookmark.created_at).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
