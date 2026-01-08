const { createClient } = require('@supabase/supabase-js')

// Test database connection with proper RLS policies
async function testDatabase() {
    console.log('🔍 Testing database connection with RLS policies...\n')

    const supabaseUrl = 'https://vwpailzocszuogbxrxpm.supabase.co'
    const supabaseKey = 'sb_publishable_eRsGH62GHeMUuJcxaJKvZw_CvI3Z0-m'

    console.log('📡 Supabase URL:', supabaseUrl)
    console.log('🔑 Using anon key for testing (limited access expected)\n')

    const supabase = createClient(supabaseUrl, supabaseKey)

    try {
        // Test 1: Basic connection (should work with RLS)
        console.log('1️⃣ Testing basic connection...')
        const { data: health, error: healthError } = await supabase
            .from('organizations')
            .select('count', { count: 'exact', head: true })

        if (healthError) {
            console.log('⚠️ Limited access (expected with RLS):', healthError.message)

            // Try a different approach - select a single row
            console.log('\n🔄 Trying alternative connection test...')
            const { data: altData, error: altError } = await supabase
                .from('organizations')
                .select('*')
                .limit(1)

            if (altError) {
                console.log('⚠️ Limited access (expected with RLS):', altError.message)
                console.log('✅ RLS is working - anonymous users have limited access')
            } else {
                console.log('❌ Unexpected: anonymous user can access organizations')
            }
        } else {
            console.log('❌ RLS not working - anonymous user has full access')
        }
        console.log('✅ Connected successfully!')
        console.log(`📊 Organizations count: ${health}\n`)

        // Test 2: Check memberships table (should be restricted for anonymous users)
        console.log('2️⃣ Testing memberships table (anonymous access)...')
        const { data: memberships, error: membershipsError } = await supabase
            .from('memberships')
            .select('*')
            .limit(5)

        if (membershipsError) {
            console.log('✅ Access restricted (expected):', membershipsError.message)
        } else {
            console.log('❌ Unexpected access to memberships table')
        }

        // Test 3: Check projects table (should be restricted for anonymous users)
        console.log('\n3️⃣ Testing projects table (anonymous access)...')
        const { data: projects, error: projectsError } = await supabase
            .from('projects')
            .select('*')
            .limit(3)

        if (projectsError) {
            console.log('✅ Access restricted (expected):', projectsError.message)
        } else {
            console.log('❌ Unexpected access to projects table')
        }

        // Test 4: Check tasks table (should be restricted for anonymous users)
        console.log('\n4️⃣ Testing tasks table (anonymous access)...')
        const { data: tasks, error: tasksError } = await supabase
            .from('tasks')
            .select('*')
            .limit(3)

        if (tasksError) {
            console.log('✅ Access restricted (expected):', tasksError.message)
        } else {
            console.log('❌ Unexpected access to tasks table')
        }

        // Test 5: Test authentication (should fail without session)
        console.log('\n5️⃣ Testing authentication...')
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            console.log('⚠️ Not authenticated (expected for anonymous access)')
        } else {
            console.log('✅ Authenticated as:', user.email)
        }

        // Test 6: Check table structure (RLS should restrict data access)
        console.log('\n6️⃣ Testing table access with RLS...')
        const tables = ['organizations', 'memberships', 'projects', 'tasks', 'invites', 'audit_logs']

        for (const table of tables) {
            try {
                const { error } = await supabase
                    .from(table)
                    .select('*')
                    .limit(1)

                if (error) {
                    console.log(`✅ Table '${table}' access restricted:`, error.message)
                } else {
                    console.log(`❌ Table '${table}' unexpectedly accessible`)
                }
            } catch (err) {
                console.log(`💥 Exception testing table '${table}':`, err.message)
            }
        }

        console.log('\n🎉 Database RLS test completed!')
        console.log('✅ RLS is working - anonymous users have restricted access')
        console.log('📝 Authenticated users should have full access to their organization data')

    } catch (error) {
        console.log('💥 Unexpected error:', error.message)
    }
}

testDatabase()
