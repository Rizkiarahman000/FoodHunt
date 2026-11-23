import { CheckCircle2, Download, UtensilsCrossed } from 'lucide-react'
import { Link } from '../lib/router'
import { useInstall } from '../context/InstallContext'
import { useToast } from '../context/ToastContext'
import { useVisits } from '../context/VisitsContext'
import { NAV_TABS } from '../data/nav'
import { shortNumber } from '../lib/format'
import { SCORE_FIELDS } from '../lib/reviews'

export default function SideNav({ path }) {
  const { stats } = useVisits()
  const { installed, canInstall, promptInstall } = useInstall()
  const notify = useToast()

  const handleInstall = async () => {
    const result = await promptInstall()
    if (result === 'accepted') notify('FoodHunt dipasang di perangkat ini.')
    if (result === 'unavailable') notify('Buka menu browser untuk memasang aplikasi.', 'error')
  }

  return (
    <aside className="side-nav" aria-label="Navigasi utama">
      <Link to="/" className="side-brand">
        <span className="brand-mark">
          <UtensilsCrossed size={20} aria-hidden="true" />
        </span>
        <span className="brand-name">
          FoodHunt
          <small>Buruan kuliner Tembalang</small>
        </span>
      </Link>

      <nav className="side-links" aria-label="Halaman">
        {NAV_TABS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? path === href : path === href || path.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              to={href}
              className={`side-link${active ? ' is-active' : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={20} strokeWidth={active ? 2.2 : 1.8} aria-hidden="true" />
              <span>{label}</span>
              {href === '/riwayat' && stats.total > 0 && (
                <span className="side-badge" aria-hidden="true">
                  {shortNumber(stats.total)}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="side-foot">
        <div className="side-hunt">
          <p>Pernah Beli</p>
          <strong>
            {stats.total === 0 ? 'Belum ada catatan' : `${stats.total} resto dicatat`}
          </strong>
          {stats.total > 0 ? (
            <div className="side-review-scores">
              {SCORE_FIELDS.map((field) => (
                <span key={field.key}>
                  {field.label}
                  <strong>{stats[field.key].toFixed(1)}</strong>
                </span>
              ))}
            </div>
          ) : (
            <p className="side-hunt-note">Catat setelah membeli</p>
          )}
        </div>

        {installed ? (
          <p className="side-installed">
            <CheckCircle2 size={15} aria-hidden="true" />
            Terpasang di perangkat
          </p>
        ) : canInstall ? (
          <button type="button" className="side-install" onClick={handleInstall}>
            <Download size={16} aria-hidden="true" />
            Pasang FoodHunt
          </button>
        ) : (
          <p className="side-installed">
            <Download size={15} aria-hidden="true" />
            Bisa dipasang dari browser
          </p>
        )}
      </div>
    </aside>
  )
}
