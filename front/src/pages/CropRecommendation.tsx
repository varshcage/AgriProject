import { useState } from 'react';
import Layout from '../components/Layout';
import { 
  Sprout, 
  Thermometer, 
  Droplets, 
  FlaskConical,
  Loader2,
  TrendingUp,
  Cloud,
  Leaf,
  AlertCircle
} from 'lucide-react';
import { api, CropRecommendationData, CropRecommendationResponse } from '../utils/api';

interface CropRecommendationProps {
  onLogout: () => void;
}

interface CropRecommendation {
  name: string;
  probability: number;
  reason: string;
  suitableSeasons: string[];
  waterRequirement: string;
  soilType: string;
  description: string;
  confidence: string;
}

export default function CropRecommendation({ onLogout }: CropRecommendationProps) {
  const [formData, setFormData] = useState({
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    temperature: '',
    humidity: '',
    ph: '',
    rainfall: '',
    location: '',
  });

  const [recommendations, setRecommendations] = useState<CropRecommendation[]>([]);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateInputs();
    if (errors.length > 0) {
      setError(errors.join("\n"));
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const requestData: CropRecommendationData = {
        nitrogen: parseFloat(formData.nitrogen),
        phosphorus: parseFloat(formData.phosphorus),
        potassium: parseFloat(formData.potassium),
        temperature: parseFloat(formData.temperature),
        humidity: parseFloat(formData.humidity),
        ph: parseFloat(formData.ph),
        rainfall: parseFloat(formData.rainfall),
      };

      const response: CropRecommendationResponse = await api.getCropRecommendations(requestData);
      
      setRecommendations(response.recommendations);
      setAiInsights(response.ai_insights);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while getting recommendations');
      setRecommendations([]);
      setAiInsights([]);
    } finally {
      setIsLoading(false);
    }
  };

  const validateInputs = () => {
    const errors = [];
    const numNitrogen = parseFloat(formData.nitrogen);
    const numPhosphorus = parseFloat(formData.phosphorus);
    const numPotassium = parseFloat(formData.potassium);
    const numTemperature = parseFloat(formData.temperature);
    const numHumidity = parseFloat(formData.humidity);
    const numPh = parseFloat(formData.ph);
    const numRainfall = parseFloat(formData.rainfall);

    if (isNaN(numNitrogen) || numNitrogen < 0 || numNitrogen > 140) errors.push("Nitrogen (N) should be between 0-140 kg/ha");
    if (isNaN(numPhosphorus) || numPhosphorus < 5 || numPhosphorus > 145) errors.push("Phosphorus (P) should be between 5-145 kg/ha");
    if (isNaN(numPotassium) || numPotassium < 5 || numPotassium > 205) errors.push("Potassium (K) should be between 5-205 kg/ha");
    if (isNaN(numTemperature) || numTemperature < 8.8 || numTemperature > 43.7) errors.push("Temperature should be between 8.8-43.7°C");
    if (isNaN(numHumidity) || numHumidity < 14.3 || numHumidity > 99.9) errors.push("Humidity should be between 14.3-99.9%");
    if (isNaN(numPh) || numPh < 3.5 || numPh > 9.9) errors.push("pH should be between 3.5-9.9");
    if (isNaN(numRainfall) || numRainfall < 20 || numRainfall > 298) errors.push("Rainfall should be between 20-298 mm");

    return errors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const clearResults = () => {
    setRecommendations([]);
    setAiInsights([]);
    setError(null);
  };

  const getConfidenceColor = (probability: number) => {
    if (probability > 85) return "text-green-600";
    if (probability > 70) return "text-yellow-600";
    return "text-orange-600";
  };

  return (
    <Layout onLogout={onLogout}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-green-100">
              <Sprout className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Smart Crop Recommendation System</h1>
              <p className="text-gray-600">AI-powered crop suggestions based on soil and weather conditions</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Soil & Climate Parameters</h2>
            <p className="text-gray-500 text-sm mb-6">Enter your agricultural conditions for analysis</p>
            
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-red-800 font-medium mb-1">Error</h4>
                  <p className="text-red-700 text-sm whitespace-pre-line">{error}</p>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FlaskConical className="h-4 w-4" />
                    Nitrogen (N)
                  </label>
                  <input
                    type="number"
                    name="nitrogen"
                    value={formData.nitrogen}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="90"
                    min="0"
                    max="140"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">0-140 kg/ha</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FlaskConical className="h-4 w-4" />
                    Phosphorus (P)
                  </label>
                  <input
                    type="number"
                    name="phosphorus"
                    value={formData.phosphorus}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="42"
                    min="5"
                    max="145"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">5-145 kg/ha</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FlaskConical className="h-4 w-4" />
                    Potassium (K)
                  </label>
                  <input
                    type="number"
                    name="potassium"
                    value={formData.potassium}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="43"
                    min="5"
                    max="205"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">5-205 kg/ha</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Thermometer className="h-4 w-4" />
                    Temperature (°C)
                  </label>
                  <input
                    type="number"
                    name="temperature"
                    value={formData.temperature}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="25"
                    min="8.8"
                    max="43.7"
                    step="0.1"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">8.8-43.7°C</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Cloud className="h-4 w-4" />
                    Humidity (%)
                  </label>
                  <input
                    type="number"
                    name="humidity"
                    value={formData.humidity}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="80"
                    min="14.3"
                    max="99.9"
                    step="0.1"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">14.3-99.9%</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Soil pH Level
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="ph"
                    value={formData.ph}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="6.5"
                    min="3.5"
                    max="9.9"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">3.5-9.9 pH</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Droplets className="h-4 w-4" />
                    Rainfall (mm)
                  </label>
                  <input
                    type="number"
                    name="rainfall"
                    value={formData.rainfall}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="202"
                    min="20"
                    max="298"
                    step="0.1"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">20-298 mm</p>
                </div>
              </div>



              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition duration-200 shadow-lg flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4" />
                    Get AI Recommendations
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">AI Recommendations</h2>
            <p className="text-gray-500 text-sm mb-6">Top crop suggestions based on your parameters</p>
            
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="h-16 w-16 mx-auto mb-4 animate-spin text-green-600" />
                <p className="text-gray-500">Analyzing soil and climate data...</p>
              </div>
            ) : recommendations.length === 0 ? (
              <div className="text-center py-12">
                <Sprout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-6">
                  Enter your farm data to get AI-powered crop recommendations
                </p>
                <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-left">
                  <h4 className="font-medium text-gray-900 mb-2">Example Inputs:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• N: 90, P: 42, K: 43 (Medium fertility)</li>
                    <li>• Temperature: 25-30°C (Tropical)</li>
                    <li>• Humidity: 70-80%, Rainfall: 150-250mm</li>
                    <li>• pH: 6.0-7.5 (Neutral to slightly acidic)</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-500">
                    Showing {recommendations.length} recommended crops
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={clearResults}
                      className="text-sm text-gray-600 hover:text-gray-800 underline"
                    >
                      Clear results
                    </button>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-gray-600">High confidence</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span className="text-gray-600">Medium</span>
                      </div>
                    </div>
                  </div>
                </div>

                {recommendations.map((crop, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-300 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-green-100">
                          <Sprout className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{crop.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              <span className={`text-sm font-medium ${getConfidenceColor(crop.probability)}`}>
                                {crop.probability}% match
                              </span>
                            </div>
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                              {crop.waterRequirement} water
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3 ml-11">
                      {crop.reason}
                    </p>

                    <div className="grid grid-cols-2 gap-3 mt-4 ml-11">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Suitable Seasons</p>
                        <div className="flex flex-wrap gap-1">
                          {crop.suitableSeasons.map((season, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded"
                            >
                              {season}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Soil Type</p>
                        <p className="text-sm font-medium text-gray-700">{crop.soilType}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3 ml-11">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${crop.probability}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">AI Insights</h4>
                  {aiInsights.length > 0 ? (
                    <ul className="space-y-2">
                      {aiInsights.map((insight, index) => (
                        <li key={index} className="text-blue-800 text-sm flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-blue-800 text-sm">
                      Based on your soil nutrient levels and climate conditions, rice cultivation 
                      shows the highest success probability. Consider crop rotation with wheat for 
                      better soil health.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* How It Works Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">How It Works</h2>
          <p className="text-gray-500 text-sm mb-6">Our AI model analyzes multiple parameters to suggest optimal crops</p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <FlaskConical className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold text-gray-900">Soil Nutrients</h4>
              </div>
              <p className="text-sm text-gray-600">
                N, P, K levels determine soil fertility and crop suitability
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <Thermometer className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold text-gray-900">Climate Factors</h4>
              </div>
              <p className="text-sm text-gray-600">
                Temperature and humidity affect crop growth cycles
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold text-gray-900">Water Availability</h4>
              </div>
              <p className="text-sm text-gray-600">
                Rainfall patterns influence irrigation needs
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <Leaf className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold text-gray-900">Soil Chemistry</h4>
              </div>
              <p className="text-sm text-gray-600">
                pH level affects nutrient availability
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}