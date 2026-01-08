import { createClient } from '@/app/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function POST(request: Request) {
    const formData = await request.formData()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        redirect('/?error=invalid_credentials')
    }

    if (data.user) {
        // Successful signin, redirect to app
        // App layout will handle organization setup if needed
        redirect('/app')
    }

    // Fallback redirect
    redirect('/app')
}