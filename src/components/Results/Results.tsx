import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { getSeverityColor, getMethodColor } from '../../utils/redact'
import { Finding } from '../../types'

export default function Results() {
  const { scanId } = useParams()
  const navigate = useNavigate()
  const [scan, setScan] = useState<any>(null)
  const [results, setResults] = useState<any[]>([])
  const [findings, setFindings] = useState<Finding[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!scanId) return
    setLoading(true)
    api.getScan(parseInt(scanId)).then(data => {
      setScan(data.scan)
      setResults(data.results)
      setFindings(data.findings)
    }).catch(() => navigate('/scans')).finally(() => setLoading(false))
  }, [scanId, navigate])

  async function handleToggleFix(findingId: number, current: number) {
    if (!scanId) return
    try {
      await api.fixFinding(parseInt(scanId), findingId, !current)
      const data = await api.getScan(parseInt(scanId))
      setFindings(data.findings)
    } catch { /* ignore */ }
  }

  if (loading) return <div className="text-gray-400">Loading...</div>
  if (!scan) return <div className="text-gray-400">Scan not found.</div>

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">{scan.name}</h2>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span>Status: <span className={`font-medium ${
            scan.status === 'completed' ? 'text-green-400' : 'text-yellow-400'
          }`}>{scan.status}</span></span>
          <span>Tests: {scan.totalTests}</span>
          <span>Passed: <span className="text-green-400">{scan.passedTests}</span></span>
          <span>Failed: <span className="text-red-400">{scan.failedTests}</span></span>
          <span>Target: <span className="font-mono text-xs">{scan.targetUrl}</span></span>
        </div>
      </div>

      {findings.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold text-lg mb-3">Findings ({findings.length})</h3>
          <div className="space-y-3">
            {findings.map((f: Finding) => (
              <div key={f.id} className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${getSeverityColor(f.severity)}`}>
                      {f.severity.toUpperCase()}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-300 uppercase">
                      {f.type}
                    </span>
                    <span className="text-sm font-mono">{f.endpoint}</span>
                  </div>
                  <button
                    onClick={() => handleToggleFix(f.id, f.isFixed)}
                    className={`text-xs px-2 py-1 rounded ${
                      f.isFixed ? 'bg-green-900/30 text-green-400' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {f.isFixed ? 'Fixed' : 'Mark Fixed'}
                  </button>
                </div>
                <p className="text-sm text-gray-300 mb-2">{f.description}</p>
                <details className="text-sm">
                  <summary className="text-cyan-400 cursor-pointer hover:underline">Remediation</summary>
                  <p className="mt-2 text-gray-400">{f.remediation}</p>
                </details>
              </div>
            ))}
          </div>
        </div>
      )}

      {findings.length === 0 && scan.status === 'completed' && (
        <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-4 mb-6">
          <p className="text-green-400 font-medium">No findings - all authorization checks passed.</p>
        </div>
      )}

      <div>
        <h3 className="font-bold text-lg mb-3">All Results ({results.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b border-gray-800">
                <th className="text-left py-2 px-2">Method</th>
                <th className="text-left py-2 px-2">Path</th>
                <th className="text-left py-2 px-2">Expected</th>
                <th className="text-left py-2 px-2">Actual</th>
                <th className="text-left py-2 px-2">Finding</th>
                <th className="text-left py-2 px-2">Duration</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r: any) => (
                <tr
                  key={r.id}
                  className="border-b border-gray-800 hover:bg-gray-900 cursor-pointer"
                  onClick={() => navigate(`/scans/${scanId}/evidence/${r.id}`)}
                >
                  <td className={`py-2 px-2 font-mono ${getMethodColor(r.method)}`}>{r.method}</td>
                  <td className="py-2 px-2 font-mono text-gray-300">{r.path}</td>
                  <td className="py-2 px-2">{r.expectedStatus}</td>
                  <td className={`py-2 px-2 ${r.responseStatus >= 400 ? 'text-red-400' : 'text-green-400'}`}>
                    {r.responseStatus}
                  </td>
                  <td className="py-2 px-2">
                    {r.isFinding ? (
                      <span className="text-red-400 text-xs">{r.findingType || 'issue'}</span>
                    ) : (
                      <span className="text-green-500 text-xs">pass</span>
                    )}
                  </td>
                  <td className="py-2 px-2 text-gray-500">{r.durationMs}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
