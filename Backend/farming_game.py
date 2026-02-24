"""
Farming Simulator Game API
Complete game mechanics including plot management, planting, harvesting, irrigation, and inventory
"""
from flask import Blueprint, request, jsonify
from functools import wraps
import jwt
from datetime import datetime, timedelta
from bson import ObjectId
import json
import os

def create_farming_game_blueprint(users_collection, secret_key, activities_collection, db):
    farming_game_bp = Blueprint('farming_game', __name__)
    
    # Collections
    game_states_collection = db['game_states']
    inventories_collection = db['inventories']
    transactions_collection = db['transactions']
    plots_collection = db['plots']
    
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
    
    # Game configuration
    CROP_DATA = {
        'rice': {'name': 'Rice', 'seed_cost': 50, 'sell_price': 150, 'grow_time_days': 120, 'water_need': 'high'},
        'wheat': {'name': 'Wheat', 'seed_cost': 40, 'sell_price': 120, 'grow_time_days': 90, 'water_need': 'medium'},
        'maize': {'name': 'Maize', 'seed_cost': 35, 'sell_price': 100, 'grow_time_days': 75, 'water_need': 'medium'},
        'cotton': {'name': 'Cotton', 'seed_cost': 60, 'sell_price': 180, 'grow_time_days': 150, 'water_need': 'low'},
        'jute': {'name': 'Jute', 'seed_cost': 45, 'sell_price': 130, 'grow_time_days': 100, 'water_need': 'high'},
        'coconut': {'name': 'Coconut', 'seed_cost': 100, 'sell_price': 300, 'grow_time_days': 180, 'water_need': 'medium'},
        'papaya': {'name': 'Papaya', 'seed_cost': 70, 'sell_price': 200, 'grow_time_days': 120, 'water_need': 'medium'},
        'orange': {'name': 'Orange', 'seed_cost': 80, 'sell_price': 220, 'grow_time_days': 140, 'water_need': 'medium'},
        'apple': {'name': 'Apple', 'seed_cost': 90, 'sell_price': 250, 'grow_time_days': 160, 'water_need': 'low'},
        'muskmelon': {'name': 'Muskmelon', 'seed_cost': 55, 'sell_price': 140, 'grow_time_days': 80, 'water_need': 'high'},
        'watermelon': {'name': 'Watermelon', 'seed_cost': 50, 'sell_price': 135, 'grow_time_days': 85, 'water_need': 'high'},
        'grapes': {'name': 'Grapes', 'seed_cost': 85, 'sell_price': 240, 'grow_time_days': 150, 'water_need': 'medium'},
        'mango': {'name': 'Mango', 'seed_cost': 95, 'sell_price': 270, 'grow_time_days': 170, 'water_need': 'low'},
        'banana': {'name': 'Banana', 'seed_cost': 65, 'sell_price': 170, 'grow_time_days': 110, 'water_need': 'high'},
        'pomegranate': {'name': 'Pomegranate', 'seed_cost': 75, 'sell_price': 210, 'grow_time_days': 130, 'water_need': 'low'},
        'lentil': {'name': 'Lentil', 'seed_cost': 30, 'sell_price': 90, 'grow_time_days': 60, 'water_need': 'low'},
        'blackgram': {'name': 'Blackgram', 'seed_cost': 35, 'sell_price': 95, 'grow_time_days': 65, 'water_need': 'low'},
        'mungbean': {'name': 'Mungbean', 'seed_cost': 32, 'sell_price': 92, 'grow_time_days': 62, 'water_need': 'low'},
        'mothbeans': {'name': 'Mothbeans', 'seed_cost': 28, 'sell_price': 85, 'grow_time_days': 58, 'water_need': 'low'},
        'pigeonpeas': {'name': 'Pigeonpeas', 'seed_cost': 38, 'sell_price': 105, 'grow_time_days': 70, 'water_need': 'medium'},
        'kidneybeans': {'name': 'Kidneybeans', 'seed_cost': 42, 'sell_price': 115, 'grow_time_days': 72, 'water_need': 'medium'},
        'chickpea': {'name': 'Chickpea', 'seed_cost': 36, 'sell_price': 100, 'grow_time_days': 68, 'water_need': 'low'},
        'coffee': {'name': 'Coffee', 'seed_cost': 110, 'sell_price': 320, 'grow_time_days': 200, 'water_need': 'medium'}
    }
    
    PLOT_COSTS = {
        'small': 500,
        'medium': 1000,
        'large': 2000
    }
    
    # Initialize game state for new user
    def initialize_game_state(user_id):
        """Initialize game state with starter money and resources"""
        game_state = {
            'userId': str(user_id),
            'money': 1000,  # Starting money
            'experience': 0,
            'level': 1,
            'createdAt': datetime.now().isoformat(),
            'updatedAt': datetime.now().isoformat()
        }
        game_states_collection.insert_one(game_state)
        
        # Initialize inventory
        inventory = {
            'userId': str(user_id),
            'seeds': {},  # {crop_name: quantity}
            'harvested_crops': {},  # {crop_name: quantity}
            'createdAt': datetime.now().isoformat(),
            'updatedAt': datetime.now().isoformat()
        }
        inventories_collection.insert_one(inventory)
        
        return game_state
    
    # Helper function to get or create game state
    def get_game_state(user_id):
        state = game_states_collection.find_one({'userId': str(user_id)})
        if not state:
            state = initialize_game_state(user_id)
        return state
    
    # Helper function to get or create inventory
    def get_inventory(user_id):
        inventory = inventories_collection.find_one({'userId': str(user_id)})
        if not inventory:
            inventory = {
                'userId': str(user_id),
                'seeds': {},
                'harvested_crops': {},
                'createdAt': datetime.now().isoformat(),
                'updatedAt': datetime.now().isoformat()
            }
            inventories_collection.insert_one(inventory)
        return inventory
    
    # ==================== GAME STATE ENDPOINTS ====================
    
    @farming_game_bp.route('/state', methods=['GET'])
    @token_required
    def get_state(current_user):
        """Get current game state"""
        try:
            user_id = str(current_user['_id'])
            state = get_game_state(user_id)
            inventory = get_inventory(user_id)
            
            # Get all plots
            plots = list(plots_collection.find({'userId': user_id}))
            for plot in plots:
                plot['_id'] = str(plot['_id'])
            
            # Convert ObjectId to string
            state['_id'] = str(state['_id'])
            inventory['_id'] = str(inventory['_id'])
            
            return jsonify({
                'success': True,
                'gameState': state,
                'inventory': inventory,
                'plots': plots
            })
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    # ==================== PLOT MANAGEMENT ====================
    
    @farming_game_bp.route('/plots/purchase', methods=['POST'])
    @token_required
    def purchase_plot(current_user):
        """Purchase a new plot"""
        try:
            user_id = str(current_user['_id'])
            data = request.get_json()
            plot_size = data.get('size', 'small')
            
            if plot_size not in PLOT_COSTS:
                return jsonify({'error': 'Invalid plot size'}), 400
            
            cost = PLOT_COSTS[plot_size]
            state = get_game_state(user_id)
            
            if state['money'] < cost:
                return jsonify({'error': 'Insufficient funds'}), 400
            
            # Deduct money
            game_states_collection.update_one(
                {'userId': user_id},
                {
                    '$inc': {'money': -cost},
                    '$set': {'updatedAt': datetime.now().isoformat()}
                }
            )
            
            # Create plot
            plot = {
                'userId': user_id,
                'size': plot_size,
                'status': 'empty',  # empty, planted, growing, ready_to_harvest
                'crop': None,
                'plantedAt': None,
                'harvestReadyAt': None,
                'lastIrrigated': None,
                'waterLevel': 100,
                'health': 100,
                'purchasedAt': datetime.now().isoformat()
            }
            result = plots_collection.insert_one(plot)
            plot['_id'] = str(result.inserted_id)
            
            # Log transaction
            transaction = {
                'userId': user_id,
                'type': 'plot_purchase',
                'amount': -cost,
                'details': {'plot_size': plot_size, 'plot_id': str(result.inserted_id)},
                'timestamp': datetime.now().isoformat()
            }
            transactions_collection.insert_one(transaction)
            
            # Log activity
            activity = {
                'userId': user_id,
                'type': 'farming_game_plot_purchase',
                'details': {'plot_size': plot_size, 'cost': cost},
                'timestamp': datetime.now().isoformat()
            }
            activities_collection.insert_one(activity)
            
            return jsonify({
                'success': True,
                'message': f'{plot_size.capitalize()} plot purchased successfully',
                'plot': plot,
                'newBalance': state['money'] - cost
            })
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @farming_game_bp.route('/plots/<plot_id>/plant', methods=['POST'])
    @token_required
    def plant_crop(current_user, plot_id):
        """Plant a crop on a plot"""
        try:
            user_id = str(current_user['_id'])
            data = request.get_json()
            crop_name = data.get('crop', '').lower()
            
            if crop_name not in CROP_DATA:
                return jsonify({'error': 'Invalid crop type'}), 400
            
            # Check plot ownership and status
            plot = plots_collection.find_one({'_id': ObjectId(plot_id), 'userId': user_id})
            if not plot:
                return jsonify({'error': 'Plot not found'}), 404
            
            if plot['status'] != 'empty':
                return jsonify({'error': 'Plot is not empty'}), 400
            
            # Check inventory for seeds
            inventory = get_inventory(user_id)
            seeds = inventory.get('seeds', {})
            
            if seeds.get(crop_name, 0) < 1:
                return jsonify({'error': 'Insufficient seeds in inventory'}), 400
            
            # Plant the crop
            crop_info = CROP_DATA[crop_name]
            planted_at = datetime.now()
            harvest_ready_at = planted_at + timedelta(days=crop_info['grow_time_days'])
            
            plots_collection.update_one(
                {'_id': ObjectId(plot_id)},
                {
                    '$set': {
                        'status': 'growing',
                        'crop': crop_name,
                        'plantedAt': planted_at.isoformat(),
                        'harvestReadyAt': harvest_ready_at.isoformat(),
                        'lastIrrigated': planted_at.isoformat(),
                        'waterLevel': 100,
                        'health': 100
                    }
                }
            )
            
            # Remove seed from inventory
            inventories_collection.update_one(
                {'userId': user_id},
                {
                    '$inc': {f'seeds.{crop_name}': -1},
                    '$set': {'updatedAt': datetime.now().isoformat()}
                }
            )
            
            # Log activity
            activity = {
                'userId': user_id,
                'type': 'farming_game_plant',
                'details': {
                    'crop': crop_name,
                    'plot_id': plot_id,
                    'harvest_ready_at': harvest_ready_at.isoformat()
                },
                'timestamp': datetime.now().isoformat()
            }
            activities_collection.insert_one(activity)
            
            return jsonify({
                'success': True,
                'message': f'{crop_info["name"]} planted successfully',
                'harvestReadyAt': harvest_ready_at.isoformat(),
                'growTimeDays': crop_info['grow_time_days']
            })
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @farming_game_bp.route('/plots/<plot_id>/irrigate', methods=['POST'])
    @token_required
    def irrigate_plot(current_user, plot_id):
        """Irrigate a plot to maintain crop health"""
        try:
            user_id = str(current_user['_id'])
            
            # Check plot
            plot = plots_collection.find_one({'_id': ObjectId(plot_id), 'userId': user_id})
            if not plot:
                return jsonify({'error': 'Plot not found'}), 404
            
            if plot['status'] not in ['growing']:
                return jsonify({'error': 'No crop to irrigate'}), 400
            
            # Update water level
            now = datetime.now()
            last_irrigated = datetime.fromisoformat(plot['lastIrrigated']) if plot['lastIrrigated'] else now
            hours_since_irrigation = (now - last_irrigated).total_seconds() / 3600
            
            # Water depletes over time
            water_depletion = min(hours_since_irrigation * 2, 100)  # 2% per hour
            current_water = max(plot['waterLevel'] - water_depletion, 0)
            new_water = min(current_water + 50, 100)  # Add 50%, max 100%
            
            # Health affected by water level
            if current_water < 30:
                health_penalty = 10
            elif current_water < 50:
                health_penalty = 5
            else:
                health_penalty = 0
            
            new_health = max(plot['health'] - health_penalty + 5, 0)  # Small health boost from irrigation
            new_health = min(new_health, 100)
            
            plots_collection.update_one(
                {'_id': ObjectId(plot_id)},
                {
                    '$set': {
                        'waterLevel': new_water,
                        'health': new_health,
                        'lastIrrigated': now.isoformat()
                    }
                }
            )
            
            # Log activity
            activity = {
                'userId': user_id,
                'type': 'farming_game_irrigate',
                'details': {
                    'plot_id': plot_id,
                    'crop': plot['crop'],
                    'water_level': new_water,
                    'health': new_health
                },
                'timestamp': now.isoformat()
            }
            activities_collection.insert_one(activity)
            
            return jsonify({
                'success': True,
                'message': 'Plot irrigated successfully',
                'waterLevel': new_water,
                'health': new_health
            })
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @farming_game_bp.route('/plots/<plot_id>/harvest', methods=['POST'])
    @token_required
    def harvest_crop(current_user, plot_id):
        """Harvest a crop from a plot"""
        try:
            user_id = str(current_user['_id'])
            
            # Check plot
            plot = plots_collection.find_one({'_id': ObjectId(plot_id), 'userId': user_id})
            if not plot:
                return jsonify({'error': 'Plot not found'}), 404
            
            if plot['status'] != 'growing':
                return jsonify({'error': 'No crop to harvest'}), 400
            
            # Check if crop is ready
            now = datetime.now()
            harvest_ready_at = datetime.fromisoformat(plot['harvestReadyAt'])
            
            if now < harvest_ready_at:
                time_remaining = harvest_ready_at - now
                return jsonify({
                    'error': 'Crop is not ready to harvest',
                    'timeRemaining': str(time_remaining)
                }), 400
            
            # Calculate yield based on health
            base_yield = 1
            health_multiplier = plot['health'] / 100
            yield_amount = max(int(base_yield * health_multiplier), 1)
            
            crop_name = plot['crop']
            
            # Add to inventory
            inventories_collection.update_one(
                {'userId': user_id},
                {
                    '$inc': {f'harvested_crops.{crop_name}': yield_amount},
                    '$set': {'updatedAt': datetime.now().isoformat()}
                }
            )
            
            # Reset plot
            plots_collection.update_one(
                {'_id': ObjectId(plot_id)},
                {
                    '$set': {
                        'status': 'empty',
                        'crop': None,
                        'plantedAt': None,
                        'harvestReadyAt': None,
                        'lastIrrigated': None,
                        'waterLevel': 100,
                        'health': 100
                    }
                }
            )
            
            # Add experience
            exp_gained = 10 * yield_amount
            game_states_collection.update_one(
                {'userId': user_id},
                {
                    '$inc': {'experience': exp_gained},
                    '$set': {'updatedAt': datetime.now().isoformat()}
                }
            )
            
            # Log activity
            activity = {
                'userId': user_id,
                'type': 'farming_game_harvest',
                'details': {
                    'crop': crop_name,
                    'plot_id': plot_id,
                    'yield': yield_amount,
                    'health': plot['health'],
                    'exp_gained': exp_gained
                },
                'timestamp': now.isoformat()
            }
            activities_collection.insert_one(activity)
            
            return jsonify({
                'success': True,
                'message': f'Harvested {yield_amount} {CROP_DATA[crop_name]["name"]}',
                'crop': crop_name,
                'yield': yield_amount,
                'expGained': exp_gained
            })
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    # ==================== MARKETPLACE ====================
    
    @farming_game_bp.route('/marketplace/seeds', methods=['GET'])
    def get_seeds_market(current_user=None):
        """Get available seeds in the marketplace"""
        return jsonify({
            'success': True,
            'seeds': CROP_DATA
        })
    
    @farming_game_bp.route('/marketplace/buy-seeds', methods=['POST'])
    @token_required
    def buy_seeds(current_user):
        """Buy seeds from marketplace"""
        try:
            user_id = str(current_user['_id'])
            data = request.get_json()
            crop_name = data.get('crop', '').lower()
            quantity = int(data.get('quantity', 1))
            
            if crop_name not in CROP_DATA:
                return jsonify({'error': 'Invalid crop type'}), 400
            
            if quantity < 1:
                return jsonify({'error': 'Invalid quantity'}), 400
            
            cost = CROP_DATA[crop_name]['seed_cost'] * quantity
            state = get_game_state(user_id)
            
            if state['money'] < cost:
                return jsonify({'error': 'Insufficient funds'}), 400
            
            # Deduct money
            game_states_collection.update_one(
                {'userId': user_id},
                {
                    '$inc': {'money': -cost},
                    '$set': {'updatedAt': datetime.now().isoformat()}
                }
            )
            
            # Add seeds to inventory
            inventories_collection.update_one(
                {'userId': user_id},
                {
                    '$inc': {f'seeds.{crop_name}': quantity},
                    '$set': {'updatedAt': datetime.now().isoformat()}
                }
            )
            
            # Log transaction
            transaction = {
                'userId': user_id,
                'type': 'seed_purchase',
                'amount': -cost,
                'details': {'crop': crop_name, 'quantity': quantity},
                'timestamp': datetime.now().isoformat()
            }
            transactions_collection.insert_one(transaction)
            
            # Log activity
            activity = {
                'userId': user_id,
                'type': 'farming_game_buy_seeds',
                'details': {'crop': crop_name, 'quantity': quantity, 'cost': cost},
                'timestamp': datetime.now().isoformat()
            }
            activities_collection.insert_one(activity)
            
            return jsonify({
                'success': True,
                'message': f'Purchased {quantity} {CROP_DATA[crop_name]["name"]} seeds',
                'newBalance': state['money'] - cost
            })
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @farming_game_bp.route('/marketplace/sell-crops', methods=['POST'])
    @token_required
    def sell_crops(current_user):
        """Sell harvested crops"""
        try:
            user_id = str(current_user['_id'])
            data = request.get_json()
            crop_name = data.get('crop', '').lower()
            quantity = int(data.get('quantity', 1))
            
            if crop_name not in CROP_DATA:
                return jsonify({'error': 'Invalid crop type'}), 400
            
            if quantity < 1:
                return jsonify({'error': 'Invalid quantity'}), 400
            
            # Check inventory
            inventory = get_inventory(user_id)
            harvested = inventory.get('harvested_crops', {})
            
            if harvested.get(crop_name, 0) < quantity:
                return jsonify({'error': 'Insufficient crops in inventory'}), 400
            
            # Calculate earnings
            earnings = CROP_DATA[crop_name]['sell_price'] * quantity
            
            # Add money
            game_states_collection.update_one(
                {'userId': user_id},
                {
                    '$inc': {'money': earnings},
                    '$set': {'updatedAt': datetime.now().isoformat()}
                }
            )
            
            # Remove crops from inventory
            inventories_collection.update_one(
                {'userId': user_id},
                {
                    '$inc': {f'harvested_crops.{crop_name}': -quantity},
                    '$set': {'updatedAt': datetime.now().isoformat()}
                }
            )
            
            # Log transaction
            transaction = {
                'userId': user_id,
                'type': 'crop_sale',
                'amount': earnings,
                'details': {'crop': crop_name, 'quantity': quantity},
                'timestamp': datetime.now().isoformat()
            }
            transactions_collection.insert_one(transaction)
            
            # Log activity
            activity = {
                'userId': user_id,
                'type': 'farming_game_sell_crops',
                'details': {'crop': crop_name, 'quantity': quantity, 'earnings': earnings},
                'timestamp': datetime.now().isoformat()
            }
            activities_collection.insert_one(activity)
            
            state = get_game_state(user_id)
            
            return jsonify({
                'success': True,
                'message': f'Sold {quantity} {CROP_DATA[crop_name]["name"]} for ${earnings}',
                'earnings': earnings,
                'newBalance': state['money'] + earnings
            })
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    # ==================== INVENTORY ====================
    
    @farming_game_bp.route('/inventory', methods=['GET'])
    @token_required
    def get_inventory_endpoint(current_user):
        """Get player inventory"""
        try:
            user_id = str(current_user['_id'])
            inventory = get_inventory(user_id)
            inventory['_id'] = str(inventory['_id'])
            
            return jsonify({
                'success': True,
                'inventory': inventory
            })
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    # ==================== TRANSACTIONS ====================
    
    @farming_game_bp.route('/transactions', methods=['GET'])
    @token_required
    def get_transactions(current_user):
        """Get transaction history"""
        try:
            user_id = str(current_user['_id'])
            limit = int(request.args.get('limit', 50))
            
            transactions = list(transactions_collection.find(
                {'userId': user_id}
            ).sort('timestamp', -1).limit(limit))
            
            for txn in transactions:
                txn['_id'] = str(txn['_id'])
            
            return jsonify({
                'success': True,
                'transactions': transactions
            })
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    return farming_game_bp
