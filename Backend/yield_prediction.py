from flask import Blueprint, request, jsonify
import numpy as np
import joblib
import pandas as pd
from datetime import datetime
import os
import jwt
from functools import wraps
import json

def create_yield_blueprint(users_collection, secret_key, activities_collection):
    yield_bp = Blueprint('yield', __name__, url_prefix='/api')

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

    # Load the trained yield prediction model and encoders
    base_path = os.path.join(os.path.dirname(__file__), '..', 'Models')
    model_path = os.path.join(base_path, 'yield_prediction_model.joblib')
    area_encoder_path = os.path.join(base_path, 'label_encoder_area.joblib')
    item_encoder_path = os.path.join(base_path, 'label_encoder_item.joblib')
    metadata_path = os.path.join(base_path, 'yield_model_metadata.json')
    
    try:
        model = joblib.load(model_path)
        le_area = joblib.load(area_encoder_path)
        le_item = joblib.load(item_encoder_path)
        with open(metadata_path, 'r') as f:
            metadata = json.load(f)
        print("Yield prediction model loaded successfully!")
        print(f"Model R² Score: {metadata['metrics']['r2_score']:.4f}")
    except Exception as e:
        print(f"Error loading yield prediction model: {e}")
        model = None
        le_area = None
        le_item = None
        metadata = None

    @yield_bp.route('/yield/metadata', methods=['GET'])
    def get_yield_metadata():
        """Get model metadata including supported countries and crops"""
        if metadata is None:
            return jsonify({'error': 'Model metadata not loaded'}), 500
        
        return jsonify({
            'countries': metadata['countries'],
            'crops': metadata['crops'],
            'metrics': metadata['metrics'],
            'feature_importance': metadata['feature_importance']
        })
    
    @yield_bp.route('/yield/crops', methods=['GET'])
    @token_required
    def get_yield_crops(current_user):
        """Get list of crops supported for yield prediction"""
        if metadata is None:
            return jsonify({'error': 'Model not loaded'}), 500
            
        return jsonify({
            'crops': metadata['crops'],
            'count': len(metadata['crops'])
        })
    
    @yield_bp.route('/yield/countries', methods=['GET'])
    @token_required
    def get_yield_countries(current_user):
        """Get list of countries supported for yield prediction"""
        if metadata is None:
            return jsonify({'error': 'Model not loaded'}), 500
            
        return jsonify({
            'countries': metadata['countries'],
            'count': len(metadata['countries'])
        })

    @yield_bp.route('/yield/predict', methods=['POST'])
    @token_required
    def predict_yield(current_user):
        """Predict crop yield based on input parameters"""
        try:
            data = request.get_json()
            
            # Validate required fields
            required_fields = ['country', 'crop', 'year', 'rainfall', 'pesticides', 'temperature']
            for field in required_fields:
                if field not in data:
                    return jsonify({'error': f'Missing required field: {field}'}), 400
            
            country = data['country']
            crop = data['crop']
            year = int(data['year'])
            rainfall = float(data['rainfall'])
            pesticides = float(data['pesticides'])
            temperature = float(data['temperature'])
            
            # Validate model is loaded
            if model is None or le_area is None or le_item is None:
                return jsonify({'error': 'Model not loaded'}), 500
            
            # Validate country and crop are in the training data
            if country not in le_area.classes_:
                return jsonify({'error': f'Country "{country}" not supported. Please choose from available countries.'}), 400
            if crop not in le_item.classes_:
                return jsonify({'error': f'Crop "{crop}" not supported. Please choose from available crops.'}), 400
            
            # Validate ranges
            if not (1990 <= year <= 2030):
                return jsonify({'error': 'Year must be between 1990 and 2030'}), 400
            if not (0 <= rainfall <= 5000):
                return jsonify({'error': 'Rainfall must be between 0 and 5000 mm/year'}), 400
            if not (0 <= pesticides <= 500000):
                return jsonify({'error': 'Pesticides must be between 0 and 500000 tonnes'}), 400
            if not (-10 <= temperature <= 50):
                return jsonify({'error': 'Temperature must be between -10 and 50°C'}), 400
            
            # Encode categorical variables
            area_encoded = le_area.transform([country])[0]
            item_encoded = le_item.transform([crop])[0]
            
            # Prepare input for model
            # Features: Area_encoded, Item_encoded, Year, average_rain_fall_mm_per_year, pesticides_tonnes, avg_temp
            input_data = np.array([[area_encoded, item_encoded, year, rainfall, pesticides, temperature]])
            
            # Make prediction
            prediction = model.predict(input_data)[0]
            
            # Convert hg/ha to tonnes/ha (1 hg/ha = 0.0001 tonnes/ha)
            prediction_tonnes_ha = prediction * 0.0001
            
            # Calculate confidence interval based on model's MAE
            mae = metadata['metrics']['mae']
            confidence_lower = max(0, (prediction - mae) * 0.0001)
            confidence_upper = (prediction + mae) * 0.0001
            
            # Contributing factors analysis based on actual feature importance
            factors = [
                {
                    'name': 'Crop Type',
                    'value': crop,
                    'impact': 'very high',
                    'importance': f"{metadata['feature_importance']['Item_encoded']*100:.1f}%",
                    'recommendation': f'{crop} is suitable for the selected conditions'
                },
                {
                    'name': 'Pesticides Usage',
                    'value': f'{pesticides} tonnes',
                    'impact': 'high',
                    'importance': f"{metadata['feature_importance']['pesticides_tonnes']*100:.1f}%",
                    'recommendation': 'Moderate pesticide usage recommended' if pesticides < 10000 else 'High pesticide usage - consider integrated pest management'
                },
                {
                    'name': 'Average Temperature',
                    'value': f'{temperature}°C',
                    'impact': 'high',
                    'importance': f"{metadata['feature_importance']['avg_temp']*100:.1f}%",
                    'recommendation': 'Optimal temperature' if 15 <= temperature <= 30 else 'Temperature outside optimal range'
                },
                {
                    'name': 'Rainfall',
                    'value': f'{rainfall} mm/year',
                    'impact': 'medium',
                    'importance': f"{metadata['feature_importance']['average_rain_fall_mm_per_year']*100:.1f}%",
                    'recommendation': 'Adequate rainfall' if rainfall >= 500 else 'Consider irrigation'
                },
                {
                    'name': 'Country/Region',
                    'value': country,
                    'impact': 'medium',
                    'importance': f"{metadata['feature_importance']['Area_encoded']*100:.1f}%",
                    'recommendation': f'Agricultural practices in {country}'
                },
                {
                    'name': 'Year',
                    'value': str(year),
                    'impact': 'low',
                    'importance': f"{metadata['feature_importance']['Year']*100:.1f}%",
                    'recommendation': 'Historical yield trends considered'
                }
            ]
            
            # Log activity
            activities_collection.insert_one({
                'user_id': str(current_user['_id']),
                'type': 'yield_prediction',
                'data': {
                    'country': country,
                    'crop': crop,
                    'year': year,
                    'rainfall': rainfall,
                    'pesticides': pesticides,
                    'temperature': temperature,
                    'prediction_hg_ha': float(prediction),
                    'prediction_tonnes_ha': float(prediction_tonnes_ha)
                },
                'timestamp': datetime.utcnow()
            })
            
            return jsonify({
                'success': True,
                'prediction': {
                    'yield_hg_ha': float(prediction),
                    'yield_tonnes_ha': float(prediction_tonnes_ha),
                    'yield_kg_ha': float(prediction * 0.1),  # hg/ha to kg/ha
                    'confidence_interval': {
                        'lower': float(confidence_lower),
                        'upper': float(confidence_upper),
                        'unit': 'tonnes/ha'
                    }
                },
                'model_metrics': {
                    'r2_score': metadata['metrics']['r2_score'],
                    'mae': metadata['metrics']['mae'],
                    'rmse': metadata['metrics']['rmse']
                },
                'contributingFactors': factors,
                'input_parameters': {
                    'country': country,
                    'crop': crop,
                    'year': year,
                    'rainfall': rainfall,
                    'pesticides': pesticides,
                    'temperature': temperature
                },
                'timestamp': datetime.utcnow().isoformat()
            })
            
        except ValueError as e:
            return jsonify({'error': f'Invalid input data: {str(e)}'}), 400
        except Exception as e:
            print(f"Yield prediction error: {e}")
            return jsonify({'error': 'Internal server error'}), 500

    return yield_bp