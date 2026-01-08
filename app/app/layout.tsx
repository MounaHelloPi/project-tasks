import { createClient } from '@/app/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AppLayout({
                                            children,
                                        }: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/')

    // Individual pages will handle organization checks

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex gap-6">
                        <Link href="/app" className="font-semibold">
                            Dashboard
                        </Link>
                        <Link href="/app/projects">
                            Projects
                        </Link>
                        <Link href="/app/activity">
                            Activity
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">{user.email}</span>
                        <form action="/auth/signout" method="post">
                            <button className="text-sm text-red-600 hover:text-red-700">
                                Sign Out
                            </button>
                        </form>
                    </div>
                </div>
            </nav>
            <main className="max-w-7xl mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    )
}