import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Analyze from './pages/Analyze';
import Results from './pages/Results';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <div className="app-container bg-brown min-h-screen flex justify-center">
        <div className="relative w-full max-w-[430px] bg-brown shadow-2xl">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/analyze" element={<Analyze />} />
            <Route path="/results" element={<Results />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
          <BottomNav />
        </div>
      </div>
    </Router>
  );
}
