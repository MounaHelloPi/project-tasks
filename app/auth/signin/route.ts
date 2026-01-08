import { createClient } from '@/app/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function POST(request: Request) {
    const formData = await request.formData()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        redirect('/?error=invalid_credentials')
    }

    redirect('/app')
}