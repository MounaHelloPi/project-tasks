'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from "./supabase/server"
import {Membership} from "@/app/types/database";
import {redirect} from "next/navigation";

// Check if user has any organization
export async function hasOrganization():Promise<boolean> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data } = await supabase
        .from('memberships')
        .select('org_id')
        .eq('user_id', user.id)
        .maybeSingle()
    return !!data
}

// Get current org
export async function getCurrentOrg():Promise<Membership | null> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data } = await supabase
        .from('memberships')
        .select('org_id, role')
        .eq('user_id', user.id)
        .maybeSingle()

    return data
}

// Projects
export async function createProject(formData: FormData) {
    const supabase = await createClient()
    const org = await getCurrentOrg()
    if (!org) throw new Error('No organization found')

    const name = formData.get('name') as string
    if (!name) throw new Error('Project name is required')

    const { data: project, error } = await supabase
        .from('projects')
        .insert({ name, org_id: org.org_id } as any)
        .select()
        .single()

    if (error) throw new Error('Failed to create project')

    if (project) {
        const projectData = project as { id: string }
        await supabase.rpc('log_action', {
            p_org_id: org.org_id,
            p_action: 'project.created',
            p_entity_type: 'project',
            p_entity_id: projectData.id,
        } as any)
    }

    revalidatePath('/app/projects')
}

// Tasks
export async function createTask(projectId: string, formData: FormData) {
    const supabase = await createClient()
    const org = await getCurrentOrg()
    if (!org) throw new Error('No organization found')

    const title = formData.get('title') as string
    if (!title) throw new Error('Title is required')

    const { data: task, error } = await supabase
        .from('tasks')
        .insert({
            title,
            project_id: projectId,
            org_id: org.org_id
        } as any)
        .select()
        .single()

    if (error) throw new Error('Failed to create task')

    if (task) {
        const taskData = task as { id: string }
        await supabase.rpc('log_action', {
            p_org_id: org.org_id,
            p_action: 'task.created',
            p_entity_type: 'task',
            p_entity_id: taskData.id,
        } as any)
    }

    revalidatePath(`/app/projects/${projectId}`)
}

export async function toggleTask(taskId: string, projectId: string, completed: boolean) {
    const supabase = await createClient()
    const org = await getCurrentOrg()
    if (!org) throw new Error('No organization found')

    await (supabase as any)
        .from('tasks')
        .update({ completed })
        .eq('id', taskId)

    await supabase.rpc('log_action', {
        p_org_id: org.org_id,
        p_action: 'task.toggled',
        p_entity_type: 'task',
        p_entity_id: taskId,
    } as any)

    revalidatePath(`/app/projects/${projectId}`)
}

export async function deleteTask(taskId: string, projectId: string) {
    const supabase = await createClient()

    await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

    revalidatePath(`/app/projects/${projectId}`)
}

// Invites
export async function createInvite(formData: FormData) {
    const supabase = await createClient()
    const org = await getCurrentOrg()
    const { data: { user } } = await supabase.auth.getUser()
    if (!org || !user) throw new Error('No organization found')

    const email = formData.get('email') as string
    if (!email) throw new Error('Email is required')

    const { data: invite, error } = await supabase
        .from('invites')
        .insert({
            email,
            org_id: org.org_id,
            invited_by: user.id
        } as any)
        .select()
        .single()

    if (error) throw new Error('Failed to create invite')

    if (invite) {
        await supabase.rpc('log_action', {
            p_org_id: org.org_id,
            p_action: 'member.invited',
        } as any)
    }

    revalidatePath('/app')
}

export async function acceptInvite(token: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !user.email) return { error: 'Not authenticated or missing email' }

    const { data: invite } = await supabase
        .from('invites')
        .select('*')
        .eq('token', token)
        .eq('email', user.email)
        .single()

    if (!invite) return { error: 'Invalid invite' }

    const inviteData = invite as { id: string; org_id: string }

    await supabase
        .from('memberships')
        .insert({
            org_id: inviteData.org_id,
            user_id: user.id,
            role: 'member'
        } as any)

    await (supabase as any)
        .from('invites')
        .update({ accepted: true })
        .eq('id', inviteData.id)

    await supabase.rpc('log_action', {
        p_org_id: inviteData.org_id,
        p_action: 'member.joined',
    } as any)

    revalidatePath('/app')
    return { success: true }
}

// Create organization and make user the owner
export async function createOrganization(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const name = formData.get('name') as string
    if (!name|| name.trim().length === 0) throw new Error('Organization name is required')

    // Create organization
    const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({  name: name.trim() } as any)
        .select()
        .single()

    // Debug: Log the error details
    if (orgError) {
        console.error('Organization creation error:', orgError)
        throw new Error(`Failed to create organization: ${orgError.message}`)
    }

    if (!org) {
        throw new Error('Failed to create organization: No data returned')
    }

    const orgData = org as { id: string }

    // Create membership as owner
    const { error: membershipError } = await supabase
        .from('memberships')
        .insert({
            org_id: orgData.id,
            user_id: user.id,
            role: 'owner'
        } as any)

    if (membershipError) {
        console.error('Membership creation error:', membershipError)
        throw new Error(`Failed to create membership: ${membershipError.message}`)
    }

    // Log the action
    await supabase.rpc('log_action', {
        p_org_id: orgData.id,
        p_action: 'organization.created',
        p_entity_type: 'organization',
        p_entity_id: orgData.id,
    } as any)

    revalidatePath('/app')
    redirect('/app')
}
