import { createClient } from '@/app/lib/supabase/server'

export default async function TestDB() {
    try {
        const supabase = await createClient()

        // Test basic connection
        const { data: health, error: healthError } = await supabase
            .from('organizations')
            .select('count', { count: 'exact', head: true })

        // Test memberships table
        const { data: memberships, error: membershipsError } = await supabase
            .from('memberships')
            .select('*')
            .limit(5)

        // Test auth user
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold mb-6">Database Connection Test</h1>

                <div className="space-y-6">
                    <div className="bg-white p-4 rounded shadow">
                        <h2 className="font-semibold mb-2">Connection Status:</h2>
                        <p className={healthError ? "text-red-600" : "text-green-600"}>
                            {healthError ? `❌ Error: ${healthError.message}` : "✅ Connected"}
                        </p>
                    </div>

                    <div className="bg-white p-4 rounded shadow">
                        <h2 className="font-semibold mb-2">Organizations Count:</h2>
                        <p>{healthError ? "N/A" : `${health} organizations in database`}</p>
                    </div>

                    <div className="bg-white p-4 rounded shadow">
                        <h2 className="font-semibold mb-2">Memberships Table:</h2>
                        {membershipsError ? (
                            <p className="text-red-600">❌ Error: {membershipsError.message}</p>
                        ) : (
                            <div>
                                <p className="text-green-600">✅ Table accessible</p>
                                <p className="text-sm text-gray-600 mt-2">
                                    Found {memberships?.length || 0} memberships
                                </p>
                                {memberships && memberships.length > 0 && (
                                    <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                                        {JSON.stringify(memberships, null, 2)}
                                    </pre>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-4 rounded shadow">
                        <h2 className="font-semibold mb-2">Current User:</h2>
                        {authError ? (
                            <p className="text-red-600">❌ Error: {authError.message}</p>
                        ) : user ? (
                            <div>
                                <p className="text-green-600">✅ Authenticated</p>
                                <p className="text-sm mt-1">User ID: {user.id}</p>
                                <p className="text-sm">Email: {user.email}</p>
                            </div>
                        ) : (
                            <p className="text-orange-600">⚠️ Not authenticated</p>
                        )}
                    </div>

                    <div className="bg-white p-4 rounded shadow">
                        <h2 className="font-semibold mb-2">Environment Variables:</h2>
                        <div className="text-sm space-y-1">
                            <p>SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing"}</p>
                            <p>SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing"}</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    } catch (error) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold mb-6 text-red-600">Database Test Failed</h1>
                <div className="bg-red-50 p-4 rounded border border-red-200">
                    <p className="text-red-800">
                        Error: {error instanceof Error ? error.message : 'Unknown error'}
                    </p>
                </div>
            </div>
        )
    }
}
