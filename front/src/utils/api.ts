const API_BASE_URL = 'http://localhost:5000/api';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  phone: string;
  institution: string;
  password: string;
}

export interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  institution: string;
}

export interface CropRecommendationData {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
}

export interface CropRecommendation {
  name: string;
  probability: number;
  reason: string;
  suitableSeasons: string[];
  waterRequirement: string;
  soilType: string;
  description: string;
  confidence: string;
}

export interface CropRecommendationResponse {
  success: boolean;
  recommendations: CropRecommendation[];
  input_parameters: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    temperature: number;
    humidity: number;
    ph: number;
    rainfall: number;
  };
  ai_insights: string[];
  timestamp: string;
}

export interface CropInfo {
  name: string;
  description: string;
  suitable_seasons: string[];
  water_requirement: string;
  soil_type: string;
  ideal_temp: string;
  ideal_rainfall: string;
}

export interface WeatherCurrent {
  temp: number;
  feels_like: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  windDeg: number;
  precipitation: number;
  visibility: number;
  pressure: number;
  sunrise: number;
  sunset: number;
  icon: string;
}

export interface WeatherForecast {
  day: string;
  temp: number;
  condition: string;
  icon: string;
  rain: number;
}

export interface WeatherData {
  location: string;
  current: WeatherCurrent;
  forecast: WeatherForecast[];
  advice: string[];
}

export interface IrrigationInput {
  cropType: string;
  N: number;
  P: number;
  K: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
}

export interface IrrigationPrediction {
  water_deficit_mm: number;
  monthly_water_need_mm: number;
  rainfall_received_mm: number;
  irrigation_schedule: string;
  irrigation_frequency: string;
  next_irrigation: string;
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  estimated_water_saving_potential: string;
  water_conservation_tips: string[];
  crop_specific_notes: string;
}

export interface YieldPredictionInput {
  country: string;
  crop: string;
  year: number;
  rainfall: number;
  pesticides: number;
  temperature: number;
}

export interface YieldPredictionResult {
  success: boolean;
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
  input_parameters: {
    country: string;
    crop: string;
    year: number;
    rainfall: number;
    pesticides: number;
    temperature: number;
  };
  timestamp: string;
}

export const api = {
  async login(data: LoginData) {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }
    
    return response.json();
  },

  async register(data: RegisterData) {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }
    
    return response.json();
  },

  async getProfile(token: string) {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch profile');
    }
    
    return response.json();
  },

  async updateProfile(token: string, data: Partial<UserProfile>) {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update profile');
    }
    
    return response.json();
  },

  async getCropRecommendations(data: CropRecommendationData): Promise<CropRecommendationResponse> {
    const token = auth.getToken();
    const response = await fetch(`${API_BASE_URL}/crop/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get crop recommendations');
    }
    
    return response.json();
  },

  async getAvailableCrops(): Promise<CropInfo[]> {
    const response = await fetch(`${API_BASE_URL}/crop/crops`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch available crops');
    }
    
    return response.json();
  },

  async getActivities(): Promise<{ activities: any[] }> {
    const token = auth.getToken();
    const response = await fetch(`${API_BASE_URL}/activities`, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch activities');
    }
    
    return response.json();
  },

  async getWeather(location: string): Promise<WeatherData> {
    const response = await fetch(`${API_BASE_URL}/weather?location=${encodeURIComponent(location)}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch weather data');
    }
    
    return response.json();
  },

  async predictIrrigation(data: IrrigationInput): Promise<IrrigationPrediction> {
    const token = auth.getToken();
    const response = await fetch(`${API_BASE_URL}/irrigation/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to predict irrigation needs');
    }
    
    return response.json();
  },

  async getWeatherComplete(location: string = 'New Delhi', units: string = 'metric'): Promise<any> {
    const token = auth.getToken();
    const response = await fetch(`${API_BASE_URL}/weather/complete?location=${encodeURIComponent(location)}&units=${units}`, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch weather data');
    }
    
    return response.json();
  },

  async getYieldCrops(): Promise<{ crops: string[]; count: number }> {
    const response = await fetch(`${API_BASE_URL}/yield/crops`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch crops');
    }
    
    return response.json();
  },

  async predictYield(data: YieldPredictionInput): Promise<YieldPredictionResult> {
    const token = auth.getToken();
    const response = await fetch(`${API_BASE_URL}/yield/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to predict yield');
    }
    
    return response.json();
  },
  
  // Add farming game as nested property for convenience
  farmingGame: {} as typeof farmingGameApi,
};

