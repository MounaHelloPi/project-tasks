# Projects & Tasks

A modern project management application built with Next.js 16, TypeScript, and Supabase. This app lets teams organize work with organization-based access control, real-time collaboration, and secure Google OAuth authentication.

## 🚀 Features

- **Organization Management**: Create and manage organizations with role-based permissions
- **Project Tracking**: Organize tasks within projects with real-time updates
- **Team Collaboration**: Invite members with different permission levels (owner/member)
- **Secure Authentication**: Google OAuth integration with Supabase Auth
- **Activity Logging**: Track all organization activities and changes
- **Modern UI**: Clean, responsive interface built with Tailwind CSS

## 📋 Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Supabase account (free tier available)
- Google Cloud Console account (for OAuth setup)

## 🛠 Quick Setup

Getting started is straightforward. Here's the complete setup process:

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd project-tasks
npm install
```

### 2. Environment Variables

Copy the example file and configure your environment:

```bash
cp .env.example .env.local
```

Fill in your Supabase credentials and app URL. The variables are explained in detail below.

### 3. Supabase Setup

#### Database Schema & Security

Run the database migration to create all tables and security policies:

1. Go to your Supabase dashboard → **SQL Editor**
2. Copy the entire contents of `fix-rls.sql`
3. Paste and run it

This creates all tables with Row Level Security policies that ensure users can only access data from their organizations.

#### Google OAuth Configuration

**In Google Cloud Console:**
1. Visit [console.cloud.google.com](https://console.cloud.google.com)
2. Create or select a project
3. Enable the Google+ API
4. Go to "Credentials" → "Create OAuth 2.0 Client ID"
5. Set application type to "Web application"
6. Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
7. Copy the Client ID and Client Secret

**In Supabase:**
1. Go to Authentication → Settings
2. Set Site URL to your app's URL (e.g., `http://localhost:3000` for development)
3. Go to Authentication → Providers
4. Enable Google provider
5. Paste your Client ID and Client Secret from Google Cloud Console
6. Save changes

### 4. Run Tests (Optional)

Verify everything works correctly:

```bash
npm test  # Run the test suite
```

### 5. Start Development

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and sign up with Google!

## 🔧 Environment Variables

Create a `.env.local` file by copying the example:

```bash
cp .env.example .env.local
```

Then fill in your actual values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Application Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Variable Explanations

- **`NEXT_PUBLIC_SUPABASE_URL`**: Your Supabase project URL
  - Found in Supabase Dashboard → Settings → API → Project URL
  - Format: `https://[project-id].supabase.co`

- **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**: Public anonymous key for client-side operations
  - Found in Supabase Dashboard → Settings → API → Project API keys
  - Safe to expose in frontend code

- **`NEXT_PUBLIC_SITE_URL`**: Your application's base URL
  - `http://localhost:3000` for local development
  - `https://yourdomain.com` for production
  - Used for OAuth redirect URLs and email links

## 🧪 Testing

### Automated Test Suite

The project includes a comprehensive test suite covering route protection and server actions:

```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test -- --coverage  # Run with coverage report
```

**Test Coverage:**
- ✅ **Route Protection**: Middleware blocks unauthenticated access to `/app/*` routes
- ✅ **Server Actions**: Organization creation with proper validation and error handling
- ✅ **Authentication Guards**: User access controls and organization membership checks

### Key Tests

**Middleware Route Protection** (`app/__tests__/middleware.test.js`):
- Verifies unauthenticated users are redirected from protected routes
- Confirms authenticated users can access `/app/*` routes
- Tests organization setup page accessibility

**Server Actions** (`app/__tests__/actions.test.js`):
- Tests organization creation with authentication
- Validates input sanitization (name trimming)
- Checks error handling for database failures
- Verifies organization membership logic

### Manual Testing Checklist

**🔐 Authentication & Access Control:**
- [ ] Homepage loads without authentication
- [ ] Accessing `/app` redirects to `/` when not logged in
- [ ] Google OAuth signup works and creates user account
- [ ] New users are redirected to organization setup
- [ ] Authenticated users can access protected routes
- [ ] Sign out properly clears session

**🏢 Organization Management:**
- [ ] Organization creation form appears for new users
- [ ] Creating an organization makes user the owner
- [ ] Organization name is properly trimmed and validated
- [ ] Dashboard loads after organization creation
- [ ] Organization data persists across sessions

**👥 Team Features:**
- [ ] Owner can invite team members via email
- [ ] Invited users receive proper invitation links
- [ ] Role-based permissions work (owner vs member)
- [ ] Members can only access their organization's data

**📊 Data Security:**
- [ ] Users can only see their organization's projects and tasks
- [ ] Row Level Security policies prevent data leakage
- [ ] Audit logs track all important organization activities

### Database Testing

Test database connectivity and RLS effectiveness:

```bash
# Visit this endpoint to see database status
http://localhost:3000/test-db
```

This diagnostic page shows:
- Connection status and credentials validation
- Table existence and accessibility
- RLS policy effectiveness for anonymous users
- Current authenticated user information

## 🗄 Database Schema & Migrations

### Database Design

The application uses a secure, multi-tenant database design with 6 core tables:

