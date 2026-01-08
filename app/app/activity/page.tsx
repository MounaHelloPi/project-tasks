import { createClient } from '@/app/lib/supabase/server'
import { getCurrentOrg, hasOrganization } from '@/app/lib/actions'
import { redirect } from 'next/navigation'
import type { Database } from '@/app/types/database'

type AuditLog = Database['public']['Tables']['audit_logs']['Row']

export default async function ActivityPage() {
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
        .from('audit_logs')
        .select('*')
        .eq('org_id', org.org_id)
        .order('created_at', { ascending: false })
        .limit(20)

    const logs: AuditLog[] = data || []

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Activity Log</h1>

            <div className="bg-white rounded-lg shadow divide-y">
                {logs?.map(log => (
                    <div key={log.id} className="p-4">
                        <div className="flex justify-between">
                            <div>
                                <span className="font-medium">{log.user_id || 'System'}</span>
                                <span className="text-gray-600 ml-2">{log.action}</span>
                            </div>
                            <span className="text-sm text-gray-500">
                {new Date(log.created_at).toLocaleString()}
              </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}