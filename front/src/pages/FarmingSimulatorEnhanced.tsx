import { useState, useEffect } from 'react';
import { farmingSimulatorApi, auth } from '../utils/api';
import Layout from '../components/Layout';
import { 
  Gamepad2, Sprout, Droplets, Sun, TrendingUp, Play, RotateCcw,
  Thermometer, CloudRain, Trophy, Beaker, Zap, Award
} from 'lucide-react';

interface FarmingSimulatorEnhancedProps {
  onLogout: () => void;
}
 
export default function FarmingSimulatorEnhanced({ onLogout }: FarmingSimulatorEnhancedProps) {
  const [field, setField] = useState({
    nitrogen: 50,
    phosphorus: 50,
    potassium: 50,
    pH: 6.5,
    temperature: 25,
    humidity: 70,
    rainfall: 100
  });

  const [gameState, setGameState] = useState({
    money: 10000,
    currentSeason: 1,
    totalScore: 0,
    totalYield: 0,
    cropsGrown: {} as Record<string, number>
  });

  const [loading, setLoading] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const data = await farmingSimulatorApi.getLeaderboard();
      if (data.success) {
        setLeaderboard(data.leaderboard || []);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  const getCropRecommendation = async () => {
    setLoading(true);
    try {
      const data = await farmingSimulatorApi.getRecommendations({
        nitrogen: field.nitrogen,
        phosphorus: field.phosphorus,
        potassium: field.potassium,
        temperature: field.temperature,
        humidity: field.humidity,
        ph: field.pH,
        rainfall: field.rainfall
      });

      if (data.success) {
        setRecommendations(data.recommendations || []);
      }
    } catch (error: any) {
      console.error('Error getting crop recommendation:', error);
      alert(error.message || 'Failed to get recommendation');
    } finally {
      setLoading(false);
    }
  };

  const simulateSeason = async () => {
    setLoading(true);
    setShowResults(false);
    try {
      const data = await farmingSimulatorApi.simulate({
        nitrogen: field.nitrogen,
        phosphorus: field.phosphorus,
        potassium: field.potassium,
        temperature: field.temperature,
        humidity: field.humidity,
        ph: field.pH,
        rainfall: field.rainfall
      });

      if (data.success) {
        const result = data;
        setSimulationResult(result);
        setShowResults(true);
        
        // Update game state
        const yieldValue = result.predicted_yield || 0;
        const gameScore = result.game_score || Math.round(yieldValue / 100);
        
        setGameState(prev => ({
          ...prev,
          currentSeason: prev.currentSeason + 1,
          totalScore: prev.totalScore + gameScore,
          totalYield: prev.totalYield + yieldValue,
          cropsGrown: {
            ...prev.cropsGrown,
            [result.recommended_crop]: (prev.cropsGrown[result.recommended_crop] || 0) + 1
          }
        }));

        // Submit score to leaderboard
        await farmingSimulatorApi.submitScore(
          gameState.totalScore + gameScore,
          Object.keys({...gameState.cropsGrown, [result.recommended_crop]: 1}),
          gameState.totalYield + yieldValue
        );

        // Reload leaderboard
        setTimeout(loadLeaderboard, 1000);
      }
    } catch (error: any) {
      console.error('Error simulating season:', error);
      alert(error.message || 'Failed to simulate season');
    } finally {
      setLoading(false);
    }
  };

  const resetGame = () => {
    setGameState({
      money: 10000,
      currentSeason: 1,
      totalScore: 0,
      totalYield: 0,
      cropsGrown: {}
    });
    setSimulationResult(null);
    setRecommendations([]);
    setShowResults(false);
  };

  const randomizeConditions = () => {
    setField({
      nitrogen: Math.floor(Math.random() * 100) + 20,
      phosphorus: Math.floor(Math.random() * 100) + 20,
      potassium: Math.floor(Math.random() * 100) + 20,
      pH: Math.random() * 3 + 5.5,
      temperature: Math.random() * 20 + 15,
      humidity: Math.random() * 40 + 50,
      rainfall: Math.random() * 200 + 50
    });
  };

  return (
    <Layout onLogout={onLogout}>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Gamepad2 className="w-10 h-10 text-green-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">AI Farming Simulator</h1>
                  <p className="text-gray-600">Powered by Machine Learning</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-center bg-green-100 px-6 py-3 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">{gameState.currentSeason}</div>
                  <div className="text-sm text-green-600">Season</div>
                </div>
                <div className="text-center bg-blue-100 px-6 py-3 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700">{gameState.totalScore.toFixed(0)}</div>
                  <div className="text-sm text-blue-600">Score</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Field Conditions */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Sprout className="w-6 h-6 text-green-600" />
                  Field Conditions
                </h2>
                <button
                  onClick={randomizeConditions}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Randomize
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Nitrogen */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nitrogen (N): {field.nitrogen.toFixed(0)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="140"
                    value={field.nitrogen}
                    onChange={(e) => setField({ ...field, nitrogen: Number(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Phosphorus */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phosphorus (P): {field.phosphorus.toFixed(0)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="145"
                    value={field.phosphorus}
                    onChange={(e) => setField({ ...field, phosphorus: Number(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Potassium */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Potassium (K): {field.potassium.toFixed(0)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="205"
                    value={field.potassium}
                    onChange={(e) => setField({ ...field, potassium: Number(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* pH */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    pH Level: {field.pH.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="10"
                    step="0.1"
                    value={field.pH}
                    onChange={(e) => setField({ ...field, pH: Number(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Temperature */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Thermometer className="w-4 h-4" />
                    Temperature: {field.temperature.toFixed(1)}°C
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="0.5"
                    value={field.temperature}
                    onChange={(e) => setField({ ...field, temperature: Number(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Humidity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Droplets className="w-4 h-4" />
                    Humidity: {field.humidity.toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={field.humidity}
                    onChange={(e) => setField({ ...field, humidity: Number(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Rainfall */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <CloudRain className="w-4 h-4" />
                    Rainfall: {field.rainfall.toFixed(0)} mm
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="300"
                    value={field.rainfall}
                    onChange={(e) => setField({ ...field, rainfall: Number(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-4">
                <button
                  onClick={getCropRecommendation}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Beaker className="w-5 h-5" />
                  Get Crop Recommendation
                </button>
                <button
                  onClick={simulateSeason}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Play className="w-5 h-5" />
                  {loading ? 'Simulating...' : 'Simulate Season'}
                </button>
                <button
                  onClick={resetGame}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-semibold flex items-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Reset
                </button>
              </div>
            </div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">AI Crop Recommendations</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border-2 ${
                        idx === 0
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-lg capitalize">{rec.crop}</h4>
                        {idx === 0 && <Award className="w-5 h-5 text-green-600" />}
                      </div>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Confidence:</span>
                          <span className="font-semibold">{(rec.confidence * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              idx === 0 ? 'bg-green-600' : 'bg-blue-600'
                            }`}
                            style={{ width: `${rec.confidence * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Simulation Results */}
            {showResults && simulationResult && (
              <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl shadow-lg p-6 text-white">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Trophy className="w-6 h-6" />
                  Season {gameState.currentSeason - 1} Results
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <div className="text-sm opacity-90">Recommended Crop</div>
                    <div className="text-xl font-bold capitalize">{simulationResult.recommended_crop}</div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <div className="text-sm opacity-90">Confidence</div>
                    <div className="text-xl font-bold">{(simulationResult.crop_confidence * 100).toFixed(1)}%</div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <div className="text-sm opacity-90">Predicted Yield</div>
                    <div className="text-xl font-bold">
                      {simulationResult.yield_tonnes_per_hectare?.toFixed(2) || 'N/A'} t/ha
                    </div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <div className="text-sm opacity-90">Score</div>
                    <div className="text-xl font-bold">{simulationResult.game_score.toFixed(0)}</div>
                  </div>
                </div>
                <div className="mt-4 bg-white bg-opacity-20 rounded-lg p-4">
                  <div className="text-sm opacity-90 mb-2">Rating</div>
                  <div className="text-2xl font-bold">{simulationResult.rating}</div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Stats & Leaderboard */}
          <div className="space-y-6">
            {/* Game Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Your Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Seasons Played</span>
                  <span className="font-bold text-lg">{gameState.currentSeason - 1}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Score</span>
                  <span className="font-bold text-lg text-green-600">{gameState.totalScore.toFixed(0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Yield</span>
                  <span className="font-bold text-lg">{gameState.totalYield.toFixed(2)} t/ha</span>
                </div>
              </div>

              {Object.keys(gameState.cropsGrown).length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-semibold text-gray-700 mb-2">Crops Grown</h4>
                  <div className="space-y-2">
                    {Object.entries(gameState.cropsGrown).map(([crop, count]) => (
                      <div key={crop} className="flex justify-between text-sm">
                        <span className="capitalize">{crop}</span>
                        <span className="font-semibold">{count}x</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Leaderboard */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                Leaderboard
              </h3>
              <div className="space-y-2">
                {leaderboard.slice(0, 10).map((entry, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      idx < 3 ? 'bg-yellow-50' : 'bg-gray-50'
                    }`}
                  >
                    <div className={`font-bold ${
                      idx === 0 ? 'text-yellow-600' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-orange-600' : 'text-gray-600'
                    }`}>
                      #{idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{entry.userName || 'Anonymous'}</div>
                      <div className="text-xs text-gray-500 capitalize">{entry.crop}</div>
                    </div>
                    <div className="font-bold text-green-600">{entry.score?.toFixed(0) || 0}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
