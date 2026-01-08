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

    // Create organization for new user
    if (data.user) {
        try {
            const { data: org, error: orgError } = await supabase
                .from('organizations')
                .insert({ name: `${email.split('@')[0]}'s Organization` } as any)
                .select()
                .single()

            if (org && !orgError) {
                const orgData = org as { id: string }
                const { error: membershipError } = await supabase
                    .from('memberships')
                    .insert({
                        org_id: orgData.id,
                        user_id: data.user.id,
                        role: 'owner'
                    } as any)

                if (!membershipError) {
                    // Successfully created org and membership, redirect to dashboard
                    redirect('/app')
                }
            }
        } catch (error) {
            console.error('Organization creation failed:', error)
            // Continue with signup even if org creation fails
            // User will be redirected to setup-organization by app layout
        }
    }

    // Default redirect to app (app layout will handle org setup)
    redirect('/app')
}