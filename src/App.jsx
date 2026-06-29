import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SettingsProvider, useSettings } from './context/SettingsContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import HomePage from './pages/HomePage'
import MapPage from './pages/MapPage'
import ParkingDetailPage from './pages/ParkingDetailPage'
import ReservationPage from './pages/ReservationPage'
import MyReservationsPage from './pages/MyReservationsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PhoneLoginPage from './pages/PhoneLoginPage'
import OperatorLoginPage from './pages/operator/OperatorLoginPage'
import OperatorDashboardPage from './pages/operator/OperatorDashboardPage'
import MyVehiclesPage from './pages/MyVehiclesPage'
import LoyaltyPage from './pages/LoyaltyPage'
import ProfileSetupPage from './pages/ProfileSetupPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import SpotSelectorPage from './pages/SpotSelectorPage'
import FacilityMapPage from './pages/FacilityMapPage'
import WalletPage from './pages/WalletPage'
import NewsPage from './pages/NewsPage'
import OnboardingPage, { hasOnboarded } from './pages/OnboardingPage'
import HelloToast from './components/common/HelloToast'
import IdleHelper from './components/common/IdleHelper'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminContent from './pages/admin/AdminContent'
import AdminParkings from './pages/admin/AdminParkings'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminQueue from './pages/admin/AdminQueue'
import AdminPartners from './pages/admin/AdminPartners'
import AdminRevenue from './pages/admin/AdminRevenue'
import AdminOperators from './pages/admin/AdminOperators'
import PartnerPage from './pages/PartnerPage'
import QueueWatcher from './components/queue/QueueWatcher'
import { C, FONT } from './styles/theme'

function Entry() {
  return hasOnboarded() ? <LandingPage /> : <OnboardingPage />
}

// Block users an admin has deactivated
function AccountGate({ children }) {
  const { user, profile } = useAuth()
  const { t } = useSettings()
  if (user && profile && profile.active === false) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24, textAlign: 'center', fontFamily: FONT, background: C.grey, color: C.text }}>
        <div style={{ fontSize: '3.5rem' }}>🚫</div>
        <p style={{ color: C.textMuted, maxWidth: 320 }}>{t('account_disabled')}</p>
      </div>
    )
  }
  return children
}

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <BrowserRouter>
          <AccountGate>
            <Routes>
              <Route path="/" element={<Entry />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/parking/:id" element={<ParkingDetailPage />} />
              <Route path="/parking/:id/spots" element={<SpotSelectorPage />} />
              <Route path="/parking/:id/map" element={<FacilityMapPage />} />
              <Route path="/reserve/:id" element={<ReservationPage />} />
              <Route path="/my-reservations" element={<MyReservationsPage />} />
              <Route path="/my-vehicles" element={<MyVehiclesPage />} />
              <Route path="/loyalty" element={<LoyaltyPage />} />
              <Route path="/wallet" element={<WalletPage />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/partner" element={<PartnerPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/phone-login" element={<PhoneLoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/setup-profile" element={<ProfileSetupPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/operator/login" element={<OperatorLoginPage />} />
              <Route path="/operator/dashboard" element={<OperatorDashboardPage />} />
              {/* Admin */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/content" element={<AdminContent />} />
              <Route path="/admin/parkings" element={<AdminParkings />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/queue" element={<AdminQueue />} />
              <Route path="/admin/revenue" element={<AdminRevenue />} />
              <Route path="/admin/partners" element={<AdminPartners />} />
              <Route path="/admin/operators" element={<AdminOperators />} />
            </Routes>
          </AccountGate>
          <HelloToast />
          <IdleHelper />
          <QueueWatcher />
        </BrowserRouter>
      </AuthProvider>
    </SettingsProvider>
  )
}
