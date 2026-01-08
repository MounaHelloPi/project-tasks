/**
 * @jest-environment node
 */

const { NextRequest } = require('next/server')
const middleware = require('../middleware')

describe('Middleware Route Protection', () => {
  const createMockRequest = (pathname, user = null) => {
    const url = `http://localhost:3000${pathname}`
    const request = new NextRequest(url)

    // Mock Supabase auth
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user } })
      }
    }

    // Mock the createServerClient function
    jest.mock('../lib/supabase/server', () => ({
      createClient: jest.fn(() => mockSupabase)
    }))

    return request
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Public routes', () => {
    it('allows access to home page without authentication', async () => {
      const request = createMockRequest('/', null)
      const response = await middleware(request)

      expect(response.status).not.toBe(302) // Should not redirect
    })

    it('allows access to signup page without authentication', async () => {
      const request = createMockRequest('/signup', null)
      const response = await middleware(request)

      expect(response.status).not.toBe(302) // Should not redirect
    })
  })

  describe('Protected routes', () => {
    it('redirects unauthenticated users from /app routes to home', async () => {
      const request = createMockRequest('/app', null)
      const response = await middleware(request)

      expect(response.status).toBe(302)
      expect(response.headers.get('location')).toBe('http://localhost:3000/')
    })

    it('allows authenticated users to access /app routes', async () => {
      const mockUser = { id: '123', email: 'test@example.com' }
      const request = createMockRequest('/app', mockUser)
      const response = await middleware(request)

      expect(response.status).not.toBe(302) // Should not redirect
    })

    it('allows authenticated users to access /app/setup-organization', async () => {
      const mockUser = { id: '123', email: 'test@example.com' }
      const request = createMockRequest('/app/setup-organization', mockUser)
      const response = await middleware(request)

      expect(response.status).not.toBe(302) // Should not redirect
    })
  })
})
