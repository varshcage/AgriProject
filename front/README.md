# AgriSmart - AI-Based Agriculture Student Platform

A comprehensive AI-powered agriculture learning platform built with React, TypeScript, and Tailwind CSS.

## 🌾 Features

### Authentication
- **Login & Registration**: Secure user authentication with a beautiful UI
- Session management for protected routes

### Dashboard
- Overview of all platform features
- Quick statistics and metrics
- Direct access to all tools

### AI-Powered Tools

1. **Crop Recommendation System**
   - Input soil nutrients (N, P, K)
   - Climate data analysis
   - AI-powered crop suggestions with confidence scores
   - Detailed reasoning for recommendations

2. **Weather Forecasting**
   - 7-day weather predictions
   - Current weather conditions
   - Farming recommendations based on weather
   - Detailed metrics (temperature, humidity, wind, precipitation)

3. **Irrigation Water Level Predictor**
   - Smart irrigation recommendations
   - Water level predictions
   - Irrigation type suggestions (Drip, Sprinkler, etc.)
   - Automated scheduling
   - Water conservation tips

4. **Yield Prediction**
   - Crop yield forecasting using ML
   - Confidence scores
   - Contributing factor analysis
   - Comparison with state and national averages
   - Improvement recommendations

5. **Farming Simulator**
   - Interactive farming game
   - Plant and harvest crops
   - Resource management (water, fertilizer)
   - Economic simulation
   - Learn farming fundamentals through gameplay

6. **Marketplace**
   - Buy agricultural products
   - Sell your produce
   - Search and filter functionality
   - Product ratings and reviews
   - Shopping cart system

7. **Inventory Management**
   - Track farm resources
   - Stock level monitoring
   - Low stock alerts
   - Expiry date tracking
   - Add/edit/delete items

8. **Student Profile**
   - Personal information management
   - Learning statistics
   - Achievement system
   - Activity tracking
   - Progress overview

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
src/
├── components/
│   └── Layout.tsx          # Main layout with sidebar navigation
├── pages/
│   ├── Login.tsx           # Login page
│   ├── Register.tsx        # Registration page
│   ├── Dashboard.tsx       # Main dashboard
│   ├── CropRecommendation.tsx
│   ├── WeatherForecast.tsx
│   ├── IrrigationPredictor.tsx
│   ├── YieldPrediction.tsx
│   ├── FarmingSimulator.tsx
│   ├── Marketplace.tsx
│   ├── Inventory.tsx
│   └── StudentProfile.tsx
├── App.tsx                 # Main app with routing
├── main.tsx               # App entry point
└── index.css              # Global styles

```

## 🎨 Technologies Used

- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router v6** - Navigation
- **Lucide React** - Icons
- **Vite** - Build tool

## 🎯 Key Features

### Responsive Design
- Mobile-first approach
- Responsive sidebar navigation
- Optimized for all screen sizes

### User Experience
- Intuitive navigation
- Beautiful gradients and animations
- Consistent design language
- Interactive forms with validation

### Educational Focus
- Learn-by-doing approach
- Practical simulations
- Real-world applications
- Progress tracking

## 🔐 Authentication Flow

1. Users start at login page
2. Can register for new account
3. After login, access to all features
4. Protected routes ensure security
5. Logout returns to login page

## 📊 Sample Data

The application includes sample data for demonstration:
- Pre-populated inventory items
- Sample marketplace products
- Example weather forecasts
- Mock prediction results

## 🎓 Educational Value

This platform helps agriculture students:
- Understand AI applications in farming
- Practice decision-making
- Learn resource management
- Explore market dynamics
- Track learning progress

## 🌟 Future Enhancements

- Backend API integration
- Real AI/ML model integration
- Real-time weather API
- Database for persistent storage
- User authentication with JWT
- Advanced analytics dashboard
- Mobile app version
- Multi-language support

## 📝 License

This project is for educational purposes.

## 👨‍💻 Developer Notes

### Default Login
- Email: Any valid email format
- Password: Any password
- Authentication is currently client-side only

### Customization
- Colors: Modify `tailwind.config.js`
- Routes: Update `App.tsx`
- Components: All in `src/pages/` and `src/components/`

## 🐛 Known Issues

- Authentication is not persistent (refresh logs out)
- All predictions are simulated
- No real backend integration yet

## 📞 Support

For questions or issues, please check the documentation or create an issue in the repository.

---

Built with ❤️ for Agriculture Students
