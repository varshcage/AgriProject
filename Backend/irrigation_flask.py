from flask import Blueprint, request, jsonify
import joblib
import json
import numpy as np
from functools import wraps
import jwt
from datetime import datetime

def create_irrigation_blueprint(users_collection, secret_key, activities_collection):
    irrigation_bp = Blueprint('irrigation', __name__, url_prefix='/api')

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

    # Load models and artifacts
    print("Loading irrigation models and artifacts...")
    try:
        model = joblib.load('../Models/irrigation_model.pkl')
        scaler = joblib.load('../Models/scaler.pkl')
        label_encoder = joblib.load('../Models/label_encoder.pkl')

        with open('../Models/crop_water_needs.json', 'r') as f:
            crop_water_needs = json.load(f)

        with open('../Models/model_metadata.json', 'r') as f:
            model_metadata = json.load(f)

        print("Irrigation model connected successfully!")
    except Exception as e:
        print(f"❌ Error loading irrigation models: {e}")
        # Return empty blueprint if models not found
        return irrigation_bp

    @irrigation_bp.route('/irrigation/')
    def irrigation_home():
        return jsonify({
            'message': 'Irrigation Prediction API',
            'version': '1.0.0',
            'model': model_metadata.get('model_name', 'Unknown'),
            'accuracy': f"{model_metadata.get('metrics', {}).get('accuracy', 0):.1f}%",
            'r2_score': model_metadata.get('metrics', {}).get('r2', 0)
        })

    @irrigation_bp.route('/irrigation/supported-crops', methods=['GET'])
    def get_supported_crops():
        """Get list of supported crops"""
        crops = list(crop_water_needs.keys())
        return jsonify({"crops": crops})

    @irrigation_bp.route('/irrigation/model-info', methods=['GET'])
    def get_model_info():
        """Get model information"""
        return jsonify(model_metadata)

    @irrigation_bp.route('/irrigation/predict', methods=['POST'])
    @token_required
    def predict_irrigation(current_user):
        """Predict irrigation needs"""
        try:
            data = request.get_json()

            # Validate required fields
            required_fields = ['cropType', 'N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
            for field in required_fields:
                if field not in data:
                    return jsonify({'error': f'Missing required field: {field}'}), 400

            # Encode crop
            if data['cropType'] not in label_encoder.classes_:
                return jsonify({'error': f"Crop '{data['cropType']}' not supported"}), 400

            crop_encoded = label_encoder.transform([data['cropType']])[0]

            # Prepare feature array
            features_array = np.array([[
                float(data['N']),
                float(data['P']),
                float(data['K']),
                float(data['temperature']),
                float(data['humidity']),
                float(data['ph']),
                float(data['rainfall']),
                crop_encoded
            ]])

            # Scale features
            features_scaled = scaler.transform(features_array)

            # Predict water deficit
            water_deficit = model.predict(features_scaled)[0]
            water_deficit = max(0, round(float(water_deficit), 1))

            # Get crop water need
            water_need = crop_water_needs.get(data['cropType'], 150)

            # Determine risk level and recommendations
            if water_deficit == 0:
                risk_level = "Low"
                irrigation_schedule = "No irrigation needed this month"
                irrigation_frequency = "N/A"
                next_irrigation = "Monitor soil moisture"
            elif water_deficit < 25:
                risk_level = "Low"
                irrigation_schedule = "Light irrigation (10-15mm)"
                irrigation_frequency = "Every 10-14 days"
                next_irrigation = "7-10 days"
            elif water_deficit < 50:
                risk_level = "Medium"
                irrigation_schedule = "Moderate irrigation (15-25mm)"
                irrigation_frequency = "Weekly"
                next_irrigation = "5-7 days"
            elif water_deficit < 100:
                risk_level = "High"
                irrigation_schedule = "Heavy irrigation (25-40mm)"
                irrigation_frequency = "Every 3-5 days"
                next_irrigation = "2-4 days"
            else:
                risk_level = "Critical"
                irrigation_schedule = "Critical irrigation needed (40-60mm)"
                irrigation_frequency = "Every 2-3 days"
                next_irrigation = "Immediately"

            # Generate water conservation tips
            tips = []
            if float(data['humidity']) < 40:
                tips.append("Consider morning irrigation to reduce evaporation")
            if float(data['temperature']) > 30:
                tips.append("High temperatures increase water needs - irrigate more frequently")
            if float(data['rainfall']) < 50:
                tips.append("Rainfall is very low, consider supplemental irrigation")
            if float(data['ph']) < 6.0 or float(data['ph']) > 7.5:
                tips.append("Soil pH outside optimal range may affect water uptake efficiency")
            if not tips:
                tips.append("Current conditions are favorable for water conservation")

            # Add general tips
            tips.append("Use drip irrigation for water efficiency")
            tips.append("Mulch soil to retain moisture")
            tips.append("Monitor soil moisture with sensors")

            # Crop-specific notes
            crop_notes = {
                'rice': 'Requires continuous standing water. Maintain 5-10cm water depth.',
                'maize': 'Critical periods: flowering and grain filling. Avoid water stress.',
                'chickpea': 'Drought-tolerant but needs water during pod formation.',
                'banana': 'Requires consistent moisture. Mulching recommended.',
                'grapes': 'Regulated deficit irrigation can improve quality.',
                'watermelon': 'Requires deep watering. Avoid wetting foliage to prevent diseases.',
                'mango': 'Needs reduced irrigation during flowering to promote fruiting.',
                'apple': 'Requires consistent moisture, especially during fruit development.',
                'orange': 'Requires deep, infrequent irrigation. Avoid waterlogging.',
                'papaya': 'Needs frequent, light irrigation. Sensitive to waterlogging.',
                'pomegranate': 'Drought-tolerant once established. Reduce irrigation during fruiting.',
                'kidneybeans': 'Moderate water needs. Critical during flowering and pod development.',
                'pigeonpeas': 'Drought-tolerant. Minimal irrigation required.',
                'mothbeans': 'Very drought-tolerant. Minimal irrigation needed.',
                'mungbean': 'Moderate water needs. Sensitive to waterlogging.',
                'blackgram': 'Drought-tolerant. Irrigation beneficial during dry spells.',
                'lentil': 'Drought-tolerant. Minimal irrigation required.',
                'muskmelon': 'Needs consistent moisture, especially during fruit development.',
            }

            crop_specific_notes = crop_notes.get(data['cropType'],
                'Maintain consistent soil moisture. Avoid waterlogging.')

            # Calculate water saving potential
            saving_potential = min(30, water_deficit / 2)

            response_data = {
                'water_deficit_mm': water_deficit,
                'monthly_water_need_mm': water_need,
                'rainfall_received_mm': float(data['rainfall']),
                'irrigation_schedule': irrigation_schedule,
                'irrigation_frequency': irrigation_frequency,
                'next_irrigation': next_irrigation,
                'risk_level': risk_level,
                'estimated_water_saving_potential': f"{saving_potential:.1f} mm/month",
                'water_conservation_tips': tips[:5],  # Return top 5 tips
                'crop_specific_notes': crop_specific_notes
            }

            # Store activity in database
            activity = {
                'user_id': str(current_user['_id']),
                'type': 'irrigation_prediction',
                'data': {
                    'crop_type': data['cropType'],
                    'water_deficit': water_deficit,
                    'risk_level': risk_level
                },
                'timestamp': datetime.now()
            }
            activities_collection.insert_one(activity)

            return jsonify(response_data)

        except Exception as e:
            return jsonify({'error': str(e)}), 500

    return irrigation_bp