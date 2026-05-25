import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { getMethodColor } from '../../utils/redact'

export default function Evidence() {
  const { scanId, resultId } = useParams()
  const navigate = useNavigate()
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!scanId || !resultId) return
    setLoading(true)
    api.getScan(parseInt(scanId)).then(data => {
      const r = data.results.find((res: any) => res.id === parseInt(resultId!))
      setResult(r || null)
    }).catch(() => navigate('/scans')).finally(() => setLoading(false))
  }, [scanId, resultId, navigate])

  if (loading) return <div className="text-gray-400">Loading...</div>
  if (!result) return <div className="text-gray-400">Result not found.</div>

  let requestHeaders: Record<string, string> = {}
  let responseHeaders: Record<string, string> = {}
  try { requestHeaders = JSON.parse(result.requestHeaders) } catch {}
  try { responseHeaders = JSON.parse(result.responseHeaders) } catch {}

  return (
    <div>
      <div className="mb-6">
        <button onClick={() => navigate(`/scans/${scanId}`)} className="text-cyan-400 text-sm hover:underline mb-2 block">
          &larr; Back to scan results
        </button>
        <h2 className="text-2xl font-bold mb-2">Evidence</h2>
        <div className="flex items-center gap-2">
          <span className={`font-mono text-sm font-bold ${getMethodColor(result.method)}`}>{result.method}</span>
          <span className="font-mono text-sm text-gray-300">{result.path}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 mb-4">
            <h3 className="font-bold mb-3">Request</h3>
            <div className="mb-3">
              <label className="text-xs text-gray-500 block mb-1">URL</label>
              <div className="bg-gray-950 rounded p-2 text-xs font-mono text-gray-300 break-all">{result.requestUrl}</div>
            </div>
            <div className="mb-3">
              <label className="text-xs text-gray-500 block mb-1">Headers (redacted)</label>
              <div className="bg-gray-950 rounded p-2 text-xs font-mono">
                {Object.entries(requestHeaders).map(([key, val]) => (
                  <div key={key} className="text-gray-400">
                    <span className="text-gray-500">{key}: </span>{val as string}
                  </div>
                ))}
              </div>
            </div>
            {result.requestBody && (
              <div>
                <label className="text-xs text-gray-500 block mb-1">Body</label>
                <pre className="bg-gray-950 rounded p-2 text-xs font-mono text-gray-300 overflow-x-auto">{result.requestBody}</pre>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 mb-4">
            <h3 className="font-bold mb-3">Response</h3>
            <div className="mb-3 flex items-center gap-2">
              <label className="text-xs text-gray-500">Status:</label>
              <span className={`text-lg font-bold ${result.responseStatus >= 400 ? 'text-red-400' : 'text-green-400'}`}>
                {result.responseStatus}
              </span>
              <span className="text-gray-500 text-xs">
                (Expected: {result.expectedStatus})
              </span>
            </div>
            {result.isFinding && (
              <div className="mb-3 bg-red-900/20 border border-red-700/30 rounded p-2">
                <p className="text-sm text-red-400">
                  <strong>{result.findingType?.toUpperCase()}:</strong> {result.findingDesc}
                </p>
              </div>
            )}
            <div className="mb-3">
              <label className="text-xs text-gray-500 block mb-1">Duration</label>
              <span className="text-sm">{result.durationMs}ms</span>
            </div>
            <div className="mb-3">
              <label className="text-xs text-gray-500 block mb-1">Headers (redacted)</label>
              <div className="bg-gray-950 rounded p-2 text-xs font-mono">
                {Object.entries(responseHeaders).map(([key, val]) => (
                  <div key={key} className="text-gray-400">
                    <span className="text-gray-500">{key}: </span>{val as string}
                  </div>
                ))}
              </div>
            </div>
            {result.responseBody && (
              <div>
                <label className="text-xs text-gray-500 block mb-1">Body</label>
                <pre className="bg-gray-950 rounded p-2 text-xs font-mono text-gray-300 overflow-x-auto max-h-64">{result.responseBody}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
