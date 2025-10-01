import '@testing-library/jest-dom'
import { vi, beforeEach, afterEach } from 'vitest'

// Mock fetch API
global.fetch = vi.fn()

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock

// Mock sessionStorage
global.sessionStorage = localStorageMock

// Mock geolocation without overriding existing navigator properties
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn(),
  clearWatch: vi.fn(),
}

if (typeof global.navigator === 'undefined') {
  // @ts-expect-error navigator is injected by jsdom in tests
  global.navigator = {} as Navigator
}

// @ts-expect-error jsdom navigator is mutable for testing
global.navigator.geolocation = mockGeolocation as any

// Set environment variables directly
process.env.GEMINI_API_KEY = 'test-gemini-key'
process.env.NEXT_PUBLIC_GEMINI_API_KEY = 'test-gemini-key'
process.env.NEXT_PUBLIC_CENSUS_API_KEY = 'test-census-key'
process.env.ZAPIER_WEBHOOK_URL = 'https://hooks.zapier.com/test'

// Mock Next.js router
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    query: {},
    pathname: '/',
    asPath: '/',
  }),
}))

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

// Cleanup after each test
afterEach(() => {
  vi.restoreAllMocks()
})
