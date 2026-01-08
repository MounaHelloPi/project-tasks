import { createClient } from '@/app/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function POST(request: Request) {
    const formData = await request.formData()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    })

    if (error) {
        redirect('/signup?error=signup_failed')
    }

    // Create org for new user
    if (data.user) {
        const { data: org } = await supabase
            .from('organizations')
            .insert({ name: `${email.split('@')[0]}'s Organization` } as any)
            .select()
            .single()

        if (org) {
            const orgData = org as { id: string }
            await supabase
                .from('memberships')
                .insert({
                    org_id: orgData.id,
                    user_id: data.user.id,
                    role: 'owner'
                } as any)
        }
    }

    redirect('/app')
}