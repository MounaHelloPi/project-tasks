-- WORKING RLS POLICIES: No recursive relations
-- Based on user's working solution

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop any existing problematic policies
DROP POLICY IF EXISTS "organizations_access" ON organizations;
DROP POLICY IF EXISTS "memberships_access" ON memberships;
DROP POLICY IF EXISTS "projects_access" ON projects;
DROP POLICY IF EXISTS "tasks_access" ON tasks;
DROP POLICY IF EXISTS "invites_access" ON invites;
DROP POLICY IF EXISTS "audit_logs_access" ON audit_logs;

-- ORGANIZATIONS
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their orgs" ON organizations;
DROP POLICY IF EXISTS "Users can create orgs" ON organizations;

-- Users can view orgs they're members of
CREATE POLICY "Users can view their orgs"
  ON organizations FOR SELECT
  USING (
    id IN (
      SELECT org_id FROM memberships WHERE user_id = auth.uid()
    )
  );

-- Users can create orgs (no restriction on INSERT)
CREATE POLICY "Users can create orgs"
  ON organizations FOR INSERT
  WITH CHECK (true);  -- ✅ Pas de restriction

-- MEMBERSHIPS - Fix recursive relation
-- Drop the problematic policy first
DROP POLICY IF EXISTS "Users can view memberships" ON memberships;

-- Users can view their own memberships directly (no recursion)
CREATE POLICY "Users can view memberships"
  ON memberships FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their OWN membership (bootstrap case)
CREATE POLICY "Users can insert their own membership"
  ON memberships FOR INSERT
  WITH CHECK (
    user_id = auth.uid()  -- ✅ Simple check: can only add yourself
  );

-- Only owners can insert OTHER users' memberships
CREATE POLICY "Owners can add members"
  ON memberships FOR INSERT
  WITH CHECK (
    user_id != auth.uid()  -- Adding someone else
    AND org_id IN (
      SELECT org_id FROM memberships
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- PROJECTS: Restrict to organization members
-- Drop existing policies
DROP POLICY IF EXISTS "projects_select" ON projects;
DROP POLICY IF EXISTS "projects_insert" ON projects;
DROP POLICY IF EXISTS "projects_update" ON projects;
DROP POLICY IF EXISTS "projects_delete" ON projects;

CREATE POLICY "projects_select" ON projects
FOR SELECT USING (
    org_id IN (SELECT org_id FROM memberships WHERE user_id = auth.uid())
);

CREATE POLICY "projects_insert" ON projects
FOR INSERT WITH CHECK (
    org_id IN (SELECT org_id FROM memberships WHERE user_id = auth.uid())
);

CREATE POLICY "projects_update" ON projects
FOR UPDATE USING (
    org_id IN (SELECT org_id FROM memberships WHERE user_id = auth.uid())
);

CREATE POLICY "projects_delete" ON projects
FOR DELETE USING (
    org_id IN (SELECT org_id FROM memberships WHERE user_id = auth.uid() AND role = 'owner')
);

-- TASKS: Restrict to organization members
-- Drop existing policies
DROP POLICY IF EXISTS "tasks_select" ON tasks;
DROP POLICY IF EXISTS "tasks_insert" ON tasks;
DROP POLICY IF EXISTS "tasks_update" ON tasks;
DROP POLICY IF EXISTS "tasks_delete" ON tasks;

CREATE POLICY "tasks_select" ON tasks
FOR SELECT USING (
    org_id IN (SELECT org_id FROM memberships WHERE user_id = auth.uid())
);

CREATE POLICY "tasks_insert" ON tasks
FOR INSERT WITH CHECK (
    org_id IN (SELECT org_id FROM memberships WHERE user_id = auth.uid())
);

CREATE POLICY "tasks_update" ON tasks
FOR UPDATE USING (
    org_id IN (SELECT org_id FROM memberships WHERE user_id = auth.uid())
);

CREATE POLICY "tasks_delete" ON tasks
FOR DELETE USING (
    org_id IN (SELECT org_id FROM memberships WHERE user_id = auth.uid())
);

-- INVITES: Organization members can manage invites
-- Drop existing policies
DROP POLICY IF EXISTS "invites_select" ON invites;
DROP POLICY IF EXISTS "invites_insert" ON invites;
DROP POLICY IF EXISTS "invites_update" ON invites;

CREATE POLICY "invites_select" ON invites
FOR SELECT USING (
    org_id IN (SELECT org_id FROM memberships WHERE user_id = auth.uid())
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

CREATE POLICY "invites_insert" ON invites
FOR INSERT WITH CHECK (
    org_id IN (SELECT org_id FROM memberships WHERE user_id = auth.uid())
);

CREATE POLICY "invites_update" ON invites
FOR UPDATE USING (
    org_id IN (SELECT org_id FROM memberships WHERE user_id = auth.uid())
);

-- AUDIT LOGS: Organization members can see logs
-- Drop existing policies
DROP POLICY IF EXISTS "audit_logs_select" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_insert" ON audit_logs;

CREATE POLICY "audit_logs_select" ON audit_logs
FOR SELECT USING (
    org_id IN (SELECT org_id FROM memberships WHERE user_id = auth.uid())
    OR user_id = auth.uid()
);

CREATE POLICY "audit_logs_insert" ON audit_logs
FOR INSERT WITH CHECK (
    org_id IN (SELECT org_id FROM memberships WHERE user_id = auth.uid())
    OR user_id = auth.uid()
);
