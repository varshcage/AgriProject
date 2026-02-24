from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import pandas as pd
import numpy as np

import os
from dotenv import load_dotenv
from auth import create_auth_blueprint
from crop_rec import create_crop_blueprint
from irrigation_flask import create_irrigation_blueprint
from yield_prediction import create_yield_blueprint
from weather import weather_bp
from farming_simulator import create_farming_simulator_blueprint
from farming_game import create_farming_game_blueprint

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-change-this')
app.config['MONGODB_URI'] = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')

# MongoDB Connection
try:
    client = MongoClient(app.config['MONGODB_URI'])
    db = client['agrismart']
    users_collection = db['users']
    activities_collection = db['activities']
    print("MongoDB connected successfully!")
except Exception as e:
    print(f"MongoDB connection error: {e}")

# Register auth blueprint
auth_bp = create_auth_blueprint(users_collection, app.config['SECRET_KEY'], activities_collection, db)
app.register_blueprint(auth_bp)

# Register crop blueprint
crop_bp = create_crop_blueprint(users_collection, app.config['SECRET_KEY'], activities_collection)
app.register_blueprint(crop_bp)

# Register irrigation blueprint
irrigation_bp = create_irrigation_blueprint(users_collection, app.config['SECRET_KEY'], activities_collection)
app.register_blueprint(irrigation_bp)

# Register yield blueprint
yield_bp = create_yield_blueprint(users_collection, app.config['SECRET_KEY'], activities_collection)
app.register_blueprint(yield_bp)

# Register weather blueprint
app.register_blueprint(weather_bp)

# Register farming simulator blueprint
farming_simulator_bp = create_farming_simulator_blueprint(users_collection, app.config['SECRET_KEY'], activities_collection)
app.register_blueprint(farming_simulator_bp, url_prefix='/api/farming-simulator')

# Register farming game blueprint
farming_game_bp = create_farming_game_blueprint(users_collection, app.config['SECRET_KEY'], activities_collection, db)
app.register_blueprint(farming_game_bp, url_prefix='/api/farming-game')

# Routes
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'message': 'Server is running'}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
    


    
