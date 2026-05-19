'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function deleteBookmark(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('bookmarks').delete().eq('id', id)
  if (!error) revalidatePath('/dashboard')
}

export async function updateBookmark(id: string, formData: FormData) {
  const url = (formData.get('url') as string).trim()
  const title = (formData.get('title') as string).trim()
  const description = (formData.get('description') as string).trim()
  const tagsRaw = (formData.get('tags') as string).trim()

  const tags = tagsRaw
    ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean)
    : []

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('bookmarks')
    .update({ url, title, description: description || null, tags })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: '저장 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function createBookmark(formData: FormData) {
  const url = (formData.get('url') as string).trim()
  const title = (formData.get('title') as string).trim()
  const description = (formData.get('description') as string).trim()
  const tagsRaw = (formData.get('tags') as string).trim()

  const tags = tagsRaw
    ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean)
    : []

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase.from('bookmarks').insert({
    user_id: user.id,
    url,
    title,
    description: description || null,
    tags,
  })

  if (error) return { error: '저장 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}
