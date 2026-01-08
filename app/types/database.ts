export type Database = {
    public: {
        Tables: {
            organizations: {
                Row: {
                    id: string
                    name: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    created_at?: string
                }
            }
            memberships: {
                Row: {
                    id: string
                    org_id: string
                    user_id: string
                    role: 'owner' | 'member'
                    created_at: string
                }
            }
            projects: {
                Row: {
                    id: string
                    org_id: string
                    name: string
                    created_at: string
                }
            }
            tasks: {
                Row: {
                    id: string
                    project_id: string
                    org_id: string
                    title: string
                    completed: boolean
                    created_at: string
                }
            }
            invites: {
                Row: {
                    id: string
                    org_id: string
                    email: string
                    invited_by: string
                    token: string
                    accepted: boolean
                    created_at: string
                }
            }
            audit_logs: {
                Row: {
                    id: string
                    org_id: string
                    user_id: string | null
                    action: string
                    entity_type: string | null
                    entity_id: string | null
                    metadata: Record<string, unknown>
                    created_at: string
                }
            }
        }
    }
}
type Tables = Database['public']['Tables']

export type Membership = Tables['memberships']['Row']