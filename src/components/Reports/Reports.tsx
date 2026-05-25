import { useState, useEffect } from 'react'
import { api } from '../../services/api'

export default function Reports() {
  const [scans, setScans] = useState<any[]>([])

  useEffect(() => {
    api.getScans().then(setScans).catch(() => {})
  }, [])

  async function handleExportMd(scanId: number) {
    try {
      const md = await api.getMarkdownReport(scanId)
      const blob = new Blob([md], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `authzmapper-report-${scanId}.md`
      a.click()
      URL.revokeObjectURL(url)
    } catch { /* ignore */ }
  }

  async function handleExportJson(scanId: number) {
    try {
      const report = await api.getJsonReport(scanId)
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `authzmapper-report-${scanId}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch { /* ignore */ }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Export Reports</h2>
        <p className="text-gray-400 text-sm">
          Download scan reports in Markdown or JSON format.
        </p>
      </div>

      {scans.length === 0 ? (
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 text-center">
          <p className="text-gray-500">No completed scans yet. Run a scan first.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {scans.filter((s: any) => s.status === 'completed').map((scan: any) => (
            <div key={scan.id} className="bg-gray-900 rounded-lg p-4 border border-gray-800 flex items-center justify-between">
              <div>
                <span className="font-medium">{scan.name}</span>
                <span className="text-gray-500 text-sm ml-2">
                  {scan.passedTests}/{scan.totalTests} passed
                </span>
                {scan.failedTests > 0 && (
                  <span className="text-red-400 text-sm ml-2">{scan.failedTests} findings</span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleExportMd(scan.id)}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-xs"
                >
                  Markdown
                </button>
                <button
                  onClick={() => handleExportJson(scan.id)}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-xs"
                >
                  JSON
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
