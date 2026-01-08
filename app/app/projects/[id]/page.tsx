import { createClient } from '@/app/lib/supabase/server'
import { createTask, toggleTask, deleteTask, hasOrganization } from '@/app/lib/actions'
import { redirect } from 'next/navigation'
import type { Database } from '@/app/types/database'

type Project = Database['public']['Tables']['projects']['Row']
type Task = Database['public']['Tables']['tasks']['Row']

export default async function ProjectPage({ params }: { params: { id: string } }) {
    const { id } = await params
    const supabase = await createClient()

    // Check if user has an organization, redirect to setup if not
    const userHasOrg = await hasOrganization()
    if (!userHasOrg) {
        redirect('/app/setup-organization')
    }

    const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()

    if (!data) {
        return <div>Project not found</div>
    }

    const project: Project = data

    const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: false })

    const tasks: Task[] = tasksData || []

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">{project.name}</h1>

            <form action={createTask.bind(null, id)} className="bg-white p-6 rounded-lg shadow mb-6">
                <input
                    name="title"
                    placeholder="New task"
                    className="w-full px-3 py-2 border rounded mb-3"
                    required
                />
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Add Task
                </button>
            </form>

            <div className="space-y-2">
                {tasks?.map(task => (
                    <div key={task.id} className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <form action={toggleTask.bind(null, task.id, id, !task.completed)}>
                                <button className="w-5 h-5 border-2 rounded flex items-center justify-center">
                                    {task.completed && '✓'}
                                </button>
                            </form>
                            <span className={task.completed ? 'line-through text-gray-400' : ''}>
                {task.title}
              </span>
                        </div>
                        <form action={deleteTask.bind(null, task.id, id)}>
                            <button className="text-red-600 hover:text-red-700 text-sm">
                                Delete
                            </button>
                        </form>
                    </div>
                ))}
            </div>
        </div>
    )
}