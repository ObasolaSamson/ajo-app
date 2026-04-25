'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const full_name = ((formData.get('full_name') as string) ?? '').trim()
  const phone = ((formData.get('phone') as string) ?? '').trim()

  const { error } = await supabase
    .from('profiles')
    .update({ full_name, phone })
    .eq('id', user.id)

  if (error) {
    redirect(`/dashboard/profile?error=${encodeURIComponent(error.message)}`)
  }

  // Keep auth metadata in sync
  await supabase.auth.updateUser({ data: { full_name } })

  revalidatePath('/dashboard/profile')
  revalidatePath('/dashboard')
  redirect('/dashboard/profile?saved=1')
}
