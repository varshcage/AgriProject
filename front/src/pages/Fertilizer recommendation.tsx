import { useState } from 'react';
import Layout from '../components/Layout';
import { 
  FlaskConical, 
  Leaf, 
  Thermometer, 
  CloudRain, 
  Wind, 
  Scale, 
  AlertTriangle, 
  CheckCircle, 
  PieChart,
  Sprout,
  Package,
  Calculator,
  History
} from 'lucide-react';

interface FertilizerRecommendationProps {
  onLogout: () => void;
}

export default function FertilizerRecommendation({ onLogout }: FertilizerRecommendationProps) {
  const [formData, setFormData] = useState({
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    ph: '',
    cropType: '',
    soilType: 'loam',
    temperature: '',
    humidity: '',
    rainfall: '',
    organicMatter: 'medium',
  });

  const [recommendationResult, setRecommendationResult] = useState<{
    primaryFertilizer: string;
    secondaryFertilizer: string;
    applicationRate: string; // kg/hectare
    applicationTiming: string;
    applicationMethod: string;
    totalCost: string;
    npkRatio: string;
    expectedBenefit: string;
    
    soilAnalysis: {
      nitrogen: { value: number; status: string; recommendation: string };
      phosphorus: { value: number; status: string; recommendation: string };
      potassium: { value: number; status: string; recommendation: string };
      ph: { value: number; status: string; recommendation: string };
      organicMatter: { value: string; status: string; recommendation: string };
    };
    
    recommendations: Array<{
      fertilizer: string;
      dosage: string;
      timing: string;
      purpose: string;
      priority: 'high' | 'medium' | 'low';
      notes: string;
    }>;
    
    warnings: Array<{
      type: 'overdose' | 'timing' | 'interaction' | 'environmental';
      severity: 'high' | 'medium' | 'low';
      message: string;
      suggestion: string;
    }>;
    
    alternatives: Array<{
      name: string;
      npk: string;
      cost: string;
      suitability: 'excellent' | 'good' | 'moderate' | 'poor';
      benefits: string[];
      drawbacks: string[];
    }>;
    
    soilAmendments: Array<{
      name: string;
      purpose: string;
      quantity: string;
      timing: string;
      cost: string;
    }>;
    
    roiAnalysis: {
      fertilizerCost: number;
      expectedYieldIncrease: string;
      estimatedRevenueIncrease: string;
      roiPercentage: number;
      breakEvenPeriod: string;
    };
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const getFertilizerRecommendation = async () => {
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const {
      nitrogen = '0',
      phosphorus = '0',
      potassium = '0',
      ph = '0',
      soilType = 'loam',
      temperature = '0',
      rainfall = '0',
      organicMatter = 'medium',
    } = formData;

    const N = parseFloat(nitrogen);
    const P = parseFloat(phosphorus);
    const K = parseFloat(potassium);
    const pH = parseFloat(ph);
    const temp = parseFloat(temperature);
    const rain = parseFloat(rainfall);

    // Mock fertilizer recommendation logic
    const calculateRecommendation = () => {
      // Determine deficiencies
      const isNDeficient = N < 30;
      const isPDeficient = P < 20;
      const isKDeficient = K < 150;
      
      // Determine pH status
      const getPHStatus = () => {
        if (pH < 6.0) return 'acidic';
        if (pH > 7.5) return 'alkaline';
        return 'optimal';
      };

      // Determine organic matter status
      const getOMStatus = () => {
        if (organicMatter === 'low') return 'low';
        if (organicMatter === 'high') return 'high';
        return 'medium';
      };

      // Select fertilizer based on deficiencies
      let primaryFertilizer = '';
      let secondaryFertilizer = '';
      let npkRatio = '';

      if (isNDeficient && isPDeficient && isKDeficient) {
        primaryFertilizer = 'NPK Complete (19:19:19)';
        npkRatio = '1:1:1';
        secondaryFertilizer = 'Organic Compost';
      } else if (isNDeficient && isPDeficient) {
        primaryFertilizer = 'DAP (18:46:0)';
        npkRatio = '1:2.5:0';
        secondaryFertilizer = 'Urea';
      } else if (isNDeficient && isKDeficient) {
        primaryFertilizer = 'Urea + MOP';
        npkRatio = '1:0:1';
        secondaryFertilizer = 'Potassium Sulfate';
      } else if (isPDeficient && isKDeficient) {
        primaryFertilizer = 'SSP + MOP';
        npkRatio = '0:1:1';
        secondaryFertilizer = 'Rock Phosphate';
      } else if (isNDeficient) {
        primaryFertilizer = 'Urea (46:0:0)';
        npkRatio = '1:0:0';
        secondaryFertilizer = 'Ammonium Nitrate';
      } else if (isPDeficient) {
        primaryFertilizer = 'Single Super Phosphate (0:18:0)';
        npkRatio = '0:1:0';
        secondaryFertilizer = 'DAP';
      } else if (isKDeficient) {
        primaryFertilizer = 'Muriate of Potash (0:0:60)';
        npkRatio = '0:0:1';
        secondaryFertilizer = 'Potassium Nitrate';
      } else {
        primaryFertilizer = 'Balanced NPK (14:35:14)';
        npkRatio = '1:2.5:1';
        secondaryFertilizer = 'Organic Fertilizer';
      }

      // Calculate application rate based on deficiencies
      const calculateRate = () => {
        const baseRate = 200; // kg/ha base rate
        let nDeficit = Math.max(0, 50 - N) * 2.17; // Convert to urea equivalent
        let pDeficit = Math.max(0, 30 - P) * 2.29; // Convert to DAP equivalent
        let kDeficit = Math.max(0, 200 - K) * 1.67; // Convert to MOP equivalent
        
        const totalDeficit = nDeficit + pDeficit + kDeficit;
        return totalDeficit > 0 ? Math.round(totalDeficit) : baseRate;
      };

      // Soil analysis
      const soilAnalysis = {
        nitrogen: {
          value: N,
          status: N < 30 ? 'deficient' : N > 100 ? 'excess' : 'adequate',
          recommendation: N < 30 ? 'Apply nitrogen fertilizer' : 
                        N > 100 ? 'Reduce nitrogen application' : 'Adequate level'
        },
        phosphorus: {
          value: P,
          status: P < 20 ? 'deficient' : P > 50 ? 'excess' : 'adequate',
          recommendation: P < 20 ? 'Apply phosphorus fertilizer' : 
                        P > 50 ? 'Reduce phosphorus application' : 'Adequate level'
        },
        potassium: {
          value: K,
          status: K < 150 ? 'deficient' : K > 250 ? 'excess' : 'adequate',
          recommendation: K < 150 ? 'Apply potassium fertilizer' : 
                        K > 250 ? 'Reduce potassium application' : 'Adequate level'
        },
        ph: {
          value: pH,
          status: getPHStatus(),
          recommendation: pH < 6.0 ? 'Apply lime (2-4 tons/ha)' : 
                        pH > 7.5 ? 'Apply sulfur (1-2 tons/ha)' : 'Optimal pH range'
        },
        organicMatter: {
          value: organicMatter,
          status: getOMStatus(),
          recommendation: organicMatter === 'low' ? 'Add organic compost (10-15 tons/ha)' :
                        organicMatter === 'medium' ? 'Maintain current organic matter' :
                        'Reduce organic inputs'
        }
      };

      // Detailed recommendations
      const recommendations = [];
      
      if (isNDeficient) {
        recommendations.push({
          fertilizer: 'Urea',
          dosage: `${Math.max(100, Math.round((30 - N) * 2.17))} kg/ha`,
          timing: 'Split application - 50% basal, 50% top dressing',
          purpose: 'Correct nitrogen deficiency, promote vegetative growth',
          priority: 'high' as const,
          notes: 'Apply before sowing and during active growth'
        });
      }
      
      if (isPDeficient) {
        recommendations.push({
          fertilizer: 'DAP',
          dosage: `${Math.max(150, Math.round((20 - P) * 2.29))} kg/ha`,
          timing: 'Basal application before sowing',
          purpose: 'Improve root development and flowering',
          priority: 'high' as const,
          notes: 'Apply at sowing time, mix well with soil'
        });
      }
      
      if (isKDeficient) {
        recommendations.push({
          fertilizer: 'MOP',
          dosage: `${Math.max(100, Math.round((150 - K) * 1.67))} kg/ha`,
          timing: 'Split application - 50% basal, 50% at flowering',
          purpose: 'Enhance disease resistance and fruit quality',
          priority: 'medium' as const,
          notes: 'Avoid application during drought conditions'
        });
      }

      // Add organic fertilizer if organic matter is low
      if (organicMatter === 'low') {
        recommendations.push({
          fertilizer: 'Organic Compost',
          dosage: '10-15 tons/ha',
          timing: 'Apply 2-3 weeks before sowing',
          purpose: 'Improve soil structure and water retention',
          priority: 'medium' as const,
          notes: 'Ensure proper decomposition before application'
        });
      }

      // Warnings
      const warnings = [];
      
      if (N > 100) {
        warnings.push({
          type: 'overdose' as const,
          severity: 'high' as const,
          message: 'High nitrogen levels detected',
          suggestion: 'Reduce nitrogen fertilizer to prevent leaching and pollution'
        });
      }
      
      if (pH < 5.5) {
        warnings.push({
          type: 'environmental' as const,
          severity: 'high' as const,
          message: 'Highly acidic soil',
          suggestion: 'Apply lime before fertilizer application to improve efficiency'
        });
      }
      
      if (rain > 1000) {
        warnings.push({
          type: 'timing' as const,
          severity: 'medium' as const,
          message: 'High rainfall season',
          suggestion: 'Split fertilizer application to prevent nutrient leaching'
        });
      }

      // Alternative fertilizers
      const alternatives = [
        {
          name: 'Organic NPK',
          npk: '5:3:2',
          cost: '₹8000-10000/ton',
          suitability: 'good' as const,
          benefits: ['Slow release', 'Improves soil health', 'Environmentally friendly'],
          drawbacks: ['Lower nutrient concentration', 'Higher volume needed']
        },
        {
          name: 'Liquid Fertilizer',
          npk: '20:20:20',
          cost: '₹150-200/liter',
          suitability: 'excellent' as const,
          benefits: ['Fast absorption', 'Easy application', 'Uniform distribution'],
          drawbacks: ['Higher cost', 'Frequent application needed']
        },
        {
          name: 'Slow Release Fertilizer',
          npk: '14:14:14',
          cost: '₹12000-15000/ton',
          suitability: 'good' as const,
          benefits: ['Reduced leaching', 'Long-lasting effect', 'Less frequent application'],
          drawbacks: ['Higher initial cost', 'Slower initial response']
        }
      ];

      // Soil amendments
      const soilAmendments = [];
      
      if (pH < 6.0) {
        soilAmendments.push({
          name: 'Agricultural Lime',
          purpose: 'Raise soil pH',
          quantity: `${Math.round((6.5 - pH) * 2)} tons/ha`,
          timing: 'Apply 4-6 weeks before sowing',
          cost: '₹3000-4000/ton'
        });
      }
      
      if (organicMatter === 'low') {
        soilAmendments.push({
          name: 'Vermicompost',
          purpose: 'Increase organic matter',
          quantity: '5-8 tons/ha',
          timing: 'Apply during land preparation',
          cost: '₹2000-3000/ton'
        });
      }

      // ROI Analysis
      const fertilizerCost = calculateRate() * 25; // Assuming ₹25/kg
      const expectedYieldIncrease = isNDeficient || isPDeficient || isKDeficient ? '15-25%' : '5-10%';
      const estimatedRevenueIncrease = fertilizerCost * 3; // Assuming 3x return
      const roiPercentage = ((estimatedRevenueIncrease - fertilizerCost) / fertilizerCost) * 100;
      
      return {
        primaryFertilizer,
        secondaryFertilizer,
        applicationRate: `${calculateRate()} kg/ha`,
        applicationTiming: temp > 25 ? 'Early morning or late evening' : 'Mid-morning',
        applicationMethod: soilType === 'clay' ? 'Broadcast and incorporate' : 'Band placement',
        totalCost: `₹${fertilizerCost}/ha`,
        npkRatio,
        expectedBenefit: expectedYieldIncrease,
        
        soilAnalysis,
        recommendations,
        warnings,
        alternatives,
        soilAmendments,
        
        roiAnalysis: {
          fertilizerCost,
          expectedYieldIncrease,
          estimatedRevenueIncrease: `₹${estimatedRevenueIncrease}/ha`,
          roiPercentage: Math.round(roiPercentage),
          breakEvenPeriod: '1 growing season'
        }
      };
    };

    const result = calculateRecommendation();
    setRecommendationResult(result);
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    getFertilizerRecommendation();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deficient':
      case 'acidic':
      case 'low': return 'bg-red-100 text-red-800 border-red-200';
      case 'adequate':
      case 'optimal':
      case 'medium': return 'bg-green-100 text-green-800 border-green-200';
      case 'excess':
      case 'alkaline':
      case 'high': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-50 border-red-200 text-red-800';
      case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSuitabilityColor = (suitability: string) => {
    switch (suitability) {
      case 'excellent': return 'bg-emerald-100 text-emerald-800';
      case 'good': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const sampleHistory = [
    { date: '2024-01-15', crop: 'Rice', fertilizer: 'Urea + DAP', rate: '250 kg/ha', cost: '₹6250', yieldIncrease: '22%' },
    { date: '2023-12-10', crop: 'Wheat', fertilizer: 'NPK 19:19:19', rate: '300 kg/ha', cost: '₹7500', yieldIncrease: '18%' },
    { date: '2023-11-05', crop: 'Maize', fertilizer: 'DAP + MOP', rate: '280 kg/ha', cost: '₹7000', yieldIncrease: '25%' },
    { date: '2023-10-20', crop: 'Cotton', fertilizer: 'Urea + SSP', rate: '220 kg/ha', cost: '₹5500', yieldIncrease: '20%' },
  ];

  return (
    <Layout onLogout={onLogout}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Fertilizer Recommendation System</h1>
              <p className="text-gray-600">
                AI-powered fertilizer recommendations based on soil analysis and crop requirements
              </p>
            </div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <History className="w-4 h-4 mr-2" />
              {showHistory ? 'Hide History' : 'View History'}
            </button>
          </div>
        </div>

        {showHistory ? (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recommendation History</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fertilizer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yield Increase</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sampleHistory.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.crop}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.fertilizer}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.rate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.cost}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          {item.yieldIncrease}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Form - Left Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <FlaskConical className="w-5 h-5 mr-2 text-indigo-600" />
                Soil Analysis & Crop Information
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Soil Nutrients Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <PieChart className="w-4 h-4 mr-2 text-green-600" />
                    Soil Nutrient Analysis (mg/kg)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Leaf className="inline w-4 h-4 mr-1 text-green-600" />
                        Nitrogen (N)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="nitrogen"
                          value={formData.nitrogen}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                          placeholder="e.g., 45"
                          min="0"
                          step="1"
                          required
                        />
                        <div className="absolute right-3 top-3 text-sm text-gray-500">mg/kg</div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Optimal: 30-100 mg/kg</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phosphorus (P)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="phosphorus"
                          value={formData.phosphorus}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                          placeholder="e.g., 25"
                          min="0"
                          step="1"
                          required
                        />
                        <div className="absolute right-3 top-3 text-sm text-gray-500">mg/kg</div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Optimal: 20-50 mg/kg</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Potassium (K)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="potassium"
                          value={formData.potassium}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                          placeholder="e.g., 180"
                          min="0"
                          step="1"
                          required
                        />
                        <div className="absolute right-3 top-3 text-sm text-gray-500">mg/kg</div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Optimal: 150-250 mg/kg</p>
                    </div>
                  </div>
                </div>

                {/* Soil Properties Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Scale className="w-4 h-4 mr-2 text-yellow-600" />
                    Soil Properties
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Soil pH
                      </label>
                      <input
                        type="number"
                        name="ph"
                        value={formData.ph}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        placeholder="e.g., 6.5"
                        min="0"
                        max="14"
                        step="0.1"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Optimal: 6.0-7.5</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Soil Type
                      </label>
                      <select
                        name="soilType"
                        value={formData.soilType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      >
                        <option value="loam">Loam</option>
                        <option value="clay">Clay</option>
                        <option value="sandy">Sandy</option>
                        <option value="silt">Silt</option>
                        <option value="clay-loam">Clay Loam</option>
                        <option value="sandy-loam">Sandy Loam</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Organic Matter Content
                      </label>
                      <select
                        name="organicMatter"
                        value={formData.organicMatter}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      >
                        <option value="low">Low (&lt;2%)</option>
                        <option value="medium">Medium (2-4%)</option>
                        <option value="high">High (&gt;4%)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Crop Type
                      </label>
                      <select
                        name="cropType"
                        value={formData.cropType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        required
                      >
                        <option value="">Select Crop</option>
                        <option value="rice">Rice</option>
                        <option value="wheat">Wheat</option>
                        <option value="maize">Maize</option>
                        <option value="cotton">Cotton</option>
                        <option value="sugarcane">Sugarcane</option>
                        <option value="pulses">Pulses</option>
                        <option value="oilseeds">Oilseeds</option>
                        <option value="vegetables">Vegetables</option>
                        <option value="fruits">Fruits</option>
                        <option value="plantation">Plantation Crops</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Environmental Conditions Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Thermometer className="w-4 h-4 mr-2 text-orange-600" />
                    Environmental Conditions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Thermometer className="inline w-4 h-4 mr-1 text-orange-600" />
                        Temperature (°C)
                      </label>
                      <input
                        type="number"
                        name="temperature"
                        value={formData.temperature}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        placeholder="e.g., 28"
                        min="-10"
                        max="50"
                        step="0.1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Wind className="inline w-4 h-4 mr-1 text-blue-600" />
                        Humidity (%)
                      </label>
                      <input
                        type="number"
                        name="humidity"
                        value={formData.humidity}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        placeholder="e.g., 75"
                        min="0"
                        max="100"
                        step="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <CloudRain className="inline w-4 h-4 mr-1 text-blue-600" />
                        Rainfall (mm)
                      </label>
                      <input
                        type="number"
                        name="rainfall"
                        value={formData.rainfall}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        placeholder="e.g., 850"
                        min="0"
                        step="1"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition duration-200 shadow-lg flex items-center justify-center disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Analyzing Soil & Generating Recommendations...
                      </>
                    ) : (
                      <>
                        <Calculator className="w-5 h-5 mr-2" />
                        Get Fertilizer Recommendations
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Detailed Recommendations - Only shown after prediction */}
            {recommendationResult && (
              <>
                {/* Soil Analysis Results */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Soil Analysis Results</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(recommendationResult.soilAnalysis).map(([key, value]: [string, any]) => (
                      <div key={key} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-gray-900 capitalize">{key}</span>
                          <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(value.status)}`}>
                            {value.status.charAt(0).toUpperCase() + value.status.slice(1)}
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-2">
                          {typeof value.value === 'number' ? value.value.toFixed(1) : value.value}
                        </div>
                        <p className="text-sm text-gray-600">{value.recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detailed Recommendations */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Detailed Fertilizer Plan</h3>
                  <div className="space-y-4">
                    {recommendationResult.recommendations.map((rec, idx) => (
                      <div key={idx} className={`border-l-4 pl-4 py-4 rounded-r-lg ${getPriorityColor(rec.priority)}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="font-semibold text-lg">{rec.fertilizer}</span>
                            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getPriorityColor(rec.priority)}`}>
                              Priority: {rec.priority}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">{rec.dosage}</div>
                            <div className="text-sm text-gray-600">{rec.timing}</div>
                          </div>
                        </div>
                        <p className="mb-2">{rec.purpose}</p>
                        <p className="text-sm text-gray-600">{rec.notes}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Alternative Fertilizers */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Alternative Fertilizer Options</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {recommendationResult.alternatives.map((alt, idx) => (
                      <div key={idx} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <span className="font-semibold text-gray-900">{alt.name}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getSuitabilityColor(alt.suitability)}`}>
                            {alt.suitability}
                          </span>
                        </div>
                        <div className="mb-3">
                          <div className="text-sm text-gray-600 mb-1">NPK Ratio: {alt.npk}</div>
                          <div className="text-sm text-gray-600">Cost: {alt.cost}</div>
                        </div>
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-gray-900 mb-1">Benefits:</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {alt.benefits.map((benefit, i) => (
                              <li key={i} className="flex items-start">
                                <CheckCircle className="w-3 h-3 text-green-500 mr-1 mt-0.5" />
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-1">Drawbacks:</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {alt.drawbacks.map((drawback, i) => (
                              <li key={i} className="flex items-start">
                                <AlertTriangle className="w-3 h-3 text-yellow-500 mr-1 mt-0.5" />
                                {drawback}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Soil Amendments */}
                {recommendationResult.soilAmendments.length > 0 && (
                  <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Recommended Soil Amendments</h3>
                    <div className="space-y-4">
                      {recommendationResult.soilAmendments.map((amend, idx) => (
                        <div key={idx} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-semibold text-lg">{amend.name}</span>
                            <span className="text-lg font-bold text-gray-900">{amend.quantity}</span>
                          </div>
                          <p className="text-gray-600 mb-2">{amend.purpose}</p>
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>Timing: {amend.timing}</span>
                            <span>Cost: {amend.cost}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Results Panel - Right Column */}
          <div className="space-y-6">
            {/* Main Recommendation Card */}
            {recommendationResult ? (
              <>
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Recommended Fertilizer</h2>
                    <Package className="w-10 h-10" />
                  </div>
                  
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold mb-2">{recommendationResult.primaryFertilizer}</div>
                    <div className="opacity-90">Primary Recommendation</div>
                  </div>

                  {/* Secondary Recommendation */}
                  <div className="mb-6">
                    <div className="text-sm opacity-90 mb-1">Secondary Option</div>
                    <div className="text-xl font-semibold">{recommendationResult.secondaryFertilizer}</div>
                  </div>

                  {/* Application Details */}
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Application Rate:</span>
                      <span className="font-semibold">{recommendationResult.applicationRate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>NPK Ratio:</span>
                      <span className="font-semibold">{recommendationResult.npkRatio}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Cost:</span>
                      <span className="font-semibold">{recommendationResult.totalCost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Application Timing:</span>
                      <span className="font-semibold">{recommendationResult.applicationTiming}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Method:</span>
                      <span className="font-semibold">{recommendationResult.applicationMethod}</span>
                    </div>
                  </div>
                </div>

                {/* Warnings */}
                {recommendationResult.warnings.length > 0 && (
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                      Important Warnings
                    </h3>
                    <div className="space-y-3">
                      {recommendationResult.warnings.map((warning, idx) => (
                        <div
                          key={idx}
                          className={`border-l-4 pl-4 py-3 rounded-r-lg ${getSeverityColor(warning.severity)}`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium">{warning.message}</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              warning.severity === 'high' ? 'bg-red-200 text-red-800' :
                              warning.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                              'bg-blue-200 text-blue-800'
                            }`}>
                              {warning.type}
                            </span>
                          </div>
                          <p className="text-sm">{warning.suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ROI Analysis */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Return on Investment Analysis</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">Fertilizer Cost</span>
                      <span className="font-semibold">₹{recommendationResult.roiAnalysis.fertilizerCost}/ha</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">Expected Yield Increase</span>
                      <span className="font-semibold text-green-600">{recommendationResult.roiAnalysis.expectedYieldIncrease}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">Estimated Revenue Increase</span>
                      <span className="font-semibold text-green-600">{recommendationResult.roiAnalysis.estimatedRevenueIncrease}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Break-even Period</span>
                      <span className="font-semibold">{recommendationResult.roiAnalysis.breakEvenPeriod}</span>
                    </div>
                    
                    {/* ROI Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>ROI Percentage</span>
                        <span className="font-semibold">{recommendationResult.roiAnalysis.roiPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-1000 ${
                            recommendationResult.roiAnalysis.roiPercentage > 100 ? 'bg-green-500' :
                            recommendationResult.roiAnalysis.roiPercentage > 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(recommendationResult.roiAnalysis.roiPercentage, 200)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Best Practices */}
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-6">
                  <h4 className="font-semibold text-emerald-900 mb-4 flex items-center">
                    <Sprout className="w-5 h-5 mr-2" />
                    Best Practices
                  </h4>
                  <ul className="space-y-2 text-emerald-800">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Split fertilizer application for better nutrient uptake</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Apply fertilizers when soil moisture is adequate</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Incorporate fertilizers into soil to reduce volatilization</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Monitor crop response and adjust as needed</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Consider soil test every 2-3 years</span>
                    </li>
                  </ul>
                </div>

                {/* Download Report */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Export Report</h3>
                  <div className="space-y-3">
                    <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                      Download PDF Report
                    </button>
                    <button className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                      Share with Advisor
                    </button>
                    <button className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                      Save to History
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Fertilizer Recommendations</h3>
                <p className="text-gray-500 mb-6">
                  Enter soil analysis data to get personalized fertilizer recommendations
                </p>
                <div className="space-y-3 text-sm text-gray-600 text-left">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></div>
                    <span>N-P-K soil nutrient levels</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span>Soil pH and organic matter</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                    <span>Crop type and soil properties</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span>Environmental conditions</span>
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