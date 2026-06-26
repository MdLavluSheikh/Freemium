import { create } from 'zustand'

interface AppSettings {
  autoplay: boolean
  notifications: boolean
}

interface AppState {
  favorites: string[]
  recentlyWatched: string[]
  searchHistory: string[]
  settings: AppSettings
  sidebarOpen: boolean

  toggleFavorite: (channelUrl: string) => void
  isFavorite: (channelUrl: string) => boolean
  addToRecentlyWatched: (channelUrl: string) => void
  addSearchHistory: (query: string) => void
  updateSettings: (settings: Partial<AppSettings>) => void
  toggleSidebar: () => void
}

export const useAppStore = create<AppState>((set, get) => ({
  favorites: [],
  recentlyWatched: [],
  searchHistory: [],
  settings: { autoplay: true, notifications: true },
  sidebarOpen: true,

  toggleFavorite: (channelUrl) =>
    set((state) => {
      const exists = state.favorites.includes(channelUrl)
      return { favorites: exists ? state.favorites.filter(u => u !== channelUrl) : [...state.favorites, channelUrl] }
    }),

  isFavorite: (channelUrl) => get().favorites.includes(channelUrl),

  addToRecentlyWatched: (channelUrl) =>
    set((state) => {
      const f = state.recentlyWatched.filter(u => u !== channelUrl)
      return { recentlyWatched: [channelUrl, ...f].slice(0, 20) }
    }),

  addSearchHistory: (query) =>
    set((state) => {
      const f = state.searchHistory.filter(q => q !== query)
      return { searchHistory: [query, ...f].slice(0, 10) }
    }),

  updateSettings: (settings) => set((state) => ({ settings: { ...state.settings, ...settings } })),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}))
