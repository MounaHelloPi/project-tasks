import { createClient } from '@/app/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function Home({ searchParams }: { searchParams: { error?: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/app')

  const error = searchParams.error

  return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-3xl font-bold mb-8 text-center">Projects & Tasks</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error === 'invalid_credentials' && 'Invalid email or password. Please try again.'}
            </div>
          )}

          {/* Login Form */}
          <form action="/auth/signin" method="post" className="space-y-4">
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
                  className="w-full px-3 py-2 border rounded"
                  placeholder="••••••••"
              />
            </div>
            <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              Sign In
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/signup" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
  )
}