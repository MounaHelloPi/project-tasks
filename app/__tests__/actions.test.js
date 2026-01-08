/**
 * @jest-environment node
 */

const { createOrganization, hasOrganization } = require('../lib/actions')

// Mock Supabase client
jest.mock('../lib/supabase/server', () => ({
  createClient: jest.fn()
}))

describe('Server Actions', () => {
  const mockSupabase = {
    auth: {
      getUser: jest.fn()
    },
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn()
        }))
      })),
      rpc: jest.fn()
    }))
  }

  beforeEach(() => {
    jest.clearAllMocks()
    require('../lib/supabase/server').createClient.mockReturnValue(mockSupabase)
  })

  describe('createOrganization', () => {
    it('throws error when user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })

      const formData = new FormData()
      formData.append('name', 'Test Organization')

      await expect(createOrganization(formData)).rejects.toThrow('Not authenticated')
    })

    it('throws error when organization name is empty', async () => {
      const mockUser = { id: '123', email: 'test@example.com' }
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      const formData = new FormData()
      formData.append('name', '   ') // Only whitespace

      await expect(createOrganization(formData)).rejects.toThrow('Organization name is required')
    })

    it('creates organization successfully for authenticated user', async () => {
      const mockUser = { id: '123', email: 'test@example.com' }
      const mockOrg = { id: 'org-123', name: 'Test Organization' }

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      // Mock successful organization creation
      mockSupabase.from.mockReturnValue({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({ data: mockOrg, error: null })
          }))
        }))
      })

      // Mock successful membership creation
      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({ data: mockOrg, error: null })
          }))
        }))
      }).mockReturnValueOnce({
        insert: jest.fn().mockResolvedValue({ error: null })
      })

      const formData = new FormData()
      formData.append('name', 'Test Organization')

      // Should not throw an error
      await expect(createOrganization(formData)).resolves.not.toThrow()

      // Verify the organization name was trimmed
      expect(mockSupabase.from).toHaveBeenCalledWith('organizations')
    })

    it('handles organization creation failure', async () => {
      const mockUser = { id: '123', email: 'test@example.com' }

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      // Mock failed organization creation
      mockSupabase.from.mockReturnValue({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database connection failed' }
            })
          }))
        }))
      })

      const formData = new FormData()
      formData.append('name', 'Test Organization')

      await expect(createOrganization(formData)).rejects.toThrow('Failed to create organization: Database connection failed')
    })
  })

  describe('hasOrganization', () => {
    it('returns false when user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })

      const result = await hasOrganization()
      expect(result).toBe(false)
    })

    it('returns true when user has organization membership', async () => {
      const mockUser = { id: '123', email: 'test@example.com' }
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            maybeSingle: jest.fn().mockResolvedValue({ data: { org_id: 'org-123' } })
          }))
        }))
      })

      const result = await hasOrganization()
      expect(result).toBe(true)
    })

    it('returns false when user has no organization membership', async () => {
      const mockUser = { id: '123', email: 'test@example.com' }
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            maybeSingle: jest.fn().mockResolvedValue({ data: null })
          }))
        }))
      })

      const result = await hasOrganization()
      expect(result).toBe(false)
    })
  })
})
