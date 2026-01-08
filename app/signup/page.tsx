import { createClient } from '@/app/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function SignupPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) redirect('/app')

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-3xl font-bold mb-8 text-center">Create Account</h1>

                <form action="/auth/signup" method="post" className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="w-full px-3 py-2 border rounded"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            name="password"
                            type="password"
                            required
                            minLength={6}
                            className="w-full px-3 py-2 border rounded"
                            placeholder="••••••••"
                        />
                    </div>
                    <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                        Sign Up
                    </button>
                </form>

                <div className="mt-4 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link href="/" className="text-blue-600 hover:underline">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    )
}