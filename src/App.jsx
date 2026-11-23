import BottomNav from './components/BottomNav'
import OfflineBanner from './components/OfflineBanner'
import SideNav from './components/SideNav'
import UpdateBanner from './components/UpdateBanner'
import FoodDetailPage from './pages/FoodDetailPage'
import FoodsPage from './pages/FoodsPage'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import ProfilePage from './pages/ProfilePage'
import RestoPage from './pages/RestoPage'
import VisitsPage from './pages/VisitsPage'
import { useRoute } from './lib/router'

function safeDecode(value) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function renderPage(path) {
  if (path === '/') return <HomePage />
  if (path === '/foods') return <FoodsPage />
  if (path.startsWith('/foods/')) {
    return <FoodDetailPage id={safeDecode(path.slice('/foods/'.length))} />
  }
  if (path === '/resto') return <RestoPage />
  if (path === '/riwayat') return <VisitsPage />
  if (path === '/profile') return <ProfilePage />
  return <NotFoundPage />
}

export default function App() {
  const { path } = useRoute()
  const normalized = path.replace(/\/+$/, '') || '/'

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Lewati ke konten
      </a>

      <SideNav path={normalized} />

      <div className="app-content">
        <OfflineBanner />
        <main className="app-main" id="main" tabIndex={-1}>
          {renderPage(normalized)}
        </main>
        <UpdateBanner />
      </div>

      <BottomNav path={normalized} />
    </div>
  )
}
