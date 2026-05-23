import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NavHeader from './components/NavHeader'
import AuthModal from './components/AuthModal'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Toaster from './components/Toaster'
import DevSocialPreview from './components/DevSocialPreview'
import { ToastProvider } from './hooks/useToast'

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <div className="flex h-screen flex-col bg-cm-cream text-cm-charcoal">
          <NavHeader />
          <AuthModal />
          <Routes>
            <Route path="/" element={<Home />} />
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
