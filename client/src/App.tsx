import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { MapaPage } from './pages/MapaPage'
import { OperadorPage } from './pages/OperadorPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/mapa" element={<MapaPage />} />
        <Route path="/operador" element={<OperadorPage />} />
      </Route>
    </Routes>
  )
}
