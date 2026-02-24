import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Package, ShoppingBag, DollarSign, AlertCircle, Loader, RefreshCw, Sprout } from 'lucide-react';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';

interface InventoryProps {
  onLogout: () => void;
}

interface GameInventory {
  seeds: { [crop: string]: number };
  harvested_crops: { [crop: string]: number };
}

interface CropData {
  name: string;
  seed_cost: number;
  sell_price: number;
  grow_time_days: number;
  water_need: string;
}

export default function Inventory({ onLogout }: InventoryProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [inventory, setInventory] = useState<GameInventory>({ seeds: {}, harvested_crops: {} });
  const [gameState, setGameState] = useState<any>(null);
  const [cropData, setCropData] = useState<{ [key: string]: CropData }>({});
  const [sellModal, setSellModal] = useState<{ open: boolean; crop: string; maxQuantity: number }>({
    open: false,
    crop: '',
    maxQuantity: 0
  });
  const [sellQuantity, setSellQuantity] = useState(1);
  const [selling, setSelling] = useState(false);

  // Mock items for demo (keeping the old static items for reference)
  const [staticItems] = useState<any[]>([
    {
      id: 1,
      name: 'Wheat Seeds',
      category: 'Seeds',
      quantity: 250,
      unit: 'kg',
      location: 'Warehouse A',
      expiryDate: '2025-06-30',
      status: 'In Stock',
    },
    {
      id: 2,
      name: 'Organic Fertilizer',
      category: 'Fertilizers',
      quantity: 15,
      unit: 'bags',
      location: 'Storage Room 2',
      expiryDate: '2025-03-15',
      status: 'Low Stock',
    },
    {
      id: 3,
      name: 'Pesticide Spray',
      category: 'Pesticides',
      quantity: 0,
      unit: 'liters',
      location: 'Chemical Storage',
      expiryDate: '2025-01-20',
      status: 'Out of Stock',
    },
    {
      id: 4,
      name: 'Rice Grains',
      category: 'Grains',
      quantity: 500,
      unit: 'kg',
      location: 'Warehouse B',
      expiryDate: '2025-12-31',
      status: 'In Stock',
    },
    {
      id: 5,
      name: 'Irrigation Pipes',
      category: 'Equipment',
      quantity: 45,
      unit: 'meters',
      location: 'Equipment Shed',
      expiryDate: 'N/A',
      status: 'In Stock',
    },
  ]);

  useEffect(() => {
    fetchInventory();
    fetchCropData();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.farmingGame.getGameState();
      setInventory(response.inventory);
      setGameState(response.gameState);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load inventory');
      setLoading(false);
      if (err.message?.includes('Token') || err.message?.includes('401')) {
        navigate('/login');
      }
    }
  };

  const fetchCropData = async () => {
    try {
      const response = await api.farmingGame.getSeedsMarket();
      setCropData(response.seeds);
    } catch (err) {
      console.error('Failed to load crop data:', err);
    }
  };

  const handleSellCrop = async () => {
    if (!sellModal.crop || sellQuantity < 1) return;

    try {
      setSelling(true);
      setError('');
      const response = await api.farmingGame.sellCrops(sellModal.crop, sellQuantity);
      setSuccess(response.message);
      setSellModal({ open: false, crop: '', maxQuantity: 0 });
      setSellQuantity(1);
      
      // Refresh inventory
      await fetchInventory();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to sell crops');
    } finally {
      setSelling(false);
    }
  };

  const openSellModal = (crop: string, quantity: number) => {
    setSellModal({ open: true, crop, maxQuantity: quantity });
    setSellQuantity(1);
  };

  const getTotalSeedsValue = () => {
    return Object.entries(inventory.seeds || {}).reduce((total, [crop, qty]) => {
      const price = cropData[crop]?.seed_cost || 0;
      return total + (price * qty);
    }, 0);
  };

  const getTotalCropsValue = () => {
    return Object.entries(inventory.harvested_crops || {}).reduce((total, [crop, qty]) => {
      const price = cropData[crop]?.sell_price || 0;
      return total + (price * qty);
    }, 0);
  };

  const stats = {
    totalSeeds: Object.values(inventory.seeds || {}).reduce((sum, qty) => sum + qty, 0),
    totalCrops: Object.values(inventory.harvested_crops || {}).reduce((sum, qty) => sum + qty, 0),
    seedTypes: Object.keys(inventory.seeds || {}).filter(crop => (inventory.seeds[crop] || 0) > 0).length,
    cropTypes: Object.keys(inventory.harvested_crops || {}).filter(crop => (inventory.harvested_crops[crop] || 0) > 0).length,
  };

  if (loading) {
    return (
      <Layout onLogout={onLogout}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader className="animate-spin h-12 w-12 text-green-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading inventory...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout onLogout={onLogout}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <Package className="w-8 h-8 mr-3 text-green-600" />
              Farming Game Inventory
            </h1>
            <p className="text-gray-600">Manage your seeds and harvested crops</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={fetchInventory}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center shadow-lg"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Refresh
            </button>
            <button
              onClick={() => navigate('/farming-game')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center shadow-lg"
            >
              <Sprout className="w-5 h-5 mr-2" />
              Go to Farm
            </button>
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            {success}
          </div>
        )}

        {/* Game State Banner */}
        {gameState && (
          <div className="mb-6 bg-gradient-to-r from-green-600 to-green-700 rounded-xl shadow-lg p-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold mb-1">Your Farm Status</h3>
                <p className="text-green-100">Level {gameState.level} Farmer</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">${gameState.money.toFixed(2)}</p>
                <p className="text-green-100 text-sm">{gameState.experience} XP</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Seeds</p>
                <p className="text-3xl font-bold text-blue-900">{stats.totalSeeds}</p>
                <p className="text-xs text-gray-500 mt-1">{stats.seedTypes} types</p>
              </div>
              <Sprout className="w-10 h-10 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Harvested Crops</p>
                <p className="text-3xl font-bold text-green-900">{stats.totalCrops}</p>
                <p className="text-xs text-gray-500 mt-1">{stats.cropTypes} types</p>
              </div>
              <Package className="w-10 h-10 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Seeds Value</p>
                <p className="text-3xl font-bold text-purple-900">${getTotalSeedsValue()}</p>
                <p className="text-xs text-gray-500 mt-1">Total cost</p>
              </div>
              <DollarSign className="w-10 h-10 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Crops Value</p>
                <p className="text-3xl font-bold text-yellow-900">${getTotalCropsValue()}</p>
                <p className="text-xs text-gray-500 mt-1">Sell potential</p>
              </div>
              <ShoppingBag className="w-10 h-10 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Seeds Inventory */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-blue-200">
            <h2 className="text-xl font-bold text-blue-900 flex items-center">
              <Sprout className="w-6 h-6 mr-2" />
              Seeds Inventory
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Crop</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Quantity</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Seed Cost (each)</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Total Value</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Grow Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Object.entries(inventory.seeds || {})
                  .filter(([_, qty]) => qty > 0)
                  .map(([crop, quantity]) => {
                    const data = cropData[crop];
                    return (
                      <tr key={crop} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <span className="text-2xl mr-3">🌱</span>
                            <span className="font-medium text-gray-900 capitalize">{data?.name || crop}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-blue-900">{quantity}</span>
                          <span className="text-gray-600 ml-1">seeds</span>
                        </td>
                        <td className="px-6 py-4 text-gray-700">${data?.seed_cost || 0}</td>
                        <td className="px-6 py-4 font-semibold text-purple-900">
                          ${(data?.seed_cost || 0) * quantity}
                        </td>
                        <td className="px-6 py-4 text-gray-700">{data?.grow_time_days || 0} days</td>
                      </tr>
                    );
                  })}
                {Object.keys(inventory.seeds || {}).filter(crop => (inventory.seeds[crop] || 0) > 0).length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      <Sprout className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>No seeds in inventory</p>
                      <button
                        onClick={() => navigate('/farming-game')}
                        className="mt-3 text-green-600 hover:text-green-700 font-medium"
                      >
                        Buy seeds from marketplace →
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Harvested Crops Inventory */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-4 border-b border-green-200">
            <h2 className="text-xl font-bold text-green-900 flex items-center">
              <Package className="w-6 h-6 mr-2" />
              Harvested Crops - Ready to Sell
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Crop</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Quantity</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Sell Price (each)</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Total Value</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Object.entries(inventory.harvested_crops || {})
                  .filter(([_, qty]) => qty > 0)
                  .map(([crop, quantity]) => {
                    const data = cropData[crop];
                    return (
                      <tr key={crop} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <span className="text-2xl mr-3">🌾</span>
                            <span className="font-medium text-gray-900 capitalize">{data?.name || crop}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-green-900">{quantity}</span>
                          <span className="text-gray-600 ml-1">units</span>
                        </td>
                        <td className="px-6 py-4 text-gray-700">${data?.sell_price || 0}</td>
                        <td className="px-6 py-4 font-semibold text-yellow-900">
                          ${(data?.sell_price || 0) * quantity}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => openSellModal(crop, quantity)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center"
                          >
                            <ShoppingBag className="w-4 h-4 mr-2" />
                            Sell
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                {Object.keys(inventory.harvested_crops || {}).filter(crop => (inventory.harvested_crops[crop] || 0) > 0).length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>No harvested crops yet</p>
                      <button
                        onClick={() => navigate('/farming-game')}
                        className="mt-3 text-green-600 hover:text-green-700 font-medium"
                      >
                        Go to your farm and harvest crops →
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sell Crop Modal */}
        {sellModal.open && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <ShoppingBag className="w-7 h-7 mr-2 text-green-600" />
                  Sell {cropData[sellModal.crop]?.name || sellModal.crop}
                </h2>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">Available:</span>
                    <span className="font-bold text-green-900">{sellModal.maxQuantity} units</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Price per unit:</span>
                    <span className="font-bold text-green-900">${cropData[sellModal.crop]?.sell_price || 0}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity to Sell
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={sellModal.maxQuantity}
                    value={sellQuantity}
                    onChange={(e) => setSellQuantity(Math.min(parseInt(e.target.value) || 1, sellModal.maxQuantity))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  />
                  <div className="mt-2 flex justify-between">
                    <button
                      onClick={() => setSellQuantity(1)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Min (1)
                    </button>
                    <button
                      onClick={() => setSellQuantity(sellModal.maxQuantity)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Max ({sellModal.maxQuantity})
                    </button>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-700">Total Earnings:</span>
                    <span className="text-2xl font-bold text-yellow-900">
                      ${(cropData[sellModal.crop]?.sell_price || 0) * sellQuantity}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setSellModal({ open: false, crop: '', maxQuantity: 0 })}
                    disabled={selling}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSellCrop}
                    disabled={selling}
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center"
                  >
                    {selling ? (
                      <>
                        <Loader className="animate-spin w-5 h-5 mr-2" />
                        Selling...
                      </>
                    ) : (
                      <>
                        <DollarSign className="w-5 h-5 mr-2" />
                        Confirm Sale
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
