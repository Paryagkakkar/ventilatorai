import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import PatientForm from './components/PatientForm';
import PatientList from './components/PatientList';
import Recommendation from './components/Recommendation';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <nav style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)', color: 'white', padding: '20px 40px', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '40px' }}>🫁</span>
              <h1 style={{ fontSize: '26px', fontWeight: '700' }}>VentAI</h1>
            </div>
            <div style={{ display: 'flex', gap: '35px', fontSize: '17px' }}>
              <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Register Patient</Link>
              <Link to="/patients" style={{ color: 'white', textDecoration: 'none' }}>Patient List</Link>
              <Link to="/recommendation" style={{ color: 'white', textDecoration: 'none' }}>Doctor Review</Link>
              <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<PatientForm />} />
          <Route path="/patients" element={<PatientList />} />
          <Route path="/recommendation" element={<Recommendation />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;