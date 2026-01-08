import { createClient } from '@/app/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createOrganization, hasOrganization } from '@/app/lib/actions'

export default async function SetupOrganization() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/')

    // If user already has an organization, redirect to dashboard
    const userHasOrg = await hasOrganization()
    if (userHasOrg) {
        redirect('/app')
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Welcome to Projects & Tasks!</h1>
                    <p className="text-gray-600">Let&apos;s set up your first organization to get started.</p>
                </div>

                <form action={createOrganization} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Organization Name
                        </label>
                        <input
                            name="name"
                            type="text"
                            required
                            className="w-full px-3 py-2 border rounded"
                            placeholder="My Company"
                            minLength={1}
                            maxLength={100}
                        />
                    </div>

                    <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                        Create Organization
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <form action="/auth/signout" method="post">
                        <button className="text-sm text-gray-500 hover:text-gray-700">
                            Sign out instead
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
