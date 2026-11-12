import { RadarPage } from './pages/RadarPage'
import { useDeployedVersion } from './hooks/useDeployedVersion'

function App() {
  useDeployedVersion()
  return <RadarPage />
}

export default App
