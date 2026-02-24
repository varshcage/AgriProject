import { useState } from 'react';
import Layout from '../components/Layout';
import { Droplets, Thermometer, Sprout, CloudRain, Percent, AlertTriangle } from 'lucide-react';
import { api, IrrigationPrediction } from '../utils/api';

interface IrrigationPredictorProps {
  onLogout: () => void;
}

export default function IrrigationPredictor({ onLogout }: IrrigationPredictorProps) {
  const [formData, setFormData] = useState({
    cropType: '',
    N: '',
    P: '',
    K: '',
    temperature: '',
    humidity: '',
    ph: '',
    rainfall: '',
  });

  const [prediction, setPrediction] = useState<IrrigationPrediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Supported crops from our model
  const supportedCrops = [
    { value: 'rice', label: 'Rice' },
    { value: 'maize', label: 'Maize' },
    { value: 'chickpea', label: 'Chickpea' },
    { value: 'kidneybeans', label: 'Kidney Beans' },
    { value: 'pigeonpeas', label: 'Pigeon Peas' },
    { value: 'mothbeans', label: 'Moth Beans' },
    { value: 'mungbean', label: 'Mung Bean' },
    { value: 'blackgram', label: 'Black Gram' },
    { value: 'lentil', label: 'Lentil' },
    { value: 'pomegranate', label: 'Pomegranate' },
    { value: 'banana', label: 'Banana' },
    { value: 'mango', label: 'Mango' },
    { value: 'grapes', label: 'Grapes' },
    { value: 'watermelon', label: 'Watermelon' },
    { value: 'muskmelon', label: 'Muskmelon' },
    { value: 'apple', label: 'Apple' },
    { value: 'orange', label: 'Orange' },
    { value: 'papaya', label: 'Papaya' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const numericData = {
        cropType: formData.cropType,
        N: parseFloat(formData.N),
        P: parseFloat(formData.P),
        K: parseFloat(formData.K),
        temperature: parseFloat(formData.temperature),
        humidity: parseFloat(formData.humidity),
        ph: parseFloat(formData.ph),
        rainfall: parseFloat(formData.rainfall),
      };

      const response = await api.predictIrrigation(numericData);
      setPrediction(response);
    } catch (err: any) {
      setError(err.message || 'Failed to calculate irrigation needs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-green-100 text-green-800 border-green-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Critical': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'Low': return '✅';
      case 'Medium': return '⚠️';
      case 'High': return '🔶';
      case 'Critical': return '🚨';
      default: return 'ℹ️';
    }
  };

  return (
    <Layout onLogout={onLogout}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <Droplets className="w-8 h-8 mr-3 text-blue-600" />
            AI Irrigation Need Estimator
          </h1>
          <p className="text-gray-600">
            Predict water deficit and optimize irrigation using machine learning models
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Sprout className="w-5 h-5 mr-2 text-green-600" />
              Crop & Soil Parameters
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Crop Type
                </label>
                <select
                  name="cropType"
                  value={formData.cropType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  required
                >
                  <option value="">Select crop type</option>
                  {supportedCrops.map((crop) => (
                    <option key={crop.value} value={crop.value}>
                      {crop.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    N (mg/kg)
                  </label>
                  <input
                    type="number"
                    name="N"
                    value={formData.N}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="e.g., 60"
                    min="0"
                    max="200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    P (mg/kg)
                  </label>
                  <input
                    type="number"
                    name="P"
                    value={formData.P}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="e.g., 50"
                    min="0"
                    max="200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    K (mg/kg)
                  </label>
                  <input
                    type="number"
                    name="K"
                    value={formData.K}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="e.g., 50"
                    min="0"
                    max="200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Thermometer className="w-4 h-4 mr-2" />
                  Temperature (°C)
                </label>
                <input
                  type="number"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., 25"
                  step="0.1"
                  min="-10"
                  max="50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Percent className="w-4 h-4 mr-2" />
                  Humidity (%)
                </label>
                <input
                  type="number"
                  name="humidity"
                  value={formData.humidity}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., 65"
                  min="0"
                  max="100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Soil pH
                </label>
                <input
                  type="number"
                  name="ph"
                  value={formData.ph}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., 6.5"
                  step="0.1"
                  min="0"
                  max="14"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <CloudRain className="w-4 h-4 mr-2" />
                  Rainfall (mm/month)
                </label>
                <input
                  type="number"
                  name="rainfall"
                  value={formData.rainfall}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., 120"
                  min="0"
                  max="1000"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Calculating...
                  </>
                ) : (
                  'Calculate Irrigation Needs'
                )}
              </button>
            </form>
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            {prediction ? (
              <>
                {/* Water Balance Summary */}
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
                  <h2 className="text-2xl font-bold mb-4">Water Balance Summary</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                      <div>
                        <p className="text-blue-100">Monthly Water Need</p>
                        <p className="text-sm opacity-90">Crop requirement</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{prediction.monthly_water_need_mm} mm</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                      <div>
                        <p className="text-blue-100">Rainfall Received</p>
                        <p className="text-sm opacity-90">Natural precipitation</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{prediction.rainfall_received_mm} mm</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-white/20 rounded-lg border-2 border-white/30">
                      <div>
                        <p className="text-blue-100">Water Deficit</p>
                        <p className="text-sm opacity-90">Irrigation needed</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold">{prediction.water_deficit_mm} mm</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Risk Assessment & Recommendations */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">Risk Assessment</h3>
                    <span className={`px-4 py-2 rounded-full font-semibold border ${getRiskColor(prediction.risk_level)}`}>
                      {getRiskIcon(prediction.risk_level)} {prediction.risk_level} Risk
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="font-semibold text-blue-900 mb-2">📋 Irrigation Schedule</p>
                      <p className="text-blue-800">{prediction.irrigation_schedule}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600">Frequency</p>
                        <p className="font-semibold text-gray-900">{prediction.irrigation_frequency}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600">Next Irrigation</p>
                        <p className="font-semibold text-gray-900">{prediction.next_irrigation}</p>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                      <p className="font-semibold text-green-900 mb-2">💧 Water Saving Potential</p>
                      <p className="text-green-800">
                        Estimated savings: {prediction.estimated_water_saving_potential}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Crop-Specific Advice */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Crop-Specific Advice</h3>
                  <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                    <p className="text-yellow-900">{prediction.crop_specific_notes}</p>
                  </div>
                </div>

                {/* Water Conservation Tips */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <div className="flex items-center mb-4">
                    <AlertTriangle className="w-5 h-5 text-blue-600 mr-2" />
                    <h3 className="text-xl font-semibold text-gray-900">Water Conservation Tips</h3>
                  </div>
                  <ul className="space-y-3">
                    {prediction.water_conservation_tips.map((tip, index) => (
                      <li key={index} className="flex items-start">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                          <span className="text-blue-600 text-sm">💡</span>
                        </div>
                        <p className="text-gray-700">{tip}</p>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <span className="font-semibold">Pro Tip:</span> Monitor soil moisture regularly and adjust irrigation based on real-time conditions.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-200">
                <div className="inline-block p-4 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl mb-4">
                  <Droplets className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Optimize Irrigation</h3>
                <p className="text-gray-600 mb-4">
                  Enter your crop and environmental data to get AI-powered irrigation recommendations
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>✅ Based on machine learning model trained on agricultural data</p>
                  <p>✅ Considers soil nutrients, weather, and crop requirements</p>
                  <p>✅ Provides exact water deficit calculations</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Model Information Footer */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Model Info:</span> This system uses a Random Forest Regressor trained on agricultural data 
            to predict water deficit. Features include soil nutrients (N, P, K), environmental conditions (temperature, humidity, rainfall, pH), 
            and crop-specific water requirements. Accuracy: ±15mm, R²: 0.87
          </p>
        </div>
      </div>
    </Layout>
  );
}