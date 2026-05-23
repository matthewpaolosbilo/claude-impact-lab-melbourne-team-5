import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NavHeader from './components/NavHeader'
import AuthModal from './components/AuthModal'
import OnboardingGate from './components/OnboardingGate'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Toaster from './components/Toaster'
import DevSocialPreview from './components/DevSocialPreview'
import { ToastProvider } from './hooks/useToast'
import { useTheme } from './hooks/useTheme'

export default function App() {
  // Subscribe to theme so any toggle triggers a re-render at the root.
  useTheme()

  return (
    <ToastProvider>
      <BrowserRouter>
        <div
          className="flex h-screen flex-col"
          style={{
            background: 'var(--color-bg-primary)',
            color: 'var(--color-text-primary)',
          }}
        >
          <NavHeader />
          <AuthModal />
          <Routes>
            <Route
              path="/"
              element={
                <OnboardingGate>
                  <Home />
                </OnboardingGate>
              }
            />
            <Route path="/profile" element={<Profile />} />
            {import.meta.env.DEV && (
              <Route path="/_dev/social" element={<DevSocialPreview />} />
            )}
          </Routes>
        </div>
        <Toaster />
      </BrowserRouter>
    </ToastProvider>
  )
}
