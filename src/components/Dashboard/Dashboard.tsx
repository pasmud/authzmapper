import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../services/api'

interface HealthData {
  status: string
  version: string
}

interface Stats {
  specs: number
  scans: number
  findings: number
  roles: number
}

export default function Dashboard() {
  const [health, setHealth] = useState<HealthData | null>(null)
  const [stats, setStats] = useState<Stats>({ specs: 0, scans: 0, findings: 0, roles: 0 })

  useEffect(() => {
    api.health().then(setHealth).catch(() => {})
    api.getSpecs().then(specs => setStats(s => ({ ...s, specs: specs.length }))).catch(() => {})
    api.getScans().then(scans => {
      let findings = 0
      scans.forEach((s: any) => { findings += s.failedTests || 0 })
      setStats(s => ({ ...s, scans: scans.length, findings }))
    }).catch(() => {})
    api.getRoles().then(roles => setStats(s => ({ ...s, roles: roles.length }))).catch(() => {})
  }, [])

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Dashboard</h2>
        <p className="text-gray-400 text-sm">
          API Authorization Testing Dashboard — identify BOLA and BFLA vulnerabilities
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="text-2xl font-bold text-cyan-400">{stats.specs}</div>
          <div className="text-sm text-gray-400">API Specs Imported</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="text-2xl font-bold text-blue-400">{stats.scans}</div>
          <div className="text-sm text-gray-400">Scans Run</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="text-2xl font-bold text-red-400">{stats.findings}</div>
          <div className="text-sm text-gray-400">Findings Detected</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="text-2xl font-bold text-green-400">{stats.roles}</div>
          <div className="text-sm text-gray-400">Test Roles</div>
        </div>
      </div>

      {health && (
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${health.status === 'ok' ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="font-medium">Backend Status: {health.status}</span>
          </div>
          <p className="text-sm text-gray-400">v{health.version}</p>
        </div>
      )}

      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h3 className="text-lg font-bold mb-4">Quick Start</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <span className="text-cyan-400 font-bold">1.</span>
            <div>
              <Link to="/specs" className="text-cyan-400 hover:underline">Import an OpenAPI spec</Link>
              <p className="text-gray-500">Upload JSON/YAML or use the built-in Demo API spec</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-cyan-400 font-bold">2.</span>
            <div>
              <Link to="/roles" className="text-cyan-400 hover:underline">Configure test roles</Link>
              <p className="text-gray-500">Set up tokens for user_a, user_b, and admin roles</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-cyan-400 font-bold">3.</span>
            <div>
              <Link to="/scans" className="text-cyan-400 hover:underline">Run an authorization scan</Link>
              <p className="text-gray-500">Generate the test matrix and execute tests</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-cyan-400 font-bold">4.</span>
            <div>
              <Link to="/results" className="text-cyan-400 hover:underline">Review findings</Link>
              <p className="text-gray-500">View BOLA/BFLA vulnerabilities and remediation steps</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
