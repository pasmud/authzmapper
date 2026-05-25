import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { path: '/', label: 'Dashboard', icon: '◉' },
  { path: '/specs', label: 'Import Spec', icon: '◈' },
  { path: '/roles', label: 'Roles', icon: '◎' },
  { path: '/scans', label: 'Scans', icon: '▶' },
  { path: '/reports', label: 'Reports', icon: '⬇' },
]

export default function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <nav className="w-56 bg-gray-900 border-r border-gray-800 p-4 flex flex-col">
        <div className="mb-8">
          <h1 className="text-lg font-bold text-cyan-400">AuthzMapper</h1>
          <p className="text-xs text-gray-500">API Auth Testing</p>
        </div>

        <div className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                  isActive
                    ? 'bg-cyan-900/30 text-cyan-300'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </div>

        <div className="pt-4 border-t border-gray-800">
          <p className="text-xs text-gray-600">
            Only test APIs you own or are authorized to test.
          </p>
        </div>
      </nav>

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
