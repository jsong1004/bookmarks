import Anthropic from '@anthropic-ai/sdk'
import { NextResponse, type NextRequest } from 'next/server'

const client = new Anthropic()

export async function POST(request: NextRequest) {
  const { url } = await request.json()
  if (!url?.startsWith('https://')) {
    return NextResponse.json({ error: '유효한 URL이 아닙니다.' }, { status: 400 })
  }

  // 페이지 메타 정보 수집
  let pageSummary = `URL: ${url}`
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BookmarkBot/1.0)' },
    })
    const html = await res.text()

    const get = (pattern: RegExp) => pattern.exec(html)?.[1]?.trim() ?? ''

    const title =
      get(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i) ||
      get(/<meta[^>]+content="([^"]+)"[^>]+property="og:title"/i) ||
      get(/<title[^>]*>([^<]+)<\/title>/i)

    const description =
      get(/<meta[^>]+property="og:description"[^>]+content="([^"]+)"/i) ||
      get(/<meta[^>]+content="([^"]+)"[^>]+property="og:description"/i) ||
      get(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i) ||
      get(/<meta[^>]+content="([^"]+)"[^>]+name="description"/i)

    if (title) pageSummary += `\n페이지 제목: ${title}`
    if (description) pageSummary += `\n페이지 설명: ${description}`
  } catch {
    // 접근 불가 URL은 URL 자체만으로 생성
  }

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: `다음 웹페이지 정보를 분석해서 북마크 제목, 설명, 태그를 한국어로 생성해줘.

${pageSummary}

규칙:
- title: 간결하고 명확하게 (50자 이내)
- description: 핵심 내용 요약 (80자 이내), 없으면 빈 문자열
- tags: 관련 키워드 배열, 최대 5개, 한국어

JSON만 출력 (설명 없이):
{"title":"...","description":"...","tags":["..."]}`,
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  try {
    const match = text.match(/\{[\s\S]*\}/)
    const parsed = JSON.parse(match?.[0] ?? '{}')
    return NextResponse.json({
      title: parsed.title ?? '',
      description: parsed.description ?? '',
      tags: Array.isArray(parsed.tags) ? parsed.tags.join(', ') : '',
    })
  } catch {
    return NextResponse.json(
      { error: 'AI 응답을 파싱하지 못했습니다.' },
      { status: 500 }
    )
  }
}
