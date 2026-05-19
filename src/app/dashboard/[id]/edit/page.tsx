import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EditForm } from './EditForm'

export default async function EditBookmarkPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: bookmark } = await supabase
    .from('bookmarks')
    .select('id, url, title, description, tags')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!bookmark) notFound()

  return <EditForm bookmark={bookmark} />
}
