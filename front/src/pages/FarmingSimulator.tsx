import { useState, useEffect } from 'react';
import api from '../utils/api';
import Layout from '../components/Layout';
import { 
  Gamepad2, Sprout, Droplets, Sun, DollarSign, Package, TrendingUp,
  Beef, Milk, Play, RotateCcw,
  Settings, Settings2, Calendar, Thermometer, CloudRain, Wind
} from 'lucide-react';

interface FarmingSimulatorProps {
  onLogout: () => void;
}

export default function FarmingSimulator({ onLogout }: FarmingSimulatorProps) {
  const [selectedTab, setSelectedTab] = useState<'game' | 'simulation'>('game');
  const [gameState, setGameState] = useState({
    money: 10000,
    day: 1,
    crops: [] as any[],
    water: 100,
    fertilizer: 50,
    season: 'Spring',
    temperature: 25,
    weather: 'Sunny',
  });

  const [selectedCrop, setSelectedCrop] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [investment, setInvestment] = useState(50);
  const [animalCount, setAnimalCount] = useState(10);
  const [dairyInvestment, setDairyInvestment] = useState(30);
  
  const [cropSimulation, setCropSimulation] = useState<{
    yield: number;
    profit: number;
    waterUsage: number;
  } | null>(null);

  const [animalSimulation, setAnimalSimulation] = useState<{
    production: number;
    profit: number;
    feedCost: number;
  } | null>(null);

  const [dairySimulation, setDairySimulation] = useState<{
    milkProduction: number;
    profit: number;
    operatingCost: number;
  } | null>(null);

  const cropTypes = [
    { name: 'Wheat', cost: 100, growTime: 7, sellPrice: 250, water: 10, season: 'Spring' },
    { name: 'Corn', cost: 150, growTime: 10, sellPrice: 400, water: 15, season: 'Summer' },
    { name: 'Rice', cost: 120, growTime: 14, sellPrice: 450, water: 20, season: 'Monsoon' },
    { name: 'Tomato', cost: 80, growTime: 5, sellPrice: 180, water: 8, season: 'Spring' },
  ];

  const startGame = () => {
    setGameStarted(true);
    setGameState({
      money: 10000,
      day: 1,
      crops: [],
      water: 100,
      fertilizer: 50,
      season: 'Spring',
      temperature: 25,
      weather: 'Sunny',
    });
  };

  const plantCrop = () => {
    if (!selectedCrop) return;
    const crop = cropTypes.find(c => c.name === selectedCrop);
    if (!crop || gameState.money < crop.cost) return;

    setGameState({
      ...gameState,
      money: gameState.money - crop.cost,
      crops: [
        ...gameState.crops,
        {
          id: Date.now(),
          ...crop,
          plantedDay: gameState.day,
          harvestDay: gameState.day + crop.growTime,
          watered: true,
        },
      ],
    });
  };

  const waterCrops = () => {
    if (gameState.water < 10) return;
    setGameState({
      ...gameState,
      water: gameState.water - 10,
      crops: gameState.crops.map(crop => ({ ...crop, watered: true })),
    });
  };

  const harvestCrop = (cropId: number) => {
    const crop = gameState.crops.find(c => c.id === cropId);
    if (!crop || gameState.day < crop.harvestDay) return;

    setGameState({
      ...gameState,
      money: gameState.money + crop.sellPrice,
      crops: gameState.crops.filter(c => c.id !== cropId),
    });
  };

  const nextDay = () => {
    const seasons = ['Spring', 'Summer', 'Monsoon', 'Autumn'];
    const weathers = ['Sunny', 'Cloudy', 'Rainy', 'Windy'];
    const newSeason = seasons[Math.floor(gameState.day / 30) % 4];
    const newWeather = weathers[Math.floor(Math.random() * weathers.length)];
    const newTemp = newWeather === 'Sunny' ? 28 : newWeather === 'Rainy' ? 22 : 25;

    setGameState({
      ...gameState,
      day: gameState.day + 1,
      water: Math.min(gameState.water + (newWeather === 'Rainy' ? 40 : 20), 100),
      fertilizer: Math.min(gameState.fertilizer + 10, 100),
      season: newSeason,
      weather: newWeather,
      temperature: newTemp,
    });
  };

  const handleRunCropSimulation = () => {
    setCropSimulation({
      yield: Math.floor(Math.random() * 50) + 40,
      profit: Math.floor(Math.random() * 20000) + 10000,
      waterUsage: Math.floor(Math.random() * 3000) + 2000,
    });
  };

  const handleRunAnimalSimulation = () => {
    setAnimalSimulation({
      production: Math.floor(Math.random() * 200) + 150,
      profit: Math.floor(Math.random() * 50000) + 30000,
      feedCost: Math.floor(Math.random() * 15000) + 10000,
    });
  };

  const handleRunDairySimulation = () => {
    setDairySimulation({
      milkProduction: Math.floor(Math.random() * 500) + 300,
      profit: Math.floor(Math.random() * 35000) + 20000,
      operatingCost: Math.floor(Math.random() * 12000) + 8000,
    });
  };

  const handleResetCrop = () => {
    setCropSimulation(null);
    setInvestment(50);
  };

  const handleResetAnimal = () => {
    setAnimalSimulation(null);
    setAnimalCount(10);
  };

  const handleResetDairy = () => {
    setDairySimulation(null);
    setDairyInvestment(30);
  };

  const renderTabButton = (tab: 'game' | 'simulation', label: string, icon: React.ReactNode) => (
    <button
      onClick={() => setSelectedTab(tab)}
      className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
        selectedTab === tab
          ? 'bg-green-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <Layout onLogout={onLogout}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-green-100">
              <Settings2 className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Farming Simulator</h1>
              <p className="text-gray-600">Learn farming through interactive gameplay and simulations</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {renderTabButton('game', 'Interactive Game', <Gamepad2 className="h-4 w-4" />)}
          </div>
        </div>

        {selectedTab === 'game' && (
          <>
            {!gameStarted ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Gamepad2 className="w-24 h-24 text-green-600 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Farm Simulator</h2>
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                  Start your farming journey! Plant crops, manage resources, and learn the fundamentals 
                  of agriculture in a fun, interactive environment.
                </p>
                <button
                  onClick={startGame}
                  className="px-8 py-4 bg-green-600 text-white rounded-lg font-semibold text-lg hover:bg-green-700 transition duration-200 shadow-lg"
                >
                  Start New Game
                </button>

                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Game Features</h3>
                    <ul className="space-y-2 text-gray-600 text-sm">
                      <li className="flex items-center"><Sprout className="w-4 h-4 mr-2 text-green-600" /> Plant various crops</li>
                      <li className="flex items-center"><Droplets className="w-4 h-4 mr-2 text-blue-600" /> Manage water resources</li>
                      <li className="flex items-center"><DollarSign className="w-4 h-4 mr-2 text-yellow-600" /> Buy and sell produce</li>
                      <li className="flex items-center"><TrendingUp className="w-4 h-4 mr-2 text-purple-600" /> Track your progress</li>
                    </ul>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Available Crops</h3>
                    <ul className="space-y-2 text-gray-600 text-sm">
                      {cropTypes.map(crop => (
                        <li key={crop.name} className="flex justify-between">
                          <span>{crop.name}</span>
                          <span className="text-green-600">${crop.cost}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Game Stats */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  <div className="bg-white rounded-lg shadow-md p-4 text-center">
                    <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">${gameState.money}</p>
                    <p className="text-sm text-gray-600">Money</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-md p-4 text-center">
                    <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">Day {gameState.day}</p>
                    <p className="text-sm text-gray-600">{gameState.season}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-md p-4 text-center">
                    <Thermometer className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{gameState.temperature}°C</p>
                    <p className="text-sm text-gray-600">{gameState.weather}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-md p-4 text-center">
                    <Droplets className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{gameState.water}%</p>
                    <p className="text-sm text-gray-600">Water</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-md p-4 text-center">
                    <Package className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{gameState.fertilizer}%</p>
                    <p className="text-sm text-gray-600">Fertilizer</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-md p-4 text-center">
                    <Sprout className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{gameState.crops.length}</p>
                    <p className="text-sm text-gray-600">Active Crops</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Plant Crops */}
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Plant Crops</h2>
                    <div className="space-y-4">
                      <select
                        value={selectedCrop}
                        onChange={(e) => setSelectedCrop(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                      >
                        <option value="">Select a crop</option>
                        {cropTypes.map(crop => (
                          <option key={crop.name} value={crop.name}>
                            {crop.name} - ${crop.cost} ({crop.growTime} days)
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={plantCrop}
                        disabled={!selectedCrop || gameState.money < (cropTypes.find(c => c.name === selectedCrop)?.cost || 0)}
                        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        Plant Crop
                      </button>

                      <div className="pt-4 border-t border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-3">Crop Information</h3>
                        <div className="space-y-2 text-sm">
                          {cropTypes.map(crop => (
                            <div key={crop.name} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <div>
                                <span className="font-medium">{crop.name}</span>
                                <span className="text-xs text-gray-500 ml-2">({crop.season})</span>
                              </div>
                              <div className="text-right text-xs text-gray-600">
                                <div>Cost: ${crop.cost}</div>
                                <div>Sell: ${crop.sellPrice}</div>
                                <div className="text-green-600">Profit: ${crop.sellPrice - crop.cost}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Farm Management */}
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Farm Management</h2>
                    <div className="space-y-3">
                      <button
                        onClick={waterCrops}
                        disabled={gameState.water < 10 || gameState.crops.length === 0}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        <Droplets className="w-5 h-5 mr-2" />
                        Water All Crops (-10 Water)
                      </button>

                      <button
                        onClick={nextDay}
                        className="w-full bg-yellow-600 text-white py-3 rounded-lg font-semibold hover:bg-yellow-700 transition flex items-center justify-center"
                      >
                        <Sun className="w-5 h-5 mr-2" />
                        Next Day
                      </button>

                      <button
                        onClick={startGame}
                        className="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
                      >
                        Reset Game
                      </button>
                    </div>

                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">Weather Report</h4>
                      <div className="flex items-center justify-between text-sm text-green-800">
                        <div className="flex items-center">
                          {gameState.weather === 'Sunny' && <Sun className="w-4 h-4 mr-2" />}
                          {gameState.weather === 'Rainy' && <CloudRain className="w-4 h-4 mr-2" />}
                          {gameState.weather === 'Windy' && <Wind className="w-4 h-4 mr-2" />}
                          <span>{gameState.weather}</span>
                        </div>
                        <span>{gameState.temperature}°C</span>
                        <span>{gameState.season}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Active Crops */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Crops ({gameState.crops.length})</h2>
                  {gameState.crops.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {gameState.crops.map(crop => {
                        const daysLeft = crop.harvestDay - gameState.day;
                        const isReady = daysLeft <= 0;
                        const progress = Math.min(((gameState.day - crop.plantedDay) / crop.growTime) * 100, 100);

                        return (
                          <div key={crop.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <Sprout className={`w-6 h-6 ${isReady ? 'text-green-600' : 'text-yellow-600'}`} />
                                <span className="font-semibold text-gray-900">{crop.name}</span>
                              </div>
                              {crop.watered && <Droplets className="w-4 h-4 text-blue-600" />}
                            </div>

                            <div className="mb-3">
                              <div className="flex justify-between text-sm text-gray-600 mb-1">
                                <span>{isReady ? 'Ready!' : `${daysLeft} days left`}</span>
                                <span>{Math.round(progress)}%</span>
                              </div>
                              <div className="bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all ${
                                    isReady ? 'bg-green-600' : 'bg-yellow-500'
                                  }`}
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>

                            <button
                              onClick={() => harvestCrop(crop.id)}
                              disabled={!isReady}
                              className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                              {isReady ? `Harvest ($${crop.sellPrice})` : 'Growing...'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Sprout className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No crops planted yet. Start planting to begin your farm!</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {selectedTab === 'simulation' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Crop Simulation */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Sprout className="w-5 h-5" />
                  Crop Farming Simulation
                </h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Crop Type</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
                      <option>Select crop</option>
                      <option value="wheat">Wheat</option>
                      <option value="rice">Rice</option>
                      <option value="corn">Corn</option>
                      <option value="tomato">Tomato</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Farm Area (hectares)</label>
                    <input 
                      type="number" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                      defaultValue="10"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Season</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
                      <option>Select season</option>
                      <option value="spring">Spring</option>
                      <option value="summer">Summer</option>
                      <option value="monsoon">Monsoon</option>
                      <option value="autumn">Autumn</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-gray-700">Investment Level</label>
                      <span className="text-sm font-medium">${investment}K</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={investment}
                      onChange={(e) => setInvestment(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Irrigation Method</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
                      <option>Select method</option>
                      <option value="drip">Drip Irrigation</option>
                      <option value="sprinkler">Sprinkler System</option>
                      <option value="flood">Flood Irrigation</option>
                    </select>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={handleRunCropSimulation}
                      className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Run Simulation
                    </button>
                    <button
                      onClick={handleResetCrop}
                      className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Crop Results */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Crop Simulation Results</h2>
                <p className="text-gray-600 mb-6">Projected crop farming outcomes based on parameters</p>
                {!cropSimulation ? (
                  <div className="text-center py-12 text-gray-500">
                    <Sprout className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Run simulation to see crop yield results</p>
                    <p className="text-sm mt-2">Configure parameters and click "Run Simulation"</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-6 rounded-lg bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
                      <h3 className="text-sm text-gray-600 mb-2">Projected Yield</h3>
                      <div className="text-4xl font-bold text-green-600">{cropSimulation.yield} tons</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg border bg-gray-50">
                        <h3 className="text-sm text-gray-600 mb-2">Estimated Profit</h3>
                        <div className="text-2xl font-bold text-green-600">
                          ${cropSimulation.profit.toLocaleString()}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Gross revenue</p>
                      </div>
                      <div className="p-4 rounded-lg border bg-gray-50">
                        <h3 className="text-sm text-gray-600 mb-2">Water Usage</h3>
                        <div className="text-2xl font-bold text-blue-600">
                          {cropSimulation.waterUsage.toLocaleString()}L
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Total consumption</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Animal & Dairy Simulation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Animal Simulation */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Beef className="w-5 h-5" />
                  Animal Farming Simulation
                </h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Animal Type</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                      <option>Select animal</option>
                      <option value="cow">Dairy Cow</option>
                      <option value="buffalo">Buffalo</option>
                      <option value="goat">Goat</option>
                      <option value="chicken">Chicken</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-gray-700">Number of Animals</label>
                      <span className="text-sm font-medium">{animalCount}</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      step="5"
                      value={animalCount}
                      onChange={(e) => setAnimalCount(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Feed Type</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                      <option>Select feed</option>
                      <option value="premium">Premium Feed</option>
                      <option value="standard">Standard Feed</option>
                      <option value="organic">Organic Feed</option>
                      <option value="mixed">Mixed Feed</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Housing Type</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                      <option>Select housing</option>
                      <option value="modern">Modern Barn</option>
                      <option value="traditional">Traditional Shed</option>
                      <option value="freerange">Free Range</option>
                    </select>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={handleRunAnimalSimulation}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Run Simulation
                    </button>
                    <button
                      onClick={handleResetAnimal}
                      className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Dairy Simulation */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Milk className="w-5 h-5" />
                  Dairy Production Simulation
                </h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Primary Product</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none">
                      <option>Select product</option>
                      <option value="milk">Fresh Milk</option>
                      <option value="cheese">Cheese</option>
                      <option value="butter">Butter</option>
                      <option value="yogurt">Yogurt</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Production Scale</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none">
                      <option>Select scale</option>
                      <option value="small">Small Scale (100-500L/day)</option>
                      <option value="medium">Medium Scale (500-1000L/day)</option>
                      <option value="large">Large Scale (1000+ L/day)</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-gray-700">Infrastructure Investment</label>
                      <span className="text-sm font-medium">${dairyInvestment}K</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="200"
                      step="10"
                      value={dairyInvestment}
                      onChange={(e) => setDairyInvestment(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Processing Equipment</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none">
                      <option>Select equipment</option>
                      <option value="automated">Fully Automated</option>
                      <option value="semiautomated">Semi-Automated</option>
                      <option value="manual">Manual Processing</option>
                    </select>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={handleRunDairySimulation}
                      className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition flex items-center justify-center"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Run Simulation
                    </button>
                    <button
                      onClick={handleResetDairy}
                      className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Animal & Dairy Results */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {animalSimulation && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Animal Farming Results</h3>
                  <div className="p-6 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 mb-4">
                    <h4 className="text-sm text-gray-600 mb-2">Production Output</h4>
                    <div className="text-4xl font-bold text-blue-600">{animalSimulation.production} kg</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border bg-gray-50">
                      <h4 className="text-sm text-gray-600 mb-2">Net Profit</h4>
                      <div className="text-2xl font-bold text-green-600">
                        ${animalSimulation.profit.toLocaleString()}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Annual estimate</p>
                    </div>
                    <div className="p-4 rounded-lg border bg-gray-50">
                      <h4 className="text-sm text-gray-600 mb-2">Feed Cost</h4>
                      <div className="text-2xl font-bold text-orange-600">
                        ${animalSimulation.feedCost.toLocaleString()}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Annual expense</p>
                    </div>
                  </div>
                </div>
              )}

              {dairySimulation && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Dairy Production Results</h3>
                  <div className="p-6 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 mb-4">
                    <h4 className="text-sm text-gray-600 mb-2">Monthly Production</h4>
                    <div className="text-4xl font-bold text-purple-600">{dairySimulation.milkProduction}L</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border bg-gray-50">
                      <h4 className="text-sm text-gray-600 mb-2">Monthly Profit</h4>
                      <div className="text-2xl font-bold text-green-600">
                        ${dairySimulation.profit.toLocaleString()}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Net revenue</p>
                    </div>
                    <div className="p-4 rounded-lg border bg-gray-50">
                      <h4 className="text-sm text-gray-600 mb-2">Operating Cost</h4>
                      <div className="text-2xl font-bold text-red-600">
                        ${dairySimulation.operatingCost.toLocaleString()}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Monthly expenses</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Empty State for Simulations */}
            {!animalSimulation && !dairySimulation && (
              <div className="text-center py-12 bg-white rounded-xl shadow-md">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <Settings className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Run Simulations</h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Configure animal and dairy farming parameters and run simulations to see projected outcomes.
                  This helps in understanding the financial and operational aspects of different farming types.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}