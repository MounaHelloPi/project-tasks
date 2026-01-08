import { createClient } from '@/app/lib/supabase/server'
import { getCurrentOrg, createProject, hasOrganization } from '@/app/lib/actions'
import { redirect } from 'next/navigation'
import Link from "next/link";
import type { Database } from '@/app/types/database'

type ProjectWithTasks = Database['public']['Tables']['projects']['Row'] & {
    tasks: { id: string }[]
}

export default async function ProjectsPage() {
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
        .select('*, tasks(id)')
        .eq('org_id', org.org_id)
        .order('created_at', { ascending: false })

    const projects: ProjectWithTasks[] = data || []

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Projects</h1>
            </div>

            <form action={createProject} className="bg-white p-6 rounded-lg shadow mb-6">
                <input
                    name="name"
                    placeholder="New project name"
                    className="w-full px-3 py-2 border rounded mb-3"
                    required
                />
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Create Project
                </button>
            </form>

            <div className="grid gap-4">
                {projects?.map(p => (
                    <Link
                        key={p.id}
                        href={`/app/projects/${p.id}`}
                        className="bg-white p-6 rounded-lg shadow hover:shadow-md transition"
                    >
                        {p.name}
                    </Link>
    ))}
</div>
</div>
)
}