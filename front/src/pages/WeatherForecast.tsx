import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { 
  CloudRain, Sun, Cloud, Wind, Droplets, Eye, Gauge, 
  Thermometer, Search, AlertCircle, RefreshCw, MapPin,
  Sunrise, Sunset, Calendar, CloudSnow
} from 'lucide-react';
import { api } from '../utils/api';

interface WeatherForecastProps {
  onLogout: () => void;
}

interface CurrentWeather {
  precipitation: number;
  rain: number;
  temp: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  visibility: number;
  pressure: number;
  condition: string;
  icon: string;
  sunrise: number;
  sunset: number;
  uvi: number;
}

interface ForecastDay {
  day: string;
  date: string;
  temp_max: number;
  temp_min: number;
  condition: string;
  icon: string;
  rain: number;
  humidity: number;
  wind_speed: number;
}

interface WeatherData {
  current: CurrentWeather;
  forecast: ForecastDay[];
  location: string;
  lastUpdated: string;
}

export default function WeatherForecast({ onLogout }: WeatherForecastProps) {
  const [location, setLocation] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [defaultLocation] = useState('Colombo'); // Default location
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));

  // Fetch weather on component mount
  useEffect(() => {
    fetchWeather(defaultLocation);
  }, []);

  // Auto-refresh weather every 10 minutes
  useEffect(() => {
    if (!weatherData?.location) return;
    
    const interval = setInterval(() => {
      fetchWeather(weatherData.location);
    }, 10 * 60 * 1000); // 10 minutes
    
    return () => clearInterval(interval);
  }, [weatherData?.location]);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchWeather = async (locationName: string) => {
    setLoading(true);
    setError('');
    
    try {
      const data = await api.getWeatherComplete(locationName, 'metric');
      
      const weatherData: WeatherData = {
        current: {
          ...data.current,
          icon: getWeatherIcon(data.current.icon),
          rain: data.current.rain
        },
        forecast: data.forecast.map((day: any) => ({
          ...day,
          icon: getWeatherIcon(day.icon),
          rain: day.rain_chance,
          humidity: day.humidity_avg,
          wind_speed: day.wind_speed_avg
        })),
        location: data.location,
        lastUpdated: new Date(data.last_updated).toLocaleTimeString()
      };
      
      setWeatherData(weatherData);
      localStorage.setItem('lastLocation', locationName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (iconCode: string) => {
    const iconMap: Record<string, string> = {
      '01d': '☀️', '01n': '🌙',
      '02d': '⛅', '02n': '☁️',
      '03d': '☁️', '03n': '☁️',
      '04d': '☁️', '04n': '☁️',
      '09d': '🌧️', '09n': '🌧️',
      '10d': '🌦️', '10n': '🌧️',
      '11d': '⛈️', '11n': '⛈️',
      '13d': '❄️', '13n': '❄️',
      '50d': '🌫️', '50n': '🌫️'
    };
    return iconMap[iconCode] || '☀️';
  };

  const getWeatherBackground = (condition: string) => {
    const backgrounds: Record<string, string> = {
      'Clear': 'from-blue-400 to-blue-600',
      'Clouds': 'from-gray-400 to-gray-600',
      'Rain': 'from-blue-600 to-gray-700',
      'Thunderstorm': 'from-purple-600 to-gray-800',
      'Snow': 'from-blue-200 to-gray-300',
      'Mist': 'from-gray-300 to-gray-500'
    };
    return backgrounds[condition] || 'from-blue-500 to-blue-600';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim()) {
      fetchWeather(location);
    }
  };

  const refreshWeather = () => {
    if (weatherData?.location) {
      fetchWeather(weatherData.location);
    }
  };

  return (
    <Layout onLogout={onLogout}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Weather Forecast</h1>
            <p className="text-gray-600">Real-time weather predictions for your farm location</p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="flex items-center text-gray-500">
              <Calendar className="w-5 h-5 mr-2" />
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} - {currentTime}</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <div className="relative flex-1">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter city name or coordinates..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <Search className="w-5 h-5 mr-2" />
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
          
          {/* Recent Searches */}
          <div className="flex flex-wrap gap-2 mt-4">
            {['Colombo', 'Galle', 'Kandy', 'Jaffna'].map((city) => (
              <button
                key={city}
                onClick={() => {
                  setLocation(city);
                  fetchWeather(city);
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition duration-200"
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <RefreshCw className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Fetching weather data...</p>
            </div>
          </div>
        ) : weatherData ? (
          <>
            {/* Current Weather Card */}
            <div className={`bg-gradient-to-br ${getWeatherBackground(weatherData.current.condition)} rounded-2xl shadow-xl p-8 mb-8 text-white`}>
              <div className="flex flex-col md:flex-row md:items-start justify-between mb-6">
                <div>
                  <div className="flex items-center mb-2">
                    <MapPin className="w-6 h-6 mr-2" />
                    <h2 className="text-3xl font-bold">{weatherData.location}</h2>
                  </div>
                  <div className="flex items-center space-x-4">
                    <p className="text-xl opacity-90">{weatherData.current.condition}</p>
                    <span className="text-sm opacity-80">Updated: {weatherData.lastUpdated}</span>
                    <button 
                      onClick={refreshWeather}
                      className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition duration-200"
                      title="Refresh"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 flex items-center">
                  <span className="text-6xl font-bold mr-2">{weatherData.current.temp}°</span>
                  <span className="text-5xl">{weatherData.current.icon}</span>
                </div>
              </div>

              {/* Current Weather Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center space-x-3">
                    <Thermometer className="w-8 h-8" />
                    <div>
                      <p className="text-sm opacity-80">Feels Like</p>
                      <p className="text-2xl font-bold">{weatherData.current.feels_like}°C</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center space-x-3">
                    <Droplets className="w-8 h-8" />
                    <div>
                      <p className="text-sm opacity-80">Humidity</p>
                      <p className="text-2xl font-bold">{weatherData.current.humidity}%</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center space-x-3">
                    <Wind className="w-8 h-8" />
                    <div>
                      <p className="text-sm opacity-80">Wind Speed</p>
                      <p className="text-2xl font-bold">{weatherData.current.wind_speed} km/h</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center space-x-3">
                    <Gauge className="w-8 h-8" />
                    <div>
                      <p className="text-sm opacity-80">Pressure</p>
                      <p className="text-2xl font-bold">{weatherData.current.pressure} hPa</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Metrics */}
              <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white bg-opacity-10 rounded-lg p-3 flex items-center space-x-2">
                  <Eye className="w-5 h-5" />
                  <span>Visibility: {weatherData.current.visibility} km</span>
                </div>
                <div className="bg-white bg-opacity-10 rounded-lg p-3 flex items-center space-x-2">
                  <CloudRain className="w-5 h-5" />
                  <span>Rain: {weatherData.current.rain} mm</span>
                </div>
                <div className="bg-white bg-opacity-10 rounded-lg p-3 flex items-center space-x-2">
                  <Sunrise className="w-5 h-5" />
                  <span>Sunrise: {new Date(weatherData.current.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="bg-white bg-opacity-10 rounded-lg p-3 flex items-center space-x-2">
                  <Sunset className="w-5 h-5" />
                  <span>Sunset: {new Date(weatherData.current.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>

            {/* Forecast and Farming Advice Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* 7-Day Forecast */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">7-Day Forecast</h2>
                    <Calendar className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="space-y-3">
                    {weatherData.forecast.map((day, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition duration-200"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="text-3xl">{day.icon}</div>
                          <div>
                            <p className="font-semibold text-gray-900">{day.day}</p>
                            <p className="text-sm text-gray-500">{day.date}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{day.condition}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="flex items-center space-x-2 text-blue-600">
                            <Droplets className="w-4 h-4" />
                            <span>{day.rain}%</span>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-gray-900">{day.temp_max}°</p>
                            <p className="text-sm text-gray-500">{day.temp_min}°</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Farming Advice */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
                  <h3 className="text-xl font-bold mb-4">Farming Recommendations</h3>
                  <ul className="space-y-3">
                    {weatherData.current.rain > 5 ? (
                      <>
                        <li className="flex items-start">
                          <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                          <span>High rain expected - Delay irrigation and pesticide application</span>
                        </li>
                        <li className="flex items-start">
                          <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Ensure proper drainage to prevent waterlogging</span>
                        </li>
                      </>
                    ) : weatherData.current.temp > 30 ? (
                      <>
                        <li className="flex items-start">
                          <Sun className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                          <span>High temperatures - Increase irrigation frequency</span>
                        </li>
                        <li className="flex items-start">
                          <Sun className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Water crops early morning or late evening</span>
                        </li>
                      </>
                    ) : (
                      <>
                        <li className="flex items-start">
                          <Cloud className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Ideal conditions for fieldwork and planting</span>
                        </li>
                        <li className="flex items-start">
                          <Cloud className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Good time for fertilizer application</span>
                        </li>
                      </>
                    )}
                    <li className="flex items-start">
                      <Wind className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Wind speed {weatherData.current.wind_speed} km/h - Suitable for spraying</span>
                    </li>
                  </ul>
                </div>

                {/* Weather Alerts */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Weather Alerts</h3>
                  <div className="space-y-3">
                    {weatherData.current.uvi > 8 && (
                      <div className="flex items-start p-3 bg-yellow-50 rounded-lg">
                        <Sun className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-800">High UV Index</p>
                          <p className="text-sm text-yellow-600">Take precautions for outdoor work</p>
                        </div>
                      </div>
                    )}
                    {weatherData.current.rain > 10 && (
                      <div className="flex items-start p-3 bg-blue-50 rounded-lg">
                        <CloudRain className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-800">Heavy Rain Expected</p>
                          <p className="text-sm text-blue-600">Prepare drainage systems</p>
                        </div>
                      </div>
                    )}
                    {weatherData.current.temp < 10 && (
                      <div className="flex items-start p-3 bg-blue-50 rounded-lg">
                        <CloudSnow className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-800">Low Temperature Alert</p>
                          <p className="text-sm text-blue-600">Protect sensitive crops</p>
                        </div>
                      </div>
                    )}
                    {!weatherData.current.uvi && !(weatherData.current.precipitation > 70) && !(weatherData.current.temp < 10) && (
                      <p className="text-gray-500 text-center py-4">No active weather alerts</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Cloud className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Weather Data</h3>
            <p className="text-gray-500 mb-4">Enter a location to view weather forecast</p>
            <button
              onClick={() => fetchWeather(defaultLocation)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition duration-200"
            >
              Load Default Location
            </button>
          </div>
        )}

        {/* API Attribution */}
        {weatherData && (
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Weather data provided by OpenWeatherMap API</p>
          </div>
        )}
      </div>
    </Layout>
  );
}