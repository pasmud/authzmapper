import { useState, useEffect, useRef } from 'react'
import { api } from '../../services/api'

interface EndpointDisplay {
  id: number
  path: string
  method: string
  summary: string | null
  authRequired: number
  objectIdParam: string | null
}

export default function SpecImport() {
  const [specs, setSpecs] = useState<any[]>([])
  const [raw, setRaw] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [format, setFormat] = useState<'json' | 'yaml'>('json')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedSpec, setSelectedSpec] = useState<any>(null)
  const [endpoints, setEndpoints] = useState<EndpointDisplay[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { loadSpecs() }, [])

  async function loadSpecs() {
    try {
      const data = await api.getSpecs()
      setSpecs(data)
    } catch { /* ignore */ }
  }

  async function handleImport() {
    if (!raw.trim()) {
      setError('Please enter or paste an OpenAPI spec')
      return
    }
    setLoading(true)
    setError('')
    try {
      await api.createSpec(raw, format, sourceUrl || undefined)
      setRaw('')
      setSourceUrl('')
      await loadSpecs()
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    setRaw(text)
    setFormat(file.name.endsWith('.yaml') || file.name.endsWith('.yml') ? 'yaml' : 'json')
  }

  async function handleDemoImport() {
    setLoading(true)
    setError('')
    try {
      const demoSpec = await api.getDemoSpec()
      await api.createSpec(JSON.stringify(demoSpec), 'json', 'Demo API')
      await loadSpecs()
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  async function viewSpec(id: number) {
    try {
      const data = await api.getSpec(id)
      setSelectedSpec(data.spec)
      setEndpoints(data.endpoints)
    } catch { /* ignore */ }
  }

  async function deleteSpec(id: number) {
    try {
      await api.deleteSpec(id)
      if (selectedSpec?.id === id) { setSelectedSpec(null); setEndpoints([]) }
      await loadSpecs()
    } catch { /* ignore */ }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Import OpenAPI Spec</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <h3 className="font-bold mb-3">Import from File or Paste</h3>

            <div className="mb-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-gray-800 rounded text-sm hover:bg-gray-700 transition-colors"
              >
                Upload File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.yaml,.yml"
                className="hidden"
                onChange={handleFileUpload}
              />
              <span className="ml-3 text-xs text-gray-500">or paste below</span>
            </div>

            <div className="mb-3 flex gap-2">
              <button
                onClick={() => setFormat('json')}
                className={`px-3 py-1 rounded text-xs ${format === 'json' ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-400'}`}
              >
                JSON
              </button>
              <button
                onClick={() => setFormat('yaml')}
                className={`px-3 py-1 rounded text-xs ${format === 'yaml' ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-400'}`}
              >
                YAML
              </button>
            </div>

            <textarea
              value={raw}
              onChange={e => setRaw(e.target.value)}
              placeholder={`Paste your OpenAPI 3.0/3.1 spec here...`}
              className="w-full h-64 bg-gray-950 border border-gray-800 rounded p-3 text-sm font-mono text-gray-300 placeholder-gray-600 focus:outline-none focus:border-cyan-700"
              spellCheck={false}
            />

            <div className="mt-3">
              <input
                type="text"
                value={sourceUrl}
                onChange={e => setSourceUrl(e.target.value)}
                placeholder="Source URL (optional)"
                className="w-full bg-gray-950 border border-gray-800 rounded px-3 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-cyan-700 mb-3"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleImport}
                  disabled={loading}
                  className="px-4 py-2 bg-cyan-700 hover:bg-cyan-600 rounded text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? 'Importing...' : 'Import Spec'}
                </button>
                <button
                  onClick={handleDemoImport}
                  disabled={loading}
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded text-sm font-medium transition-colors disabled:opacity-50"
                >
                  Import Demo API Spec
                </button>
              </div>
            </div>

            {error && <p className="mt-2 text-red-400 text-sm">{error}</p>}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <h3 className="font-bold mb-3">Imported Specs ({specs.length})</h3>
            {specs.length === 0 ? (
              <p className="text-gray-500 text-sm">No specs imported yet.</p>
            ) : (
              <div className="space-y-2">
                {specs.map((spec: any) => (
                  <div key={spec.id} className="bg-gray-950 rounded p-3 border border-gray-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{spec.name}</span>
                        <span className="text-gray-500 text-sm ml-2">v{spec.version}</span>
                        <span className="text-gray-600 text-xs ml-2">{spec.format}</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => viewSpec(spec.id)} className="text-xs text-cyan-400 hover:underline">View</button>
                        <button onClick={() => deleteSpec(spec.id)} className="text-xs text-red-400 hover:underline">Delete</button>
                      </div>
                    </div>
                    {spec.sourceUrl && <p className="text-xs text-gray-600 mt-1">Source: {spec.sourceUrl}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedSpec && (
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <h3 className="font-bold mb-3">
                Endpoints: {selectedSpec.name}
                <span className="text-gray-500 font-normal text-sm ml-2">({endpoints.length} total)</span>
              </h3>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {endpoints.map((ep: EndpointDisplay) => (
                  <div key={ep.id} className="flex items-center gap-2 text-sm py-1">
                    <span className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded w-16 text-center ${
                      ep.method === 'GET' ? 'text-green-400 bg-green-900/20' :
                      ep.method === 'POST' ? 'text-blue-400 bg-blue-900/20' :
                      ep.method === 'PUT' ? 'text-orange-400 bg-orange-900/20' :
                      ep.method === 'DELETE' ? 'text-red-400 bg-red-900/20' :
                      'text-gray-400 bg-gray-800'
                    }`}>{ep.method}</span>
                    <span className="text-gray-300 font-mono text-xs">{ep.path}</span>
                    {ep.authRequired ? <span className="text-xs text-yellow-500">auth</span> : null}
                    {ep.objectIdParam ? <span className="text-xs text-cyan-500">id:{ep.objectIdParam}</span> : null}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
