from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from functools import wraps

def create_auth_blueprint(users_collection, secret_key, activities_collection=None, db=None):
    auth_bp = Blueprint('auth', __name__)

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

    @auth_bp.route('/api/register', methods=['POST'])
    def register():
        try:
            data = request.get_json()
            
            # Validate required fields
            required_fields = ['fullName', 'email', 'phone', 'institution', 'password']
            for field in required_fields:
                if field not in data or not data[field]:
                    return jsonify({'message': f'{field} is required'}), 400
            
            # Check if user already exists
            if users_collection.find_one({'email': data['email']}):
                return jsonify({'message': 'Email already registered'}), 409
            
            # Hash the password
            hashed_password = generate_password_hash(data['password'])
            
            # Create user document
            user = {
                'fullName': data['fullName'],
                'email': data['email'],
                'phone': data['phone'],
                'institution': data['institution'],
                'password': hashed_password,
                'major': data.get('major', ''),
                'yearOfStudy': data.get('yearOfStudy', ''),
                'location': data.get('location', ''),
                'bio': data.get('bio', ''),
                'createdAt': datetime.datetime.utcnow(),
                'updatedAt': datetime.datetime.utcnow()
            }
            
            # Insert user into database
            result = users_collection.insert_one(user)
            
            # Generate token
            token = jwt.encode({
                'email': data['email'],
                'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
            }, secret_key, algorithm="HS256")
            
            # Return user data without password
            user_data = {
                'stdID': str(result.inserted_id),
                'fullName': user['fullName'],
                'email': user['email'],
                'phone': user['phone'],
                'institution': user['institution'],
                'major': user['major'],
                'yearOfStudy': user['yearOfStudy'],
                'location': user['location'],
                'bio': user['bio']
            }
            
            return jsonify({
                'message': 'User registered successfully',
                'token': token,
                'user': user_data
            }), 201
            
        except Exception as e:
            return jsonify({'message': f'Error: {str(e)}'}), 500

    @auth_bp.route('/api/login', methods=['POST'])
    def login():
        try:
            data = request.get_json()
            
            # Validate required fields
            if not data.get('email') or not data.get('password'):
                return jsonify({'message': 'Email and password are required'}), 400
            
            # Find user
            user = users_collection.find_one({'email': data['email']})
            
            if not user:
                return jsonify({'message': 'Invalid email or password'}), 401
            
            # Check password
            if not check_password_hash(user['password'], data['password']):
                return jsonify({'message': 'Invalid email or password'}), 401
            
            # Generate token
            token = jwt.encode({
                'email': user['email'],
                'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
            }, secret_key, algorithm="HS256")
            
            # Return user data without password
            user_data = {
                'stdID': str(user['_id']),
                'fullName': user['fullName'],
                'email': user['email'],
                'phone': user['phone'],
                'institution': user['institution'],
                'major': user.get('major', ''),
                'yearOfStudy': user.get('yearOfStudy', ''),
                'location': user.get('location', ''),
                'bio': user.get('bio', '')
            }
            
            return jsonify({
                'message': 'Login successful',
                'token': token,
                'user': user_data
            }), 200
            
        except Exception as e:
            return jsonify({'message': f'Error: {str(e)}'}), 500

    @auth_bp.route('/api/profile', methods=['GET'])
    @token_required
    def get_profile(current_user):
        try:
            # Return user data without password
            user_data = {
                'fullName': current_user['fullName'],
                'email': current_user['email'],
                'phone': current_user['phone'],
                'institution': current_user['institution'],
                'major': current_user.get('major', ''),
                'yearOfStudy': current_user.get('yearOfStudy', ''),
                'location': current_user.get('location', ''),
                'bio': current_user.get('bio', ''),
                'joinDate': current_user.get('createdAt', '').isoformat() if current_user.get('createdAt') else ''
            }
            
            # Get farming game activities if database is available
            farming_activities = []
            if db is not None and activities_collection is not None:
                user_id = str(current_user['_id'])
                
                # Get recent activities from activities collection
                try:
                    recent_activities = list(activities_collection.find(
                        {'userId': user_id, 'type': {'$regex': 'farming_game'}},
                        {'_id': 0}
                    ).sort('timestamp', -1).limit(50))
                    
                    # Transform activities to include readable action text
                    for activity in recent_activities:
                        action = ""
                        details = activity.get('details', {})
                        
                        if activity['type'] == 'farming_game_plot_purchase':
                            action = f"Purchased a {details.get('plot_size', 'small')} plot for ${details.get('cost', 0)}"
                        elif activity['type'] == 'farming_game_buy_seeds':
                            action = f"Bought {details.get('quantity', 0)} {details.get('crop', 'crop')} seeds for ${details.get('cost', 0)}"
                        elif activity['type'] == 'farming_game_plant':
                            action = f"Planted {details.get('crop', 'crop')} on plot"
                        elif activity['type'] == 'farming_game_irrigate':
                            action = f"Irrigated {details.get('crop', 'crop')} (Water: {details.get('water_level', 0)}%, Health: {details.get('health', 0)}%)"
                        elif activity['type'] == 'farming_game_harvest':
                            action = f"Harvested {details.get('yield', 0)} {details.get('crop', 'crop')} (+{details.get('exp_gained', 0)} XP)"
                        elif activity['type'] == 'farming_game_sell_crops':
                            action = f"Sold {details.get('quantity', 0)} {details.get('crop', 'crop')} for ${details.get('earnings', 0)}"
                        else:
                            action = activity['type'].replace('farming_game_', '').replace('_', ' ').title()
                        
                        farming_activities.append({
                            'type': activity['type'],
                            'action': action,
                            'details': details,
                            'timestamp': activity['timestamp'],
                            'email': current_user['email']
                        })
                except Exception as e:
                    print(f"Error fetching farming activities: {e}")
                
                # Get game state
                try:
                    game_states = db['game_states']
                    game_state = game_states.find_one({'userId': user_id})
                    
                    if game_state:
                        user_data['farmingGameState'] = {
                            'money': game_state.get('money', 1000),
                            'xp': game_state.get('experience', 0),
                            'level': game_state.get('level', 1),
                            'lastUpdated': game_state.get('updatedAt', '')
                        }
                except Exception as e:
                    print(f"Error fetching game state: {e}")
                
                # Get plots count
                try:
                    plots_collection = db['plots']
                    plots_count = plots_collection.count_documents({'userId': user_id})
                    user_data['farmingPlotsOwned'] = plots_count
                except Exception as e:
                    print(f"Error fetching plots: {e}")
                
                # Get inventory summary
                try:
                    inventory_collection = db['inventories']
                    inventory = inventory_collection.find_one({'userId': user_id})
                    if inventory:
                        seeds = inventory.get('seeds', {})
                        crops = inventory.get('harvested_crops', {})
                        user_data['farmingInventory'] = {
                            'totalSeeds': sum(seeds.values()) if seeds else 0,
                            'totalCrops': sum(crops.values()) if crops else 0
                        }
                except Exception as e:
                    print(f"Error fetching inventory: {e}")
                
                # Get transaction summary
                try:
                    transactions_collection = db['transactions']
                    total_purchases = transactions_collection.count_documents({
                        'userId': user_id,
                        'type': {'$in': ['seed_purchase', 'plot_purchase']}
                    })
                    total_sales = transactions_collection.count_documents({
                        'userId': user_id,
                        'type': 'crop_sale'
                    })
                    user_data['farmingTransactions'] = {
                        'totalPurchases': total_purchases,
                        'totalSales': total_sales
                    }
                except Exception as e:
                    print(f"Error fetching transactions: {e}")
            
            user_data['farmingActivities'] = farming_activities
            
            return jsonify(user_data), 200
            
        except Exception as e:
            return jsonify({'message': f'Error: {str(e)}'}), 500

    @auth_bp.route('/api/profile', methods=['PUT'])
    @token_required
    def update_profile(current_user):
        try:
            data = request.get_json()
            
            # Update allowed fields
            update_fields = {
                'updatedAt': datetime.datetime.utcnow()
            }
            
            allowed_fields = ['fullName', 'phone', 'institution', 'major', 'yearOfStudy', 'location', 'bio']
            for field in allowed_fields:
                if field in data:
                    update_fields[field] = data[field]
            
            # Update user in database
            users_collection.update_one(
                {'email': current_user['email']},
                {'$set': update_fields}
            )
            
            # Get updated user
            updated_user = users_collection.find_one({'email': current_user['email']})
            
            user_data = {
                'stdID': str(updated_user['_id']),
                'fullName': updated_user['fullName'],
                'email': updated_user['email'],
                'phone': updated_user['phone'],
                'institution': updated_user['institution'],
                'major': updated_user.get('major', ''),
                'yearOfStudy': updated_user.get('yearOfStudy', ''),
                'location': updated_user.get('location', ''),
                'bio': updated_user.get('bio', '')
            }
            
            return jsonify({
                'message': 'Profile updated successfully',
                'user': user_data
            }), 200
            
        except Exception as e:
            return jsonify({'message': f'Error: {str(e)}'}), 500

    return auth_bp