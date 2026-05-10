import { describe, it, expect, vi } from 'vitest'
import { handlers, auth } from './route'

vi.mock('next-auth', () => {
  return {
    default: vi.fn().mockReturnValue({
      handlers: { GET: vi.fn(), POST: vi.fn() },
      auth: vi.fn()
    })
  }
})

describe('NextAuth configuration', () => {
  it('should export handlers and auth', () => {
    expect(handlers).toBeDefined()
    expect(handlers.GET).toBeDefined()
    expect(handlers.POST).toBeDefined()
    expect(auth).toBeDefined()
  })
})
