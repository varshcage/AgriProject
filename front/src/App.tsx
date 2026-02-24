import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CropRecommendation from './pages/CropRecommendation';
import WeatherForecast from './pages/WeatherForecast';
import IrrigationPredictor from './pages/IrrigationPredictor';
import YieldPrediction from './pages/YieldPrediction';
import FarmingSimulator from './pages/FarmingSimulator';
import FarmingSimulatorEnhanced from './pages/FarmingSimulatorEnhanced';
import FarmingGame from './pages/FarmingGame';
import Inventory from './pages/Inventory';
import StudentProfile from './pages/StudentProfile';
import { auth } from './utils/api';

function AppContent() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // On app initialization: clear localStorage tokens but keep sessionStorage tokens
  // This ensures fresh login on new browser session, but maintains session during page refresh
  useEffect(() => {
    const verifyAuth = async () => {
      // Clear any "remember me" tokens from localStorage on app start
      localStorage.removeItem('token');
      localStorage.removeItem('rememberMe');
      
      // Check if there's an active session token (survives page refresh)
      const sessionToken = sessionStorage.getItem('token');
      
      if (!sessionToken) {
        // No session token, user needs to log in
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Verify the session token is still valid
      const isValid = await auth.verifyToken();
      setIsAuthenticated(isValid);
      setIsLoading(false);
    };

    verifyAuth();
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    auth.removeToken();
    navigate('/login');
  };

  // Show loading screen while verifying token
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!isAuthenticated ? <Register onRegister={handleLogin} /> : <Navigate to="/dashboard" />} />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={isAuthenticated ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/login" />} />
      <Route path="/crop-recommendation" element={isAuthenticated ? <CropRecommendation onLogout={handleLogout} /> : <Navigate to="/login" />} />
      <Route path="/weather-forecast" element={isAuthenticated ? <WeatherForecast onLogout={handleLogout} /> : <Navigate to="/login" />} />
      <Route path="/irrigation-predictor" element={isAuthenticated ? <IrrigationPredictor onLogout={handleLogout} /> : <Navigate to="/login" />} />
      <Route path="/yield-prediction" element={isAuthenticated ? <YieldPrediction onLogout={handleLogout} /> : <Navigate to="/login" />} />
      <Route path="/farming-simulator" element={isAuthenticated ? <FarmingSimulatorEnhanced onLogout={handleLogout} /> : <Navigate to="/login" />} />
      <Route path="/farming-simulator-classic" element={isAuthenticated ? <FarmingSimulator onLogout={handleLogout} /> : <Navigate to="/login" />} />
      <Route path="/farming-game" element={isAuthenticated ? <FarmingGame /> : <Navigate to="/login" />} />
      <Route path="/inventory" element={isAuthenticated ? <Inventory onLogout={handleLogout} /> : <Navigate to="/login" />} />
      <Route path="/profile" element={isAuthenticated ? <StudentProfile onLogout={handleLogout} /> : <Navigate to="/login" />} />
      
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
