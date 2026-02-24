import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { TrendingUp, Sprout, Thermometer, FlaskConical, CloudRain, Wind, Globe, Calendar } from 'lucide-react';
import { api } from '../utils/api';

interface YieldPredictionProps {
  onLogout: () => void;
}

export default function YieldPrediction({ onLogout }: YieldPredictionProps) {
  const [formData, setFormData] = useState({
    country: '',
    crop: '',
    year: new Date().getFullYear().toString(),
    rainfall: '',
    pesticides: '',
    temperature: '',
  });

  const [countries, setCountries] = useState<string[]>([]);
  const [crops, setCrops] = useState<string[]>([]);
  const [loadingMetadata, setLoadingMetadata] = useState(true);

  const [predictionResult, setPredictionResult] = useState<{
    prediction: {
      yield_hg_ha: number;
      yield_tonnes_ha: number;
      yield_kg_ha: number;
      confidence_interval: {
        lower: number;
        upper: number;
        unit: string;
      };
    };
    model_metrics: {
      r2_score: number;
      mae: number;
      rmse: number;
    };
    contributingFactors: Array<{
      name: string;
      value: string;
      impact: string;
      importance: string;
      recommendation: string;
    }>;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load countries and crops on component mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/yield/metadata');
        const data = await response.json();
        setCountries(data.countries);
        setCrops(data.crops);
        setLoadingMetadata(false);
      } catch (err) {
        console.error('Error loading metadata:', err);
        setError('Failed to load countries and crops');
        setLoadingMetadata(false);
      }
    };
    fetchMetadata();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const predictYield = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.predictYield({
        country: formData.country,
        crop: formData.crop,
        year: parseInt(formData.year),
        rainfall: parseFloat(formData.rainfall),
        pesticides: parseFloat(formData.pesticides),
        temperature: parseFloat(formData.temperature),
      });

      setPredictionResult(response);
    } catch (err: any) {
      setError(err.message || 'Failed to predict yield');
      setPredictionResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.country || !formData.crop || !formData.year || !formData.rainfall || !formData.pesticides || !formData.temperature) {
      setError('Please fill in all fields');
      return;
    }
    predictYield();
  };

  return (
    <Layout onLogout={onLogout}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-agri bg-clip-text text-transparent mb-2">
            Crop Yield Prediction
          </h1>
          <p className="text-gray-600 text-lg">
            Predict crop yield using AI-powered analysis based on historical data
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-green-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Sprout className="text-green-600" />
              Input Parameters
            </h2>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {loadingMetadata ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading data...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Country Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-green-600" />
                    Country
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="">Select a country</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Crop Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Sprout className="w-4 h-4 text-green-600" />
                    Crop Type
                  </label>
                  <select
                    name="crop"
                    value={formData.crop}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="">Select a crop</option>
                    {crops.map((crop) => (
                      <option key={crop} value={crop}>
                        {crop}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-green-600" />
                    Year
                  </label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    min="1990"
                    max="2030"
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                {/* Average Rainfall */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <CloudRain className="w-4 h-4 text-green-600" />
                    Average Rainfall (mm/year)
                  </label>
                  <input
                    type="number"
                    name="rainfall"
                    value={formData.rainfall}
                    onChange={handleChange}
                    min="0"
                    max="5000"
                    step="0.1"
                    placeholder="e.g., 1200"
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                {/* Pesticides */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-green-600" />
                    Pesticides (tonnes)
                  </label>
                  <input
                    type="number"
                    name="pesticides"
                    value={formData.pesticides}
                    onChange={handleChange}
                    min="0"
                    max="500000"
                    step="0.1"
                    placeholder="e.g., 5000"
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                {/* Average Temperature */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-green-600" />
                    Average Temperature (°C)
                  </label>
                  <input
                    type="number"
                    name="temperature"
                    value={formData.temperature}
                    onChange={handleChange}
                    min="-10"
                    max="50"
                    step="0.1"
                    placeholder="e.g., 25"
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-lime-500 text-white font-bold py-4 px-6 rounded-xl hover:from-green-700 hover:to-lime-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Predicting...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-5 h-5" />
                      Predict Yield
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Results Display - Right Column */}
          <div className="space-y-6">
            {predictionResult ? (
              <>
                {/* Main Prediction Card */}
                <div className="bg-gradient-to-br from-green-50 to-lime-50 rounded-2xl shadow-xl p-8 border-2 border-green-200">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Predicted Yield</h3>
                    <div className="text-6xl font-bold bg-gradient-agri bg-clip-text text-transparent">
                      {predictionResult.prediction.yield_tonnes_ha.toFixed(2)}
                    </div>
                    <p className="text-xl text-gray-600 mt-2">tonnes per hectare</p>
                    <p className="text-sm text-gray-500 mt-1">
                      ({predictionResult.prediction.yield_kg_ha.toFixed(0)} kg/ha)
                    </p>
                  </div>

                  {/* Confidence Interval */}
                  <div className="bg-white/70 rounded-xl p-4 mb-6">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Confidence Interval (95%):</p>
                    <div className="flex items-center justify-center gap-4 text-lg">
                      <span className="text-gray-600">
                        {predictionResult.prediction.confidence_interval.lower.toFixed(2)}
                      </span>
                      <span className="text-gray-400">-</span>
                      <span className="text-gray-600">
                        {predictionResult.prediction.confidence_interval.upper.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {predictionResult.prediction.confidence_interval.unit}
                      </span>
                    </div>
                  </div>

                  {/* Model Metrics */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white/70 rounded-xl p-4 text-center">
                      <p className="text-sm text-gray-600 mb-1">R² Score</p>
                      <p className="text-2xl font-bold text-green-600">
                        {(predictionResult.model_metrics.r2_score * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-white/70 rounded-xl p-4 text-center">
                      <p className="text-sm text-gray-600 mb-1">MAE</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {predictionResult.model_metrics.mae.toFixed(0)}
                      </p>
                    </div>
                    <div className="bg-white/70 rounded-xl p-4 text-center">
                      <p className="text-sm text-gray-600 mb-1">RMSE</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {predictionResult.model_metrics.rmse.toFixed(0)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contributing Factors */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-green-100">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Wind className="text-green-600" />
                    Contributing Factors
                  </h3>
                  <div className="space-y-4">
                    {predictionResult.contributingFactors.map((factor, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-r from-green-50 to-lime-50 rounded-xl p-4 border border-green-200"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-800">{factor.name}</h4>
                            <p className="text-sm text-gray-600">{factor.value}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                              {factor.importance}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{factor.recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              /* Placeholder when no prediction */
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-green-100 h-full min-h-[400px] flex flex-col items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-lime-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <TrendingUp className="w-12 h-12 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">Yield Prediction Results</h3>
                  <p className="text-gray-600 mb-6 max-w-sm">
                    Fill in the parameters on the left and click "Predict Yield" to see AI-powered crop yield predictions.
                  </p>
                  <div className="space-y-3 text-left bg-green-50 rounded-xl p-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">You will receive:</p>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Predicted yield in tonnes per hectare
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        95% confidence interval
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Model accuracy metrics
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Contributing factors analysis
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );


}
