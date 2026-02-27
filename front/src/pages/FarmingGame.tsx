import { useState, useEffect } from 'react';
import { farmingGameApi, GameState, Inventory, Plot, CropData } from '../utils/api';
import { Sprout, Droplet, DollarSign, Package, ShoppingCart, TrendingUp, Clock, Heart, Zap } from 'lucide-react';

interface SeedsMarketResponse {
  success: boolean;
  seeds: { [key: string]: CropData };
}

export default function FarmingGame() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [seedsMarket, setSeedsMarket] = useState<{ [key: string]: CropData }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'farm' | 'marketplace' | 'inventory'>('farm');
  
  // Modals
  const [showBuyPlotModal, setShowBuyPlotModal] = useState(false);
  const [showPlantModal, setShowPlantModal] = useState(false);
  const [showBuySeedsModal, setShowBuySeedsModal] = useState(false);
  const [showSellCropsModal, setShowSellCropsModal] = useState(false);
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);

  useEffect(() => {
    loadGameData();
    loadSeedsMarket();
    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      loadGameData();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadGameData = async () => {
    try {
      const response = await farmingGameApi.getGameState();
      setGameState(response.gameState);
      setInventory(response.inventory);
      setPlots(response.plots);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const loadSeedsMarket = async () => {
    try {
      const response: SeedsMarketResponse = await farmingGameApi.getSeedsMarket();
      setSeedsMarket(response.seeds);
    } catch (err: any) {
      console.error('Failed to load seeds market:', err);
    }
  };

  const handlePurchasePlot = async (size: 'small' | 'medium' | 'large') => {
    try {
      const response = await farmingGameApi.purchasePlot(size);
      setSuccess(response.message);
      setShowBuyPlotModal(false);
      await loadGameData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handlePlantCrop = async (crop: string) => {
    if (!selectedPlot) return;
    try {
      const response = await farmingGameApi.plantCrop(selectedPlot._id, crop);
      setSuccess(response.message);
      setShowPlantModal(false);
      setSelectedPlot(null);
      await loadGameData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleIrrigate = async (plotId: string) => {
    try {
      const response = await farmingGameApi.irrigatePlot(plotId);
      setSuccess(response.message);
      await loadGameData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleHarvest = async (plotId: string) => {
    try {
      const response = await farmingGameApi.harvestCrop(plotId);
      setSuccess(response.message);
      await loadGameData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleBuySeeds = async (crop: string, quantity: number) => {
    try {
      const response = await farmingGameApi.buySeeds(crop, quantity);
      setSuccess(response.message);
      setShowBuySeedsModal(false);
      await loadGameData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleSellCrops = async (crop: string, quantity: number) => {
    try {
      const response = await farmingGameApi.sellCrops(crop, quantity);
      setSuccess(response.message);
      setShowSellCropsModal(false);
      await loadGameData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const isPlotReadyToHarvest = (plot: Plot) => {
    if (plot.status !== 'growing' || !plot.harvestReadyAt) return false;
    return new Date() >= new Date(plot.harvestReadyAt);
  };

  const getTimeRemaining = (harvestReadyAt: string) => {
    const now = new Date();
    const target = new Date(harvestReadyAt);
    const diff = target.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ready to harvest!';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Farming Game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">🌾 Farming Simulator Game</h1>
          
          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Money</p>
                  <p className="text-2xl font-bold">${gameState?.money || 0}</p>
                </div>
                <DollarSign className="w-8 h-8 opacity-80" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Level</p>
                  <p className="text-2xl font-bold">{gameState?.level || 1}</p>
                </div>
                <TrendingUp className="w-8 h-8 opacity-80" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Experience</p>
                  <p className="text-2xl font-bold">{gameState?.experience || 0}</p>
                </div>
                <Zap className="w-8 h-8 opacity-80" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Plots</p>
                  <p className="text-2xl font-bold">{plots.length}</p>
                </div>
                <Sprout className="w-8 h-8 opacity-80" />
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('farm')}
              className={`flex-1 px-6 py-4 font-semibold ${
                activeTab === 'farm'
                  ? 'bg-green-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Sprout className="inline-block w-5 h-5 mr-2" />
              My Farm
            </button>
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`flex-1 px-6 py-4 font-semibold ${
                activeTab === 'marketplace'
                  ? 'bg-green-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ShoppingCart className="inline-block w-5 h-5 mr-2" />
              Marketplace
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex-1 px-6 py-4 font-semibold ${
                activeTab === 'inventory'
                  ? 'bg-green-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Package className="inline-block w-5 h-5 mr-2" />
              Inventory
            </button>
          </div>

          {/* Farm Tab */}
          {activeTab === 'farm' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Your Farm Plots</h2>
                <button
                  onClick={() => setShowBuyPlotModal(true)}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  + Buy New Plot
                </button>
              </div>

              {plots.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Sprout className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">You don't have any plots yet!</p>
                  <p className="text-gray-500 mt-2">Purchase your first plot to start farming</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {plots.map((plot) => {
                    const ready = isPlotReadyToHarvest(plot);
                    return (
                      <div
                        key={plot._id}
                        className={`border-2 rounded-lg p-6 ${
                          ready
                            ? 'border-yellow-400 bg-yellow-50'
                            : plot.status === 'growing'
                            ? 'border-green-400 bg-green-50'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-gray-800 capitalize">
                              {plot.size} Plot
                            </h3>
                            <p className="text-sm text-gray-600">
                              Status: <span className="font-semibold capitalize">{plot.status}</span>
                            </p>
                          </div>
                          {plot.crop && seedsMarket[plot.crop] && (
                            <span className="text-2xl">🌱</span>
                          )}
                        </div>

                        {plot.crop && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-700 mb-2">
                              <strong>Crop:</strong> {seedsMarket[plot.crop]?.name || plot.crop}
                            </p>
                            
                            {/* Progress Bars */}
                            <div className="space-y-2">
                              <div>
                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                  <span className="flex items-center">
                                    <Droplet className="w-3 h-3 mr-1" /> Water
                                  </span>
                                  <span>{plot.waterLevel}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      plot.waterLevel > 60
                                        ? 'bg-blue-500'
                                        : plot.waterLevel > 30
                                        ? 'bg-yellow-500'
                                        : 'bg-red-500'
                                    }`}
                                    style={{ width: `${plot.waterLevel}%` }}
                                  ></div>
                                </div>
                              </div>

                              <div>
                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                  <span className="flex items-center">
                                    <Heart className="w-3 h-3 mr-1" /> Health
                                  </span>
                                  <span>{plot.health}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      plot.health > 70
                                        ? 'bg-green-500'
                                        : plot.health > 40
                                        ? 'bg-yellow-500'
                                        : 'bg-red-500'
                                    }`}
                                    style={{ width: `${plot.health}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>

                            {plot.harvestReadyAt && (
                              <div className="mt-3 flex items-center text-sm text-gray-600">
                                <Clock className="w-4 h-4 mr-1" />
                                {getTimeRemaining(plot.harvestReadyAt)}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="space-y-2">
                          {plot.status === 'empty' && (
                            <button
                              onClick={() => {
                                setSelectedPlot(plot);
                                setShowPlantModal(true);
                              }}
                              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded font-semibold"
                            >
                              <Sprout className="inline-block w-4 h-4 mr-1" />
                              Plant Crop
                            </button>
                          )}

                          {plot.status === 'growing' && !ready && (
                            <button
                              onClick={() => handleIrrigate(plot._id)}
                              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded font-semibold"
                            >
                              <Droplet className="inline-block w-4 h-4 mr-1" />
                              Irrigate
                            </button>
                          )}

                          {ready && (
                            <button
                              onClick={() => handleHarvest(plot._id)}
                              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded font-semibold animate-pulse"
                            >
                              🎉 Harvest Now!
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Marketplace Tab */}
          {activeTab === 'marketplace' && (
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Buy Seeds */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Buy Seeds</h2>
                  <div className="space-y-3">
                    {Object.entries(seedsMarket).map(([cropKey, crop]) => (
                      <div key={cropKey} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-bold text-gray-800">{crop.name}</h3>
                            <p className="text-sm text-gray-600">
                              Price: ${crop.seed_cost} | Grows in: {crop.grow_time_days} days
                            </p>
                            <p className="text-sm text-gray-600">
                              Water need: <span className="capitalize">{crop.water_need}</span>
                            </p>
                          </div>
                          <button
                            onClick={() => handleBuySeeds(cropKey, 1)}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-semibold"
                          >
                            Buy 1
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sell Crops */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Sell Crops</h2>
                  {inventory && Object.keys(inventory.harvested_crops).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(inventory.harvested_crops).map(([cropKey, quantity]) => {
                        if (quantity === 0) return null;
                        const crop = seedsMarket[cropKey];
                        if (!crop) return null;
                        return (
                          <div key={cropKey} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="font-bold text-gray-800">{crop.name}</h3>
                                <p className="text-sm text-gray-600">
                                  You have: {quantity} | Sell price: ${crop.sell_price} each
                                </p>
                                <p className="text-sm text-green-600 font-semibold">
                                  Total value: ${crop.sell_price * quantity}
                                </p>
                              </div>
                              <button
                                onClick={() => handleSellCrops(cropKey, quantity)}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-semibold"
                              >
                                Sell All
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No crops to sell</p>
                      <p className="text-gray-500 text-sm mt-2">Harvest crops from your farm first</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Inventory Tab */}
          {activeTab === 'inventory' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Inventory</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Seeds */}
                <div>
                  <h3 className="text-xl font-bold text-gray-700 mb-4">Seeds</h3>
                  {inventory && Object.keys(inventory.seeds).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(inventory.seeds).map(([cropKey, quantity]) => {
                        if (quantity === 0) return null;
                        const crop = seedsMarket[cropKey];
                        return (
                          <div key={cropKey} className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-gray-800">{crop?.name || cropKey}</p>
                              <p className="text-sm text-gray-600">Quantity: {quantity}</p>
                            </div>
                            <span className="text-2xl">🌱</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">No seeds in inventory</p>
                  )}
                </div>

                {/* Harvested Crops */}
                <div>
                  <h3 className="text-xl font-bold text-gray-700 mb-4">Harvested Crops</h3>
                  {inventory && Object.keys(inventory.harvested_crops).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(inventory.harvested_crops).map(([cropKey, quantity]) => {
                        if (quantity === 0) return null;
                        const crop = seedsMarket[cropKey];
                        return (
                          <div key={cropKey} className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-gray-800">{crop?.name || cropKey}</p>
                              <p className="text-sm text-gray-600">Quantity: {quantity}</p>
                              <p className="text-sm text-green-600">Value: ${(crop?.sell_price || 0) * quantity}</p>
                            </div>
                            <span className="text-2xl">🌾</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">No harvested crops</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Buy Plot Modal */}
        {showBuyPlotModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Purchase New Plot</h2>
              
              <div className="space-y-4">
                <button
                  onClick={() => handlePurchasePlot('small')}
                  className="w-full bg-green-100 hover:bg-green-200 border-2 border-green-500 p-4 rounded-lg text-left"
                >
                  <h3 className="font-bold text-gray-800">Small Plot</h3>
                  <p className="text-sm text-gray-600">Cost: $500</p>
                </button>
                
                <button
                  onClick={() => handlePurchasePlot('medium')}
                  className="w-full bg-blue-100 hover:bg-blue-200 border-2 border-blue-500 p-4 rounded-lg text-left"
                >
                  <h3 className="font-bold text-gray-800">Medium Plot</h3>
                  <p className="text-sm text-gray-600">Cost: $1,000</p>
                </button>
                
                <button
                  onClick={() => handlePurchasePlot('large')}
                  className="w-full bg-purple-100 hover:bg-purple-200 border-2 border-purple-500 p-4 rounded-lg text-left"
                >
                  <h3 className="font-bold text-gray-800">Large Plot</h3>
                  <p className="text-sm text-gray-600">Cost: $2,000</p>
                </button>
              </div>

              <button
                onClick={() => setShowBuyPlotModal(false)}
                className="w-full mt-6 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Plant Modal */}
        {showPlantModal && selectedPlot && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 my-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Plant Crop</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {inventory && Object.entries(inventory.seeds).map(([cropKey, quantity]) => {
                  if (quantity === 0) return null;
                  const crop = seedsMarket[cropKey];
                  return (
                    <button
                      key={cropKey}
                      onClick={() => handlePlantCrop(cropKey)}
                      className="bg-green-50 hover:bg-green-100 border-2 border-green-300 p-4 rounded-lg text-left"
                    >
                      <h3 className="font-bold text-gray-800">{crop?.name || cropKey}</h3>
                      <p className="text-sm text-gray-600">Available: {quantity} seeds</p>
                      <p className="text-sm text-gray-600">Grow time: {crop?.grow_time_days} days</p>
                    </button>
                  );
                })}
              </div>

              {inventory && Object.keys(inventory.seeds).filter(k => inventory.seeds[k] > 0).length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  No seeds available. Buy some from the marketplace first!
                </p>
              )}

              <button
                onClick={() => {
                  setShowPlantModal(false);
                  setSelectedPlot(null);
                }}
                className="w-full mt-6 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
