import { Link } from '../lib/router'
import { useVisits } from '../context/VisitsContext'
import { NAV_TABS } from '../data/nav'
import { shortNumber } from '../lib/format'

export default function BottomNav({ path }) {
  const { stats } = useVisits()

  return (
    <nav className="bottom-nav" aria-label="Navigasi utama">
      {NAV_TABS.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? path === href : path === href || path.startsWith(`${href}/`)
        return (
          <Link
            key={href}
            to={href}
            className={`nav-link${active ? ' is-active' : ''}`}
            aria-current={active ? 'page' : undefined}
          >
            <span className="nav-icon">
              <Icon size={21} strokeWidth={active ? 2.3 : 1.9} aria-hidden="true" />
              {href === '/riwayat' && stats.total > 0 && (
                <span className="nav-badge" aria-hidden="true">
                  {shortNumber(stats.total)}
                </span>
              )}
            </span>
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
