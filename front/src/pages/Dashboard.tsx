import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  Sprout, 
  CloudRain, 
  Droplets, 
  TrendingUp, 
  Gamepad2, 
  ShoppingCart, 
  Package, 
  Users,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Activity
} from 'lucide-react';
import { api } from '../utils/api';

interface DashboardProps {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activities, setActivities] = useState<any[]>([]);

  const slides = [
    {
      title: 'AI-Powered Crop Recommendations',
      description: 'Get intelligent suggestions for the best crops to grow based on your soil and climate conditions',
      image: '🌾',
      color: 'from-green-500 to-emerald-600'
    },
    {
      title: 'Smart Weather Forecasting',
      description: 'Plan your farming activities with accurate 7-day weather predictions',
      image: '🌤️',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      title: 'Optimize Your Irrigation',
      description: 'Save water and increase yields with AI-driven irrigation recommendations',
      image: '💧',
      color: 'from-cyan-500 to-blue-600'
    },
    {
      title: 'Predict Crop Yields',
      description: 'Forecast your harvest with machine learning-powered yield predictions',
      image: '📊',
      color: 'from-purple-500 to-pink-600'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await api.getActivities();
        setActivities(response.activities);
      } catch (error) {
        console.error('Failed to fetch activities:', error);
      }
    };

    fetchActivities();
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };
  const features = [
    {
      title: 'Crop Recommendation',
      description: 'AI-powered crop suggestions based on soil and climate data',
      icon: Sprout,
      color: 'bg-green-500',
      path: '/crop-recommendation'
    },
    {
      title: 'Weather Forecast',
      description: 'Real-time weather predictions for better farm planning',
      icon: CloudRain,
      color: 'bg-blue-500',
      path: '/weather-forecast'
    },
    {
      title: 'Irrigation Predictor',
      description: 'Optimize water usage with smart irrigation recommendations',
      icon: Droplets,
      color: 'bg-cyan-500',
      path: '/irrigation-predictor'
    },
    {
      title: 'Yield Prediction',
      description: 'Forecast crop yields using machine learning models',
      icon: TrendingUp,
      color: 'bg-purple-500',
      path: '/yield-prediction'
    },
    {
      title: 'Farm Simulator',
      description: 'Practice farming techniques in a virtual environment',
      icon: Gamepad2,
      color: 'bg-orange-500',
      path: '/farming-simulator'
    },
    {
      title: 'Marketplace',
      description: 'Buy and sell agricultural products online',
      icon: ShoppingCart,
      color: 'bg-pink-500',
      path: '/marketplace'
    },
    {
      title: 'Inventory',
      description: 'Manage your farm inventory and resources',
      icon: Package,
      color: 'bg-yellow-500',
      path: '/inventory'
    },
  ];

  const stats = [
    { label: 'Active Crops', value: '12', icon: Sprout, color: 'text-green-600' },
    { label: 'Predictions Made', value: '48', icon: TrendingUp, color: 'text-purple-600' },
    { label: 'Marketplace Items', value: '24', icon: ShoppingCart, color: 'text-pink-600' },
    { label: 'Students Enrolled', value: '1,234', icon: Users, color: 'text-blue-600' },
  ];

  return (
    <Layout onLogout={onLogout}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-agri bg-clip-text text-transparent mb-2 animate-fade-in">Welcome to AgriSmart</h1>
          <p className="text-gray-600 text-lg animate-fade-in" style={{ animationDelay: '0.1s' }}>Your AI-powered agriculture learning platform 🌱</p>
        </div>

        {/* Hero Carousel */}
        <div className="relative mb-8 overflow-hidden rounded-3xl shadow-2xl border border-agriculture-100">
          <div className="relative h-80 md:h-96">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                  index === currentSlide
                    ? 'opacity-100 translate-x-0'
                    : index < currentSlide
                    ? 'opacity-0 -translate-x-full'
                    : 'opacity-0 translate-x-full'
                }`}
              >
                <div className={`w-full h-full bg-gradient-to-r ${slide.color} flex items-center justify-center text-white p-8 md:p-12 relative overflow-hidden`}>
                  {/* Decorative background pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 text-9xl">🌿</div>
                    <div className="absolute bottom-10 right-10 text-9xl">🍃</div>
                  </div>
                  <div className="max-w-3xl text-center relative z-10">
                    <div className="text-8xl mb-6 animate-bounce drop-shadow-lg">{slide.image}</div>
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 animate-fade-in drop-shadow-md">{slide.title}</h2>
                    <p className="text-lg md:text-xl opacity-95 animate-fade-in drop-shadow-sm" style={{ animationDelay: '0.2s' }}>
                      {slide.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/40 hover:bg-white/60 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-md hover:scale-110 shadow-lg"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/40 hover:bg-white/60 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-md hover:scale-110 shadow-lg"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'bg-white w-8 shadow-md'
                    : 'bg-white/50 hover:bg-white/75 w-2'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index} 
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft p-6 hover:shadow-agri transition-all duration-300 hover:-translate-y-2 animate-fade-in border border-agriculture-100 group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="relative">
                    <div className={`p-3 rounded-xl ${stat.color.replace('text-', 'bg-')}/10 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-7 h-7 ${stat.color}`} />
                    </div>
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${stat.color.replace('text-', 'bg-')} opacity-75`}></span>
                      <span className={`relative inline-flex rounded-full h-3 w-3 ${stat.color.replace('text-', 'bg-')}`}></span>
                    </span>
                  </div>
                </div>
                <p className="text-3xl font-bold bg-gradient-agri bg-clip-text text-transparent mb-1">{stat.value}</p>
                <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Features Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-agri bg-clip-text text-transparent">Platform Features</h2>
            <span className="text-sm text-gray-500">Click to explore →</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={index}
                  to={feature.path}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft p-6 hover:shadow-agri transition-all duration-300 group hover:-translate-y-2 border border-agriculture-100/50 overflow-hidden relative"
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-agri opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                  
                  <div className="relative z-10">
                    <div className={`${feature.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-agriculture-700 transition-colors">{feature.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">{feature.description}</p>
                    <div className="flex items-center text-agriculture-600 font-semibold group-hover:translate-x-2 transition-transform">
                      <span>Explore Now</span>
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:ml-2 transition-all" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold bg-gradient-agri bg-clip-text text-transparent mb-6">Recent Activities</h2>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft p-6 border border-agriculture-100">
            {activities.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-agriculture-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-10 h-10 text-agriculture-500" />
                </div>
                <p className="text-gray-600 font-medium">No recent activities yet</p>
                <p className="text-gray-500 text-sm mt-1">Start exploring our features to see your activity history!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-gradient-to-r from-agriculture-50/50 to-green-50/50 rounded-xl hover:shadow-md transition-all duration-300 border border-agriculture-100/50">
                    <div className="flex-shrink-0">
                      <div className="bg-gradient-agri w-10 h-10 rounded-xl flex items-center justify-center shadow-agri">
                        <Sprout className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {activity.type === 'crop_recommendation' ? 'Crop Recommendation' : activity.type}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {activity.type === 'crop_recommendation' 
                          ? `Recommended ${activity.data.recommendations[0]?.name} with ${activity.data.recommendations[0]?.probability}% confidence`
                          : 'Activity performed'
                        }
                      </p>
                      <p className="text-xs text-gray-500 mt-2 flex items-center">
                        <span className="w-1.5 h-1.5 bg-agriculture-500 rounded-full mr-2"></span>
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Tips */}
        <div className="bg-gradient-agri rounded-2xl shadow-agri p-8 text-white relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 text-9xl opacity-10">🌾</div>
          <div className="absolute bottom-0 left-0 text-9xl opacity-10">💡</div>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Sprout className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold">💡 Quick Tip of the Day</h2>
            </div>
            <p className="text-lg opacity-95 leading-relaxed">
              Utilize our <span className="font-semibold underline decoration-white/50">Crop Recommendation system</span> to analyze your soil conditions and get AI-powered 
              suggestions for the most profitable crops for your region!
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
