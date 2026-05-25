import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../services/api'

export default function ScanMatrix() {
  const [specs, setSpecs] = useState<any[]>([])
  const [scans, setScans] = useState<any[]>([])
  const [selectedSpecId, setSelectedSpecId] = useState<number>(0)
  const [targetUrl, setTargetUrl] = useState('http://localhost:3001')
  const [scanName, setScanName] = useState('')
  const [running, setRunning] = useState(false)
  const [confirmExternal, setConfirmExternal] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    api.getSpecs().then(setSpecs).catch(() => {})
    api.getScans().then(setScans).catch(() => {})
  }, [])

  async function handleRunScan() {
    if (!selectedSpecId) return

    const isExternal = !targetUrl.includes('localhost') && !targetUrl.includes('127.0.0.1')
    if (isExternal && !confirmExternal) {
      alert('Please confirm you are authorized to test this target.')
      return
    }

    setRunning(true)
    try {
      const result = await api.createScan(selectedSpecId, scanName || `Scan ${new Date().toLocaleString()}`, targetUrl)
      navigate(`/scans/${result.scan.id}`)
    } catch (err: any) {
      alert(`Scan failed: ${err.message}`)
    }
    setRunning(false)
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Run Authorization Scan</h2>
        <p className="text-gray-400 text-sm">
          Generate and execute an authorization test matrix against your API.
        </p>
      </div>

      <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 mb-6 max-w-xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">API Spec</label>
            <select
              value={selectedSpecId}
              onChange={e => setSelectedSpecId(parseInt(e.target.value))}
              className="w-full bg-gray-950 border border-gray-800 rounded px-3 py-2 text-sm"
            >
              <option value={0}>Select a spec...</option>
              {specs.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name} v{s.version}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Target URL</label>
            <input
              type="text"
              value={targetUrl}
              onChange={e => setTargetUrl(e.target.value)}
              placeholder="http://localhost:3001"
              className="w-full bg-gray-950 border border-gray-800 rounded px-3 py-2 text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Scan Name (optional)</label>
            <input
              type="text"
              value={scanName}
              onChange={e => setScanName(e.target.value)}
              placeholder={`Scan ${new Date().toLocaleString()}`}
              className="w-full bg-gray-950 border border-gray-800 rounded px-3 py-2 text-sm"
            />
          </div>

          {!targetUrl.includes('localhost') && !targetUrl.includes('127.0.0.1') && (
            <div className="bg-yellow-900/20 border border-yellow-700/30 rounded p-3">
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={confirmExternal}
                  onChange={e => setConfirmExternal(e.target.checked)}
                  className="mt-0.5"
                />
                <span className="text-yellow-300">
                  I confirm I am authorized to test this target system, API, or infrastructure.
                  I understand that unauthorized testing may be illegal.
                </span>
              </label>
            </div>
          )}

          <button
            onClick={handleRunScan}
            disabled={running || !selectedSpecId}
            className="px-6 py-2 bg-cyan-700 hover:bg-cyan-600 rounded font-medium transition-colors disabled:opacity-50"
          >
            {running ? 'Running Scan...' : 'Run Scan'}
          </button>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
        <h3 className="font-bold mb-3">Recent Scans ({scans.length})</h3>
        {scans.length === 0 ? (
          <p className="text-gray-500 text-sm">No scans yet.</p>
        ) : (
          <div className="space-y-2">
            {scans.map((scan: any) => (
              <div
                key={scan.id}
                className="bg-gray-950 rounded p-3 border border-gray-800 flex items-center justify-between cursor-pointer hover:border-gray-700"
                onClick={() => navigate(`/scans/${scan.id}`)}
              >
                <div>
                  <span className="font-medium">{scan.name}</span>
                  <span className="text-gray-500 text-sm ml-2">({scan.totalTests} tests)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    scan.status === 'completed' ? 'bg-green-900/30 text-green-400' :
                    scan.status === 'running' ? 'bg-blue-900/30 text-blue-400' :
                    'bg-gray-800 text-gray-400'
                  }`}>{scan.status}</span>
                  {scan.failedTests > 0 && (
                    <span className="text-xs text-red-400">{scan.failedTests} findings</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
