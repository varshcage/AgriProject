"""
Farming Simulator API
Combines crop recommendation and yield prediction for an interactive farming game
"""
from flask import Blueprint, request, jsonify
import numpy as np
import joblib
import json
import os
from functools import wraps
import jwt
from datetime import datetime

def create_farming_simulator_blueprint(users_collection, secret_key, activities_collection):
    farming_simulator_bp = Blueprint('farming_simulator', __name__)
    
    # Token verification decorator
    def token_required(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            token = request.headers.get('Authorization')
            if not token:
                return jsonify({'error': 'Token is missing'}), 401
            try:
                if token.startswith('Bearer '):
                    token = token.split(' ')[1]
                data = jwt.decode(token, secret_key, algorithms=["HS256"])
                current_user = users_collection.find_one({'email': data['email']})
                if not current_user:
                    return jsonify({'error': 'User not found'}), 401
            except Exception as e:
                return jsonify({'error': 'Token is invalid', 'message': str(e)}), 401
            return f(current_user, *args, **kwargs)
        return decorated
    
    # Load models and metadata
    try:
        # Get the base directory (parent of Backend)
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        models_dir = os.path.join(base_dir, 'Models')
        
        crop_model = joblib.load(os.path.join(models_dir, 'farming_simulator_crop_model.joblib'))
        yield_model = joblib.load(os.path.join(models_dir, 'farming_simulator_yield_model.joblib'))
        label_encoder_area = joblib.load(os.path.join(models_dir, 'farming_simulator_label_encoder_area.joblib'))
        label_encoder_item = joblib.load(os.path.join(models_dir, 'farming_simulator_label_encoder_item.joblib'))
        
        with open(os.path.join(models_dir, 'farming_simulator_metadata.json'), 'r') as f:
            metadata = json.load(f)
        
        with open(os.path.join(models_dir, 'farming_simulator_crops_info.json'), 'r') as f:
            crops_info = json.load(f)
        
        print("✓ Farming Simulator models loaded successfully")
    except Exception as e:
        print(f"⚠ Error loading farming simulator models: {str(e)}")
        crop_model = None
        yield_model = None
    
    @farming_simulator_bp.route('/health', methods=['GET'])
    def health_check():
        """Check if farming simulator service is running"""
        return jsonify({
            'status': 'healthy',
            'models_loaded': crop_model is not None and yield_model is not None,
            'timestamp': datetime.now().isoformat()
        })
    
    @farming_simulator_bp.route('/info', methods=['GET'])
    def get_info():
        """Get farming simulator information and available crops"""
        if not crop_model or not yield_model:
            return jsonify({'error': 'Models not loaded'}), 500
        
        return jsonify({
            'crop_recommendation': {
                'available_crops': metadata['crop_recommendation']['crops'],
                'model_type': metadata['crop_recommendation']['model_type'],
                'accuracy': metadata['crop_recommendation']['accuracy'],
                'features_required': metadata['crop_recommendation']['features']
            },
            'yield_prediction': {
                'available_crops': metadata['yield_prediction']['crops'],
                'available_areas': metadata['yield_prediction']['areas'][:20],  # First 20 areas
                'model_type': metadata['yield_prediction']['model_type'],
                'r2_score': metadata['yield_prediction']['r2_score']
            },
            'crops_info': crops_info
        })
    
    @farming_simulator_bp.route('/recommend-crop', methods=['POST'])
    def recommend_crop():
        """Recommend best crop based on soil and environmental conditions"""
        if not crop_model:
            return jsonify({'error': 'Crop recommendation model not loaded'}), 500
        
        try:
            data = request.get_json()
            
            # Required features
            required_features = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
            
            # Validate input
            for feature in required_features:
                if feature not in data:
                    return jsonify({'error': f'Missing required field: {feature}'}), 400
            
            # Prepare input
            input_data = np.array([[
                float(data['N']),
                float(data['P']),
                float(data['K']),
                float(data['temperature']),
                float(data['humidity']),
                float(data['ph']),
                float(data['rainfall'])
            ]])
            
            # Get prediction and probabilities
            predicted_crop = crop_model.predict(input_data)[0]
            probabilities = crop_model.predict_proba(input_data)[0]
            
            # Get top 3 recommendations
            top_3_indices = np.argsort(probabilities)[-3:][::-1]
            recommendations = []
            
            for idx in top_3_indices:
                crop_name = crop_model.classes_[idx]
                confidence = float(probabilities[idx])
                
                # Get crop info
                crop_details = crops_info['crop_info'].get(crop_name, {})
                
                recommendations.append({
                    'crop': crop_name,
                    'confidence': confidence,
                    'suitability_score': confidence * 100,
                    'average_requirements': crop_details
                })
            
            # Log activity (only if user is authenticated)
            token = request.headers.get('Authorization')
            if token:
                try:
                    if token.startswith('Bearer '):
                        token = token.split(' ')[1]
                    token_data = jwt.decode(token, secret_key, algorithms=["HS256"])
                    current_user = users_collection.find_one({'email': token_data['email']})
                    if current_user:
                        activity = {
                            'userId': str(current_user['_id']),
                            'type': 'farming_simulator_crop_recommendation',
                            'input': data,
                            'result': {
                                'recommended_crop': predicted_crop,
                                'top_recommendations': recommendations
                            },
                            'timestamp': datetime.now().isoformat()
                        }
                        activities_collection.insert_one(activity)
                except:
                    pass  # Ignore if token is invalid
            
            return jsonify({
                'success': True,
                'recommended_crop': predicted_crop,
                'recommendations': recommendations,
                'input_conditions': data
            })
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @farming_simulator_bp.route('/predict-yield', methods=['POST'])
    @token_required
    def predict_yield(current_user):
        """Predict crop yield based on environmental conditions and inputs"""
        if not yield_model:
            return jsonify({'error': 'Yield prediction model not loaded'}), 500
        
        try:
            data = request.get_json()
            
            # Required features
            required_features = ['crop', 'area', 'year', 'rainfall', 'pesticides', 'temperature']
            
            # Validate input
            for feature in required_features:
                if feature not in data:
                    return jsonify({'error': f'Missing required field: {feature}'}), 400
            
            # Encode categorical variables
            crop = data['crop']
            area = data['area']
            
            # Check if crop and area are in the encoders
            if crop not in label_encoder_item.classes_:
                return jsonify({
                    'error': f'Crop "{crop}" not found in database',
                    'available_crops': list(label_encoder_item.classes_)
                }), 400
            
            if area not in label_encoder_area.classes_:
                return jsonify({
                    'error': f'Area "{area}" not found in database',
                    'available_areas': list(label_encoder_area.classes_)[:20]
                }), 400
            
            area_encoded = label_encoder_area.transform([area])[0]
            item_encoded = label_encoder_item.transform([crop])[0]
            
            # Prepare input
            input_data = np.array([[
                area_encoded,
                item_encoded,
                int(data['year']),
                float(data['rainfall']),
                float(data['pesticides']),
                float(data['temperature'])
            ]])
            
            # Get prediction
            predicted_yield = yield_model.predict(input_data)[0]
            
            # Calculate confidence interval (using standard deviation from training)
            confidence_margin = predicted_yield * 0.15  # 15% margin
            
            # Log activity
            activity = {
                'userId': str(current_user['_id']),
                'type': 'farming_simulator_yield_prediction',
                'input': data,
                'result': {
                    'predicted_yield': float(predicted_yield),
                    'confidence_interval': {
                        'lower': float(predicted_yield - confidence_margin),
                        'upper': float(predicted_yield + confidence_margin)
                    }
                },
                'timestamp': datetime.now().isoformat()
            }
            activities_collection.insert_one(activity)
            
            return jsonify({
                'success': True,
                'predicted_yield': float(predicted_yield),
                'unit': 'hg/ha',
                'confidence_interval': {
                    'lower': float(predicted_yield - confidence_margin),
                    'upper': float(predicted_yield + confidence_margin)
                },
                'input_conditions': data,
                'interpretation': {
                    'yield_kg_per_hectare': float(predicted_yield / 10),  # Convert hg to kg
                    'yield_tonnes_per_hectare': float(predicted_yield / 10000)  # Convert to tonnes
                }
            })
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @farming_simulator_bp.route('/simulate-season', methods=['POST'])
    @token_required
    def simulate_season(current_user):
        """Simulate a complete farming season with crop recommendation and yield prediction"""
        if not crop_model or not yield_model:
            return jsonify({'error': 'Models not loaded'}), 500
        
        try:
            data = request.get_json()
            
            # Phase 1: Recommend crop based on soil/environment
            soil_data = {
                'N': data.get('N', 50),
                'P': data.get('P', 50),
                'K': data.get('K', 50),
                'temperature': data.get('temperature', 25),
                'humidity': data.get('humidity', 70),
                'ph': data.get('ph', 6.5),
                'rainfall': data.get('rainfall', 100)
            }
            
            input_crop = np.array([[
                soil_data['N'], soil_data['P'], soil_data['K'],
                soil_data['temperature'], soil_data['humidity'],
                soil_data['ph'], soil_data['rainfall']
            ]])
            
            recommended_crop = crop_model.predict(input_crop)[0]
            probabilities = crop_model.predict_proba(input_crop)[0]
            max_confidence = float(np.max(probabilities))
            
            # Phase 2: Predict yield for the recommended crop
            # Map crop recommendation to yield prediction crop
            crop_mapping = {
                'rice': 'Rice, paddy',
                'maize': 'Maize',
                'wheat': 'Wheat',
                'cotton': 'Cotton',
                'jute': 'Jute'
            }
            
            yield_crop = crop_mapping.get(recommended_crop.lower(), 'Maize')
            
            # Use default area or user-provided
            area = data.get('area', 'India')
            year = data.get('year', 2023)
            pesticides = data.get('pesticides', 1000)
            
            # Ensure crop and area are valid
            if yield_crop in label_encoder_item.classes_ and area in label_encoder_area.classes_:
                area_encoded = label_encoder_area.transform([area])[0]
                item_encoded = label_encoder_item.transform([yield_crop])[0]
                
                input_yield = np.array([[
                    area_encoded, item_encoded, year,
                    soil_data['rainfall'] * 10,  # Convert to yearly
                    pesticides,
                    soil_data['temperature']
                ]])
                
                predicted_yield = float(yield_model.predict(input_yield)[0])
            else:
                predicted_yield = None
            
            # Calculate game score
            score = (
                max_confidence * 500 +  # Crop suitability
                (predicted_yield / 1000 if predicted_yield else 250) +  # Yield performance
                (soil_data['N'] + soil_data['P'] + soil_data['K']) / 3 +  # Nutrient balance
                min(soil_data['rainfall'] / 2, 100)  # Rainfall bonus
            )
            
            # Log activity
            activity = {
                'userId': str(current_user['_id']),
                'type': 'farming_simulator_season',
                'input': data,
                'result': {
                    'recommended_crop': recommended_crop,
                    'predicted_yield': predicted_yield,
                    'score': float(score)
                },
                'timestamp': datetime.now().isoformat()
            }
            activities_collection.insert_one(activity)
            
            return jsonify({
                'success': True,
                'season_results': {
                    'recommended_crop': recommended_crop,
                    'crop_confidence': max_confidence,
                    'predicted_yield': predicted_yield,
                    'yield_unit': 'hg/ha',
                    'yield_tonnes_per_hectare': predicted_yield / 10000 if predicted_yield else None,
                    'game_score': float(score),
                    'rating': 'Excellent' if score > 700 else 'Good' if score > 500 else 'Fair'
                },
                'conditions': soil_data,
                'recommendations': {
                    'nitrogen_status': 'Optimal' if 40 <= soil_data['N'] <= 60 else 'Adjust',
                    'phosphorus_status': 'Optimal' if 40 <= soil_data['P'] <= 60 else 'Adjust',
                    'potassium_status': 'Optimal' if 40 <= soil_data['K'] <= 60 else 'Adjust',
                    'ph_status': 'Optimal' if 6.0 <= soil_data['ph'] <= 7.0 else 'Adjust'
                }
            })
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @farming_simulator_bp.route('/leaderboard', methods=['GET'])
    @token_required
    def get_leaderboard(current_user):
        """Get top scores from farming simulator seasons"""
        try:
            # Get all season activities, sorted by score
            pipeline = [
                {'$match': {'type': 'farming_simulator_season'}},
                {'$project': {
                    'userId': 1,
                    'score': '$result.score',
                    'crop': '$result.recommended_crop',
                    'timestamp': 1
                }},
                {'$sort': {'score': -1}},
                {'$limit': 10}
            ]
            
            leaderboard = list(activities_collection.aggregate(pipeline))
            
            # Enrich with user information
            for entry in leaderboard:
                user = users_collection.find_one({'_id': entry['userId']})
                if user:
                    entry['userName'] = user.get('fullName', 'Anonymous')
                else:
                    entry['userName'] = 'Anonymous'
                entry['_id'] = str(entry.get('_id', ''))
            
            return jsonify({
                'success': True,
                'leaderboard': leaderboard
            })
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    return farming_simulator_bp
