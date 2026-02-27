import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Sprout, 
  CloudRain, 
  Droplets, 
  TrendingUp, 
  Gamepad2, 
  Package, 
  User, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import { auth } from '../utils/api';

interface LayoutProps {
  children: ReactNode;
  onLogout: () => void;
}

export default function Layout({ children, onLogout }: LayoutProps) {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    // Get user data from localStorage
    const userData = auth.getUser();
    setUser(userData);
  }, []);

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/crop-recommendation', icon: Sprout, label: 'Crop Recommendation' },
    { path: '/weather-forecast', icon: CloudRain, label: 'Weather Forecast' },
    { path: '/irrigation-predictor', icon: Droplets, label: 'Irrigation Predictor' },
    { path: '/yield-prediction', icon: TrendingUp, label: 'Yield Prediction' },
    { path: '/farming-game', icon: Gamepad2, label: 'Farming Game' },
    { path: '/inventory', icon: Package, label: 'Inventory' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-agriculture-50/30 via-white to-green-50/30">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-gradient-agri text-white p-2.5 rounded-xl shadow-agri hover:scale-110 transition-transform"
      >
        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white/95 backdrop-blur-md shadow-2xl transition-transform duration-300 z-40 border-r border-agriculture-100 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-agriculture-100 bg-gradient-to-br from-agriculture-50 to-green-50">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-agri p-2.5 rounded-xl shadow-agri">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-agri bg-clip-text text-transparent">AgriSmart</span>
              <p className="text-xs text-gray-600">Learning Platform</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-180px)]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                  isActive
                    ? 'bg-gradient-agri text-white shadow-agri'
                    : 'text-gray-700 hover:bg-agriculture-50 hover:translate-x-1'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? '' : 'group-hover:text-agriculture-600'}`} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-agriculture-100 bg-white/80 backdrop-blur-sm">
          <button
            onClick={onLogout}
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 w-full transition-all duration-300 hover:shadow-md group"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen flex flex-col">
        <Header user={user} />
        <div className="flex-1 p-6 lg:p-8">
          {children}
        </div>
        <Footer />
      </main>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