- **`organizations`** - Company/team containers with metadata
- **`memberships`** - User-organization relationships (owner/member roles)
- **`projects`** - Work containers scoped to organizations
- **`tasks`** - Individual work items with completion status
- **`invites`** - Team member invitation tokens
- **`audit_logs`** - Activity tracking for compliance and debugging

### Running Migrations

Database setup uses SQL migration files for complete reproducibility:

**1. Apply Schema & Security Policies:**
```bash
# In Supabase Dashboard → SQL Editor
# Copy and paste entire contents of: fix-rls.sql
```

The migration includes:
- Complete table schema with constraints and indexes
- Row Level Security policies (no circular dependencies)
- Performance optimizations and foreign key relationships

**2. Verify Setup:**
```bash
# Test database connectivity
curl http://localhost:3000/test-db
```

### Optional Seed Data

For development testing, you can add sample data:

```sql
-- Create a test organization
INSERT INTO organizations (name) VALUES ('Acme Corporation');

-- Add a test user as owner (replace with actual user ID after signup)
-- INSERT INTO memberships (org_id, user_id, role)
-- SELECT id, 'your-actual-user-id', 'owner'
-- FROM organizations WHERE name = 'Acme Corporation';
```

**Note:** User IDs are generated by Supabase Auth after signup, so add seed data after creating your account.

## 📁 Project Structure

```
project-tasks/
├── app/                          # Next.js 16 app directory
│   ├── app/                      # Protected application routes
│   │   ├── setup-organization/   # First-time organization setup
│   │   ├── projects/            # Project management
│   │   │   └── [id]/            # Individual project pages
│   │   └── activity/            # Activity feed
│   ├── auth/                    # Authentication API routes
│   ├── signup/                  # Registration page
│   ├── lib/                     # Shared utilities
│   │   ├── supabase/            # Database clients
│   │   └── actions.ts           # Server actions
│   ├── types/                   # TypeScript definitions
│   └── __tests__/               # Test suite
│       ├── middleware.test.js   # Route protection tests
│       └── actions.test.js      # Server action tests
├── fix-rls.sql                  # Database schema & security policies
├── .env.example                 # Environment template (no secrets)
├── jest.config.js               # Jest testing configuration
├── jest.setup.js                # Test environment setup
└── README.md                    # This documentation
```

## 🏗 Tech Stack & Architecture

**Frontend:**
- Next.js 16 (App Router)
- React 19 with TypeScript
- Tailwind CSS for styling
- Server Components & Actions

**Backend & Database:**
- Supabase (PostgreSQL + Auth)
- Row Level Security policies
- Real-time subscriptions

**Authentication:**
- Google OAuth 2.0
- Supabase Auth integration
- Secure session management

**Development & Testing:**
- ESLint for code quality and consistency
- Jest + Testing Library for comprehensive test coverage
- TypeScript for type safety and developer experience

### Database Schema

**Core Tables:**
- **`organizations`** - Company/team containers
- **`memberships`** - User-organization relationships (owner/member roles)
- **`projects`** - Work containers within organizations
- **`tasks`** - Individual work items with completion status
- **`invites`** - Team member invitations with tokens
- **`audit_logs`** - Activity tracking for compliance

**Security Model:**
- Row Level Security ensures users only see their organization's data
- Role-based permissions (owners can invite/manage members)
- Secure invitation system with unique tokens
- Audit logging for all important actions

## 🚀 Deployment

### Vercel (Recommended)

The easiest way to deploy:

1. **Connect Repository:**
   - Import your GitHub repo to Vercel
   - Vercel auto-detects Next.js

2. **Environment Variables:**
   - Add all variables from `.env.local` to Vercel dashboard
   - Change `NEXT_PUBLIC_SITE_URL` to your production domain

3. **Supabase Configuration:**
   - Update Supabase site URL to: `https://your-app.vercel.app`
   - Add production redirect URLs to Google OAuth

4. **Deploy:** Click deploy and you're live!

### Manual Deployment

For other platforms:

```bash
npm run build
npm start
```

Make sure to:
- Set production environment variables
- Configure your domain in Supabase Auth settings
- Update Google OAuth redirect URIs
- Enable HTTPS for security

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Quick Fixes

**"Failed to create organization"**
```bash
# Check the test page for database status
# Visit: http://localhost:3000/test-db
```
- Verify RLS policies are applied in Supabase SQL Editor
- Check browser console for detailed error messages
- Ensure you're authenticated before creating organizations

**"Infinite redirect loop"**
- Clear browser cookies and local storage for localhost:3000
- Restart the dev server: `npm run dev`
- Check that you've completed the organization setup flow

**"Authentication not working"**
- Verify Google OAuth credentials in Supabase → Authentication → Providers
- Check that redirect URLs match: `https://your-project.supabase.co/auth/v1/callback`
- Ensure `NEXT_PUBLIC_SITE_URL` is set correctly

### Database Issues

**"Table doesn't exist" errors:**
- Re-run the `fix-rls.sql` script in Supabase SQL Editor
- Check Supabase dashboard to confirm tables were created

**Permission errors:**
- Verify RLS policies are enabled on all tables
- Check that you're logged in with the correct user account

### Getting Help

1. **Check the test page:** `http://localhost:3000/test-db`
2. **Browser console:** Look for detailed error messages
3. **Supabase logs:** Check Authentication and Database logs
4. **Environment:** Verify all `.env.local` variables are set
5. **Network:** Ensure Supabase project is accessible