import { createClient } from '@/app/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/app')

  return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-3xl font-bold mb-8 text-center">Projects & Tasks</h1>

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
            Don&#39;t have an account?{' '}
            <a href="/signup" className="text-blue-600 hover:underline">
              Sign up
            </a>
          </div>
        </div>
      </div>
  )
}