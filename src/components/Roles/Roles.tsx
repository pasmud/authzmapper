import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { Role } from '../../types'
import { redactValue } from '../../utils/redact'

export default function Roles() {
  const [roles, setRoles] = useState<Role[]>([])
  const [editingRole, setEditingRole] = useState<number | null>(null)
  const [tokenValue, setTokenValue] = useState('')
  const [tokenType, setTokenType] = useState('bearer')

  useEffect(() => { loadRoles() }, [])

  async function loadRoles() {
    try {
      const data = await api.getRoles()
      setRoles(data)
    } catch { /* ignore */ }
  }

  async function handleSaveToken(roleId: number) {
    if (!tokenValue.trim()) return
    try {
      await api.setToken(roleId, tokenType, tokenValue)
      setTokenValue('')
      setEditingRole(null)
      await loadRoles()
    } catch { /* ignore */ }
  }

  async function handleDeleteToken(roleId: number) {
    try {
      await api.deleteToken(roleId)
      await loadRoles()
    } catch { /* ignore */ }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Test Roles</h2>
        <p className="text-gray-400 text-sm">
          Configure authentication tokens for each test role. Tokens are stored locally and redacted in reports.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((role) => (
          <div key={role.id} className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-lg">{role.name}</h3>
                <p className="text-sm text-gray-500">{role.description}</p>
              </div>
              {role.tokens && role.tokens.length > 0 && (
                <div className="text-xs text-green-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                  Token configured
                </div>
              )}
            </div>

            <div className="space-y-2">
              {role.tokens && role.tokens.length > 0 && (
                <div className="text-sm">
                  <span className="text-gray-500">Token: </span>
                  <span className="font-mono text-xs text-gray-300">{redactValue(role.tokens[0].value)}</span>
                  {role.tokens[0].headerName && (
                    <span className="text-gray-500 ml-2">via {role.tokens[0].headerName}</span>
                  )}
                </div>
              )}

              {editingRole === role.id ? (
                <div className="space-y-2">
                  <select
                    value={tokenType}
                    onChange={e => setTokenType(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded px-2 py-1.5 text-sm"
                  >
                    <option value="bearer">Bearer Token</option>
                    <option value="header">Custom Header</option>
                  </select>
                  <input
                    type="password"
                    value={tokenValue}
                    onChange={e => setTokenValue(e.target.value)}
                    placeholder="Enter token value..."
                    className="w-full bg-gray-950 border border-gray-800 rounded px-3 py-2 text-sm font-mono"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveToken(role.id)}
                      className="px-3 py-1.5 bg-cyan-700 hover:bg-cyan-600 rounded text-xs font-medium"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => { setEditingRole(null); setTokenValue('') }}
                      className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingRole(role.id)}
                    className="px-3 py-1.5 bg-cyan-700 hover:bg-cyan-600 rounded text-xs font-medium"
                  >
                    {role.tokens && role.tokens.length > 0 ? 'Update Token' : 'Add Token'}
                  </button>
                  {role.tokens && role.tokens.length > 0 && (
                    <button
                      onClick={() => handleDeleteToken(role.id)}
                      className="px-3 py-1.5 bg-red-900/50 hover:bg-red-800/50 rounded text-xs"
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {roles.length === 0 && (
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 text-center">
          <p className="text-gray-500">No roles configured. Run <code className="text-cyan-400">npm run db:seed</code> to create default roles.</p>
        </div>
      )}
    </div>
  )
}
