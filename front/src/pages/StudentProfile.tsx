import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { User, Mail, Phone, GraduationCap, MapPin, Calendar, Edit, Save, Award, BookOpen, TrendingUp, Gamepad2, Sprout, Droplets, DollarSign, ShoppingCart, Package } from 'lucide-react';
import { api, auth } from '../utils/api';
import { useNavigate } from 'react-router-dom';

interface FarmingActivity {
  type: string;
  action: string;
  details: any;
  timestamp: string;
  email: string;
}

interface FarmingGameState {
  money: number;
  xp: number;
  level: number;
  lastUpdated: string;
}

interface FarmingInventory {
  totalSeeds: number;
  totalCrops: number;
}

interface FarmingTransactions {
  totalPurchases: number;
  totalSales: number;
}

interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  institution: string;
  major: string;
  yearOfStudy: string;
  location: string;
  joinDate: string;
  bio: string;
  farmingActivities?: FarmingActivity[];
  farmingGameState?: FarmingGameState;
  farmingPlotsOwned?: number;
  farmingInventory?: FarmingInventory;
  farmingTransactions?: FarmingTransactions;
}

interface StudentProfileProps {
  onLogout: () => void;
}

export default function StudentProfile({ onLogout }: StudentProfileProps) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<ProfileData>({
    fullName: '',
    email: '',
    phone: '',
    institution: '',
    major: '',
    yearOfStudy: '',
    location: '',
    joinDate: '',
    bio: '',
    farmingActivities: [],
    farmingGameState: undefined,
    farmingPlotsOwned: 0,
    farmingInventory: undefined,
    farmingTransactions: undefined,
  });
  const [activities, setActivities] = useState<any[]>([]);
  
  useEffect(() => {
    fetchProfile();
    fetchActivities();
  }, []);
  
  const fetchProfile = async () => {
    try {
      const token = auth.getToken();
      if (!token) {
        navigate('/login');
        return;
      }
      
      const userData = await api.getProfile(token);
      setProfile(userData);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
      setLoading(false);
      if (err.message.includes('Token')) {
        auth.removeToken();
        navigate('/login');
      }
    }
  };

  const fetchActivities = async () => {
    try {
      const token = auth.getToken();
      if (!token) return;
      
      const response = await api.getActivities();
      setActivities(response.activities);
    } catch (err: any) {
      console.error('Failed to load activities:', err);
    }
  };

  const stats = [
    { label: 'Courses Completed', value: 12, icon: BookOpen, color: 'text-blue-600' },
    { label: 'Certifications', value: 5, icon: Award, color: 'text-yellow-600' },
    { label: 'Projects', value: 8, icon: TrendingUp, color: 'text-green-600' },
    { label: 'Study Hours', value: 156, icon: Calendar, color: 'text-purple-600' },
  ];

  const handleSave = async () => {
    try {
      setError('');
      const token = auth.getToken();
      if (!token) {
        navigate('/login');
        return;
      }
      
      const response = await api.updateProfile(token, profile);
      setProfile(response.user);
      auth.setUser(response.user);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) {
    return (
      <Layout onLogout={onLogout}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout onLogout={onLogout}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Profile</h1>
          <p className="text-gray-600">Manage your personal information and track your progress</p>
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-green-600 h-32"></div>
              <div className="px-6 pb-6">
                <div className="flex justify-center -mt-16 mb-4">
                  <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                    <User className="w-16 h-16 text-gray-400" />
                  </div>
                </div>

                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{profile.fullName}</h2>
                  <p className="text-gray-600">{profile.major}</p>
                  <p className="text-sm text-gray-500">{profile.yearOfStudy}</p>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center text-gray-700">
                    <Mail className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="truncate">{profile.email}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Phone className="w-4 h-4 mr-3 text-gray-400" />
                    <span>{profile.phone}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <GraduationCap className="w-4 h-4 mr-3 text-gray-400" />
                    <span>{profile.institution}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                    <span>{profile.location}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                    <span>Joined {new Date(profile.joinDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="w-full mt-6 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Stats</h3>
              <div className="space-y-4">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Icon className={`w-5 h-5 ${stat.color} mr-3`} />
                        <span className="text-gray-700 text-sm">{stat.label}</span>
                      </div>
                      <span className="font-bold text-gray-900">{stat.value}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Edit Profile */}
            {isEditing && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Edit Profile Information</h3>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={profile.fullName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={profile.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Institution</label>
                    <input
                      type="text"
                      name="institution"
                      value={profile.institution}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={profile.location}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea
                      name="bio"
                      value={profile.bio}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSave}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    Save Changes
                  </button>
                </form>
              </div>
            )}

            {/* About */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">About</h3>
              <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
            </div>

            {/* Achievements */}

            {/* Farming Game Stats */}
            {profile.farmingGameState && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Gamepad2 className="w-6 h-6 mr-2 text-green-600" />
                  Farming Game Stats
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-yellow-700 font-medium">Money</p>
                        <p className="text-2xl font-bold text-yellow-900">${profile.farmingGameState.money.toFixed(2)}</p>
                      </div>
                      <DollarSign className="w-8 h-8 text-yellow-600" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-700 font-medium">Level {profile.farmingGameState.level}</p>
                        <p className="text-2xl font-bold text-purple-900">{profile.farmingGameState.xp} XP</p>
                      </div>
                      <Award className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-700 font-medium">Plots Owned</p>
                        <p className="text-2xl font-bold text-green-900">{profile.farmingPlotsOwned || 0}</p>
                      </div>
                      <Sprout className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-700 font-medium">Transactions</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {(profile.farmingTransactions?.totalPurchases || 0) + (profile.farmingTransactions?.totalSales || 0)}
                        </p>
                      </div>
                      <ShoppingCart className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                </div>
                {profile.farmingInventory && (
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
                    <h4 className="text-sm font-semibold text-orange-900 mb-3 flex items-center">
                      <Package className="w-4 h-4 mr-2" />
                      Inventory Summary
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-orange-700">Seeds</p>
                        <p className="text-lg font-bold text-orange-900">{profile.farmingInventory.totalSeeds}</p>
                      </div>
                      <div>
                        <p className="text-orange-700">Harvested Crops</p>
                        <p className="text-lg font-bold text-orange-900">{profile.farmingInventory.totalCrops}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Farming Game Activities */}
            {profile.farmingActivities && profile.farmingActivities.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Gamepad2 className="w-6 h-6 mr-2 text-green-600" />
                  Farming Game Activities
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {profile.farmingActivities.map((activity, index) => {
                    const getActivityIcon = (action: string) => {
                      if (action.includes('purchased') || action.includes('bought')) return '🛒';
                      if (action.includes('sold')) return '💰';
                      if (action.includes('planted')) return '🌱';
                      if (action.includes('harvested')) return '🌾';
                      if (action.includes('irrigated')) return '💧';
                      if (action.includes('plot')) return '🏡';
                      return '🎮';
                    };

                    const getActivityColor = (action: string) => {
                      if (action.includes('purchased') || action.includes('bought')) return 'bg-blue-50 border-blue-200';
                      if (action.includes('sold')) return 'bg-green-50 border-green-200';
                      if (action.includes('planted')) return 'bg-yellow-50 border-yellow-200';
                      if (action.includes('harvested')) return 'bg-orange-50 border-orange-200';
                      if (action.includes('irrigated')) return 'bg-cyan-50 border-cyan-200';
                      if (action.includes('plot')) return 'bg-purple-50 border-purple-200';
                      return 'bg-gray-50 border-gray-200';
                    };

                    return (
                      <div
                        key={index}
                        className={`flex items-start p-3 rounded-lg border ${getActivityColor(activity.action)} transition hover:shadow-sm`}
                      >
                        <div className="text-2xl mr-3 mt-0.5">{getActivityIcon(activity.action)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                          {activity.details && Object.keys(activity.details).length > 0 && (
                            <div className="mt-1 text-xs text-gray-600">
                              {activity.details.crop && <span className="mr-3">🌾 {activity.details.crop}</span>}
                              {activity.details.amount !== undefined && <span className="mr-3">📦 {activity.details.amount}</span>}
                              {activity.details.price !== undefined && <span className="mr-3">💵 ${activity.details.price}</span>}
                              {activity.details.plotSize && <span className="mr-3">📐 {activity.details.plotSize}</span>}
                              {activity.details.yield !== undefined && <span className="mr-3">⚖️ {activity.details.yield} units</span>}
                            </div>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {activities.length > 0 ? activities.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-600 rounded-full mr-4"></div>
                      <span className="text-gray-700">
                        {activity.type === 'crop_recommendation' 
                          ? `Got crop recommendations for ${activity.data?.recommendations?.[0]?.name || 'crops'}`
                          : activity.type === 'irrigation_prediction'
                          ? `Predicted irrigation needs for ${activity.data?.crop_type || 'crop'} (${activity.data?.risk_level || 'Unknown'} risk)`
                          : activity.type.replace('_', ' ').toUpperCase()
                        }
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'Recently'}
                    </span>
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No recent activities yet.</p>
                    <p className="text-sm mt-1">Start using the app to see your activity here!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Overview */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-xl font-semibold mb-4">Learning Progress</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Course Completion</span>
                    <span>75%</span>
                  </div>
                  <div className="bg-white bg-opacity-30 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Practical Skills</span>
                    <span>60%</span>
                  </div>
                  <div className="bg-white bg-opacity-30 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>AI Tools Mastery</span>
                    <span>85%</span>
                  </div>
                  <div className="bg-white bg-opacity-30 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
