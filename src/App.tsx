import { Routes, Route } from 'react-router-dom'
import AppLayout from './components/Layout/AppLayout'
import Dashboard from './components/Dashboard/Dashboard'
import SpecImport from './components/SpecImport/SpecImport'
import Roles from './components/Roles/Roles'
import ScanMatrix from './components/ScanMatrix/ScanMatrix'
import Results from './components/Results/Results'
import Evidence from './components/Evidence/Evidence'
import Reports from './components/Reports/Reports'

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/specs" element={<SpecImport />} />
        <Route path="/roles" element={<Roles />} />
        <Route path="/scans" element={<ScanMatrix />} />
        <Route path="/scans/:scanId" element={<Results />} />
        <Route path="/scans/:scanId/evidence/:resultId" element={<Evidence />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </AppLayout>
  )
}
