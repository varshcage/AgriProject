from flask import Blueprint, request, jsonify
import numpy as np
import joblib
import pandas as pd
from datetime import datetime
import os
import jwt
from functools import wraps

def create_crop_blueprint(users_collection, secret_key, activities_collection):
    crop_bp = Blueprint('crop', __name__, url_prefix='/api')

    # Token verification decorator
    def token_required(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            token = request.headers.get('Authorization')
            
            if not token:
                return jsonify({'message': 'Token is missing!'}), 401
             
            try:
                if token.startswith('Bearer '):
                    token = token[7:]
                data = jwt.decode(token, secret_key, algorithms=["HS256"])
                current_user = users_collection.find_one({'email': data['email']})
                if not current_user:
                    return jsonify({'message': 'User not found!'}), 401
            except jwt.ExpiredSignatureError:
                return jsonify({'message': 'Token has expired!'}), 401
            except jwt.InvalidTokenError:
                return jsonify({'message': 'Invalid token!'}), 401
            
            return f(current_user, *args, **kwargs)
        
        return decorated

    # Load the trained model
    model_path = os.path.join(os.path.dirname(__file__), '..', 'Models', 'crop_recommendation_model.pkl')
    model_data = joblib.load(model_path)
    model = model_data['model']
    scaler = model_data['scaler']
    label_encoder = model_data['label_encoder']
    features = model_data['features']
    print("Crop recommendation model connected successfully!")


    # Additional crop information (you can expand this)
    CROP_DATABASE = {
        'rice': {
            'description': 'Staple food crop requiring ample water',
            'suitable_seasons': ['Kharif', 'Rabi'],
            'water_requirement': 'High',
            'soil_type': 'Clayey',
            'ideal_temp': '20-35°C',
            'ideal_rainfall': '150-300 cm'
        },
        'maize': {
            'description': 'Versatile cereal crop',
            'suitable_seasons': ['Kharif', 'Rabi'],
            'water_requirement': 'Medium',
            'soil_type': 'Well-drained loamy',
            'ideal_temp': '18-27°C',
            'ideal_rainfall': '60-100 cm'
        },
        'cotton': {
            'description': 'Fiber crop for textile industry',
            'suitable_seasons': ['Kharif'],
            'water_requirement': 'Medium',
            'soil_type': 'Black soil',
            'ideal_temp': '21-30°C',
            'ideal_rainfall': '50-100 cm'
        },
        'wheat': {
            'description': 'Winter cereal crop',
            'suitable_seasons': ['Rabi'],
            'water_requirement': 'Medium',
            'soil_type': 'Clay loam',
            'ideal_temp': '10-25°C',
            'ideal_rainfall': '30-100 cm'
        },
        # Add more crops as needed
    }

    @crop_bp.route('/crop/')
    def home():
        return jsonify({
            'message': 'Crop Recommendation API',
            'status': 'active',
            'endpoints': {
                '/api/crop/predict': 'POST - Get crop recommendations',
                '/api/crop/crops': 'GET - List all available crops',
                '/api/crop/health': 'GET - API health check'
            }
        })

    @crop_bp.route('/crop/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'model_loaded': model is not None
        })

    @crop_bp.route('/crop/crops', methods=['GET'])
    def get_crops():
        """Get list of all crops the model can predict"""
        crops = label_encoder.classes_.tolist()
        crops_info = []
        
        for crop in crops:
            crop_lower = crop.lower()
            info = CROP_DATABASE.get(crop_lower, {
                'description': f'{crop.capitalize()} crop',
                'suitable_seasons': ['Varies'],
                'water_requirement': 'Medium',
                'soil_type': 'Varies',
                'ideal_temp': 'Varies',
                'ideal_rainfall': 'Varies'
            })
            crops_info.append({
                'name': crop.capitalize(),
                **info
            })
        
        return jsonify(crops_info)

    @crop_bp.route('/crop/predict', methods=['POST'])
    @token_required
    def predict(current_user):
        """Get crop recommendations based on input parameters"""
        try:
            # Get input data
            data = request.json
            
            # Extract features in correct order
            input_features = [
                float(data.get('nitrogen', 0)),
                float(data.get('phosphorus', 0)),
                float(data.get('potassium', 0)),
                float(data.get('temperature', 0)),
                float(data.get('humidity', 0)),
                float(data.get('ph', 0)),
                float(data.get('rainfall', 0))
            ]
            
            # Validate input ranges (optional)
            errors = validate_input(input_features)
            if errors:
                return jsonify({'error': 'Invalid input', 'details': errors}), 400
            
            # Prepare input array
            input_array = np.array([input_features])
            
            # Scale features
            input_scaled = scaler.transform(input_array)
            
            # Get prediction probabilities
            probabilities = model.predict_proba(input_scaled)[0]
            
            # Get top 5 recommendations
            top_n = 5
            top_indices = probabilities.argsort()[-top_n:][::-1]
            
            recommendations = []
            for idx in top_indices:
                crop_name = label_encoder.inverse_transform([idx])[0]
                probability = float(probabilities[idx] * 100)  # Convert to percentage
                
                # Get additional crop info
                crop_lower = crop_name.lower()
                crop_info = CROP_DATABASE.get(crop_lower, {
                    'description': f'{crop_name.capitalize()} is suitable for these conditions',
                    'suitable_seasons': ['Kharif', 'Rabi'] if probability > 70 else ['Varies'],
                    'water_requirement': 'High' if probability > 85 else 'Medium' if probability > 65 else 'Low',
                    'soil_type': 'Loamy' if probability > 75 else 'Clayey' if probability > 60 else 'Varies'
                })
                
                recommendations.append({
                    'name': crop_name.capitalize(),
                    'probability': round(probability, 1),
                    'reason': generate_reason(crop_name, input_features, probability),
                    'suitableSeasons': crop_info['suitable_seasons'],
                    'waterRequirement': crop_info['water_requirement'],
                    'soilType': crop_info['soil_type'],
                    'description': crop_info['description'],
                    'confidence': 'High' if probability > 85 else 'Medium' if probability > 65 else 'Low'
                })
            
            # Generate AI insights
            ai_insights = generate_insights(input_features, recommendations[0])
            
            response_data = {
                'success': True,
                'recommendations': recommendations,
                'input_parameters': {
                    'nitrogen': input_features[0],
                    'phosphorus': input_features[1],
                    'potassium': input_features[2],
                    'temperature': input_features[3],
                    'humidity': input_features[4],
                    'ph': input_features[5],
                    'rainfall': input_features[6]
                },
                'ai_insights': ai_insights,
                'timestamp': datetime.now().isoformat()
            }
            
            # Store activity in database
            activity = {
                'user_id': str(current_user['_id']),
                'type': 'crop_recommendation',
                'data': {
                    'recommendations': recommendations,
                    'input_parameters': response_data['input_parameters']
                },
                'timestamp': datetime.now()
            }
            activities_collection.insert_one(activity)
            
            return jsonify(response_data)
            
        except Exception as e:
            return jsonify({
                'error': str(e),
                'success': False
            }), 500

    def validate_input(features):
        """Validate input parameter ranges"""
        errors = []
        
        if features[0] < 0 or features[0] > 140:
            errors.append('Nitrogen should be between 0-140 kg/ha')
        if features[1] < 5 or features[1] > 145:
            errors.append('Phosphorus should be between 5-145 kg/ha')
        if features[2] < 5 or features[2] > 205:
            errors.append('Potassium should be between 5-205 kg/ha')
        if features[3] < 8.8 or features[3] > 43.7:
            errors.append('Temperature should be between 8.8-43.7°C')
        if features[4] < 14.3 or features[4] > 99.9:
            errors.append('Humidity should be between 14.3-99.9%')
        if features[5] < 3.5 or features[5] > 9.9:
            errors.append('pH should be between 3.5-9.9')
        if features[6] < 20 or features[6] > 298:
            errors.append('Rainfall should be between 20-298 mm')
        
        return errors

    def generate_reason(crop, features, probability):
        """Generate human-readable reason for recommendation"""
        reasons = []
        
        # Soil nutrients analysis
        n, p, k = features[0], features[1], features[2]
        
        if n > 80:
            reasons.append('high nitrogen levels')
        elif n < 40:
            reasons.append('moderate nitrogen levels')
        
        if p > 50:
            reasons.append('good phosphorus availability')
        
        if k > 50:
            reasons.append('adequate potassium content')
        
        # Climate analysis
        temp, humidity, ph, rainfall = features[3], features[4], features[5], features[6]
        
        if 20 <= temp <= 30:
            reasons.append('optimal temperature range')
        
        if 60 <= humidity <= 80:
            reasons.append('suitable humidity')
        
        if 6 <= ph <= 7.5:
            reasons.append('ideal pH level')
        
        if crop.lower() == 'rice' and rainfall > 150:
            reasons.append('adequate rainfall for paddy')
        elif crop.lower() == 'wheat' and rainfall < 100:
            reasons.append('appropriate rainfall for cereals')
        
        if not reasons:
            reasons.append('suitable growing conditions')
        
        return f'Excellent match due to {", ".join(reasons)}'

    def generate_insights(features, top_crop):
        """Generate AI insights based on analysis"""
        insights = []
        
        # Analyze soil fertility
        n, p, k = features[0], features[1], features[2]
        avg_npk = (n + p + k) / 3
        
        if avg_npk > 80:
            insights.append("Soil fertility is excellent. Consider planting high-yield varieties.")
        elif avg_npk > 50:
            insights.append("Soil has good nutrient levels. Regular fertilization recommended.")
        else:
            insights.append("Soil needs nutrient supplementation for optimal growth.")
        
        # Analyze pH
        ph = features[5]
        if ph < 6:
            insights.append("Soil is slightly acidic. Consider adding lime for pH balance.")
        elif ph > 8:
            insights.append("Soil is alkaline. Organic matter addition can help balance pH.")
        
        # Water management
        rainfall = features[6]
        if rainfall < 100:
            insights.append("Rainfall is low. Implement water conservation techniques.")
        elif rainfall > 200:
            insights.append("Adequate rainfall expected. Ensure proper drainage systems.")
        
        # Crop-specific advice
        crop_name = top_crop['name'].lower()
        if crop_name == 'rice':
            insights.append("Rice requires consistent water management. Consider System of Rice Intensification (SRI) methods.")
        elif crop_name == 'wheat':
            insights.append("Wheat benefits from nitrogen split application for better yield.")
        elif crop_name == 'cotton':
            insights.append("Cotton requires careful pest management during boll formation.")
        
        return insights

    @crop_bp.route('/activities', methods=['GET'])
    @token_required
    def get_activities(current_user):
        """Get recent activities for the current user"""
        try:
            user_id = str(current_user['_id'])
            activities = list(activities_collection.find(
                {'user_id': user_id},
                {'_id': 0, 'user_id': 0}
            ).sort('timestamp', -1).limit(10))
            
            # Format timestamps
            for activity in activities:
                if 'timestamp' in activity:
                    activity['timestamp'] = activity['timestamp'].isoformat()
            
            return jsonify({'activities': activities})
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    return crop_bp