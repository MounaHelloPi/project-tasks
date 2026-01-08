import { createClient } from '@/app/lib/supabase/server'
import { getCurrentOrg, createInvite, hasOrganization } from '@/app/lib/actions'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Database } from '@/app/types/database'

type Project = Database['public']['Tables']['projects']['Row']
type MembershipWithUser = Database['public']['Tables']['memberships']['Row'] & {
    user: { email: string } | null
}

export default async function Dashboard() {
    const supabase = await createClient()

    // Check if user has an organization, redirect to setup if not
    const userHasOrg = await hasOrganization()
    if (!userHasOrg) {
        redirect('/app/setup-organization')
    }

    const org = await getCurrentOrg()

    if (!org) {
        return <div>No organization found</div>
    }

    const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('org_id', org.org_id)
        .limit(5)

    const projects: Project[] = data || []

    const { data: membersData } = await supabase
        .from('memberships')
        .select(`
      *,
      user:auth.users!memberships_user_id_fkey(email)
    `)
        .eq('org_id', org.org_id)

    const members: MembershipWithUser[] = membersData || []

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Recent Projects</h2>
                    {projects?.map(p => (
                        <div key={p.id} className="py-2">
                            <Link
                                href={`/app/projects/${p.id}`}
                                className="text-blue-600 hover:underline"
                            >
                                {p.name}
                            </Link>
                        </div>
                    ))}
                    <Link
                        href="/app/projects"
                        className="text-sm text-blue-600 mt-4 inline-block"
                    >
                        View all →
                    </Link>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Team Members</h2>
                    {members?.map(m => (
                        <div key={m.id} className="py-2 flex justify-between">
                            <span>{m.user?.email}</span>
                            <span className="text-sm text-gray-500">{m.role}</span>
                        </div>
                    ))}

                    {org?.role === 'owner' && (
                        <form action={createInvite} className="mt-4 pt-4 border-t">
                            <input
                                name="email"
                                type="email"
                                placeholder="Invite by email"
                                className="w-full px-3 py-2 border rounded mb-2"
                                required
                            />
                            <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                                Send Invite
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}