export const auth = {
  getToken(): string | null {
    // Check both localStorage (permanent) and sessionStorage (session-only)
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  },

  setToken(token: string, rememberMe: boolean = false): void {
    if (rememberMe) {
      // Permanent storage - survives browser close
      localStorage.setItem('token', token);
      localStorage.setItem('rememberMe', 'true');
    } else {
      // Session storage - cleared when browser closes
      sessionStorage.setItem('token', token);
      localStorage.removeItem('rememberMe');
    }
  },

  removeToken(): void {
    // Clear from both storages
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('rememberMe');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  },

  getUser(): UserProfile | null {
    const user = localStorage.getItem('user') || sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  setUser(user: UserProfile, rememberMe: boolean = false): void {
    const userData = JSON.stringify(user);
    if (rememberMe) {
      localStorage.setItem('user', userData);
    } else {
      sessionStorage.setItem('user', userData);
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  getRememberMe(): boolean {
    return localStorage.getItem('rememberMe') === 'true';
  },

  async verifyToken(): Promise<boolean> {
    const token = this.getToken();
    
    if (!token) {
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Token is valid
        return true;
      } else {
        // Token is invalid or expired
        this.removeToken();
        return false;
      }
    } catch (error) {
      // Network error or server error
      console.error('Token verification failed:', error);
      this.removeToken();
      return false;
    }
  },
};

// Farming Simulator API
export const farmingSimulatorApi = {
  async getInfo() {
    const response = await fetch(`${API_BASE_URL}/farming-simulator/info`);
    if (!response.ok) throw new Error('Failed to fetch farming simulator info');
    return response.json();
  },

  async simulate(data: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    temperature: number;
    humidity: number;
    ph: number;
    rainfall: number;
    selected_crop?: string;
  }) {
    const token = auth.getToken();
    const response = await fetch(`${API_BASE_URL}/farming-simulator/simulate-season`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        N: data.nitrogen,
        P: data.phosphorus,
        K: data.potassium,
        temperature: data.temperature,
        humidity: data.humidity,
        ph: data.ph,
        rainfall: data.rainfall,
        selected_crop: data.selected_crop
      }),
    });
    if (!response.ok) throw new Error('Failed to simulate farming');
    return response.json();
  },

  async getRecommendations(data: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    temperature: number;
    humidity: number;
    ph: number;
    rainfall: number;
  }) {
    const response = await fetch(`${API_BASE_URL}/farming-simulator/recommend-crop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        N: data.nitrogen,
        P: data.phosphorus,
        K: data.potassium,
        temperature: data.temperature,
        humidity: data.humidity,
        ph: data.ph,
        rainfall: data.rainfall
      }),
    });
    if (!response.ok) throw new Error('Failed to get recommendations');
    return response.json();
  },

  async getLeaderboard() {
    const token = auth.getToken();
    const response = await fetch(`${API_BASE_URL}/farming-simulator/leaderboard`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch leaderboard');
    return response.json();
  },

  async submitScore(score: number, crops_grown: string[], total_yield: number) {
    const token = auth.getToken();
    const response = await fetch(`${API_BASE_URL}/farming-simulator/leaderboard`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ score, crops_grown, total_yield }),
    });
    if (!response.ok) throw new Error('Failed to submit score');
    return response.json();
  },
};

// Farming Game API Interfaces
export interface GameState {
  _id: string;
  userId: string;
  money: number;
  experience: number;
  level: number;
  createdAt: string;
  updatedAt: string;
}

export interface Inventory {
  _id: string;
  userId: string;
  seeds: { [cropName: string]: number };
  harvested_crops: { [cropName: string]: number };
  createdAt: string;
  updatedAt: string;
}

export interface Plot {
  _id: string;
  userId: string;
  size: 'small' | 'medium' | 'large';
  status: 'empty' | 'planted' | 'growing' | 'ready_to_harvest';
  crop: string | null;
  plantedAt: string | null;
  harvestReadyAt: string | null;
  lastIrrigated: string | null;
  waterLevel: number;
  health: number;
  purchasedAt: string;
}

export interface CropData {
  name: string;
  seed_cost: number;
  sell_price: number;
  grow_time_days: number;
  water_need: 'low' | 'medium' | 'high';
}

export interface Transaction {
  _id: string;
  userId: string;
  type: 'plot_purchase' | 'seed_purchase' | 'crop_sale';
  amount: number;
  details: any;
  timestamp: string;
}

// Farming Game API
export const farmingGameApi = {
  async getGameState() {
    const token = auth.getToken();
    const response = await fetch(`${API_BASE_URL}/farming-game/state`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch game state');
    return response.json();
  },

  async purchasePlot(size: 'small' | 'medium' | 'large') {
    const token = auth.getToken();
    const response = await fetch(`${API_BASE_URL}/farming-game/plots/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ size }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to purchase plot');
    }
    return response.json();
  },

  async plantCrop(plotId: string, crop: string) {
    const token = auth.getToken();
    const response = await fetch(`${API_BASE_URL}/farming-game/plots/${plotId}/plant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ crop }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to plant crop');
    }
    return response.json();
  },

  async irrigatePlot(plotId: string) {
    const token = auth.getToken();
    const response = await fetch(`${API_BASE_URL}/farming-game/plots/${plotId}/irrigate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to irrigate plot');
    }
    return response.json();
  },

  async harvestCrop(plotId: string) {
    const token = auth.getToken();
    const response = await fetch(`${API_BASE_URL}/farming-game/plots/${plotId}/harvest`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to harvest crop');
    }
    return response.json();
  },

  async getSeedsMarket() {
    const response = await fetch(`${API_BASE_URL}/farming-game/marketplace/seeds`);
    if (!response.ok) throw new Error('Failed to fetch seeds market');
    return response.json();
  },

  async buySeeds(crop: string, quantity: number) {
    const token = auth.getToken();
    const response = await fetch(`${API_BASE_URL}/farming-game/marketplace/buy-seeds`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ crop, quantity }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to buy seeds');
    }
    return response.json();
  },

  async sellCrops(crop: string, quantity: number) {
    const token = auth.getToken();
    const response = await fetch(`${API_BASE_URL}/farming-game/marketplace/sell-crops`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ crop, quantity }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to sell crops');
    }
    return response.json();
  },

  async getInventory() {
    const token = auth.getToken();
    const response = await fetch(`${API_BASE_URL}/farming-game/inventory`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch inventory');
    return response.json();
  },

  async getTransactions(limit: number = 50) {
    const token = auth.getToken();
    const response = await fetch(`${API_BASE_URL}/farming-game/transactions?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return response.json();
  },
};

// Make farmingGameApi accessible through api.farmingGame for convenience
api.farmingGame = farmingGameApi;
