from flask import Blueprint, request, jsonify, make_response
import requests
from datetime import datetime, timedelta
import json
from functools import lru_cache
import os
from dotenv import load_dotenv

load_dotenv()

# Your OpenWeatherMap API key
API_KEY = "8986320e17cd518dc9205a7ad92dc3cc"
BASE_URL = "https://api.openweathermap.org/data/2.5"
GEO_URL = "http://api.openweathermap.org/geo/1.0/direct"

# Cache weather data for 10 minutes
@lru_cache(maxsize=128)
def get_cached_weather(location, cache_key):
    return None

def create_weather_blueprint():
    weather_bp = Blueprint('weather', __name__, url_prefix='/api/weather')
    return weather_bp

weather_bp = create_weather_blueprint()

@weather_bp.route('/current', methods=['GET'])
def get_current_weather():
    """Get current weather for a location"""
    location = request.args.get('location', 'Colombo')
    units = request.args.get('units', 'metric')  # metric, imperial, standard
    
    try:
        # First, get coordinates for the location
        geo_response = requests.get(
            f"{GEO_URL}?q={location}&limit=1&appid={API_KEY}"
        )
        geo_data = geo_response.json()
        
        if not geo_data:
            return jsonify({
                'error': 'Location not found',
                'message': f'Could not find coordinates for {location}'
            }), 404
        
        lat = geo_data[0]['lat']
        lon = geo_data[0]['lon']
        location_name = geo_data[0].get('name', location)
        
        # Get current weather
        current_response = requests.get(
            f"{BASE_URL}/weather?lat={lat}&lon={lon}&appid={API_KEY}&units={units}"
        )
        current_data = current_response.json()
        
        if current_response.status_code != 200:
            return jsonify({
                'error': 'Weather API error',
                'message': current_data.get('message', 'Unknown error')
            }), current_response.status_code
        
        # Process current weather data
        processed_data = {
            'location': location_name,
            'country': geo_data[0].get('country', ''),
            'coordinates': {
                'lat': lat,
                'lon': lon
            },
            'current': {
                'temp': round(current_data['main']['temp']),
                'feels_like': round(current_data['main']['feels_like']),
                'humidity': current_data['main']['humidity'],
                'pressure': current_data['main']['pressure'],
                'wind_speed': round(current_data['wind']['speed'] * 3.6, 1),  # Convert m/s to km/h
                'wind_deg': current_data['wind'].get('deg', 0),
                'visibility': current_data.get('visibility', 10000) / 1000,  # Convert to km
                'condition': current_data['weather'][0]['main'],
                'description': current_data['weather'][0]['description'],
                'icon': current_data['weather'][0]['icon'],
                'sunrise': current_data['sys']['sunrise'],
                'sunset': current_data['sys']['sunset'],
                'clouds': current_data['clouds']['all'],
                'rain': current_data.get('rain', {}).get('1h', 0),
                'snow': current_data.get('snow', {}).get('1h', 0),
                'uvi': 0  # Will be fetched separately
            },
            'units': units,
            'last_updated': datetime.utcnow().isoformat(),
            'current_time': datetime.now().isoformat()
        }
        
        return jsonify(processed_data)
        
    except Exception as e:
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@weather_bp.route('/forecast', methods=['GET'])
def get_forecast():
    """Get 7-day weather forecast"""
    location = request.args.get('location', 'Colombo')
    units = request.args.get('units', 'metric')
    
    try:
        # Get coordinates
        geo_response = requests.get(
            f"{GEO_URL}?q={location}&limit=1&appid={API_KEY}"
        )
        geo_data = geo_response.json()
        
        if not geo_data:
            return jsonify({'error': 'Location not found'}), 404
        
        lat = geo_data[0]['lat']
        lon = geo_data[0]['lon']
        location_name = geo_data[0].get('name', location)
        
        # Get 5-day forecast (OpenWeatherMap provides 5 days in 3-hour intervals)
        forecast_response = requests.get(
            f"{BASE_URL}/forecast?lat={lat}&lon={lon}&appid={API_KEY}&units={units}"
        )
        forecast_data = forecast_response.json()
        
        if forecast_response.status_code != 200:
            return jsonify({
                'error': 'Forecast API error',
                'message': forecast_data.get('message', 'Unknown error')
            }), forecast_response.status_code
        
        # Process forecast data - group by day
        forecasts_by_day = {}
        for forecast in forecast_data['list']:
            forecast_time = datetime.fromtimestamp(forecast['dt'])
            day_key = forecast_time.strftime('%Y-%m-%d')
            
            if day_key not in forecasts_by_day:
                forecasts_by_day[day_key] = {
                    'temps': [],
                    'feels_like': [],
                    'humidity': [],
                    'conditions': [],
                    'icons': [],
                    'rain': [],
                    'wind_speed': [],
                    'dt': forecast['dt']
                }
            
            day_data = forecasts_by_day[day_key]
            day_data['temps'].append(forecast['main']['temp'])
            day_data['feels_like'].append(forecast['main']['feels_like'])
            day_data['humidity'].append(forecast['main']['humidity'])
            day_data['conditions'].append(forecast['weather'][0]['main'])
            day_data['icons'].append(forecast['weather'][0]['icon'])
            day_data['rain'].append(forecast.get('rain', {}).get('3h', 0))
            day_data['wind_speed'].append(forecast['wind']['speed'])
        
        # Create daily forecast
        daily_forecast = []
        days_of_week = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        
        for i, (date_key, day_data) in enumerate(list(forecasts_by_day.items())[:7]):
            forecast_date = datetime.fromtimestamp(day_data['dt'])
            avg_temp = round(sum(day_data['temps']) / len(day_data['temps']))
            max_temp = round(max(day_data['temps']))
            min_temp = round(min(day_data['temps']))
            
            # Get most common condition for the day
            most_common_condition = max(set(day_data['conditions']), key=day_data['conditions'].count)
            most_common_icon = max(set(day_data['icons']), key=day_data['icons'].count)
            
            daily_forecast.append({
                'day': days_of_week[forecast_date.weekday()],
                'date': forecast_date.strftime('%b %d'),
                'temp_avg': avg_temp,
                'temp_max': max_temp,
                'temp_min': min_temp,
                'condition': most_common_condition,
                'icon': most_common_icon,
                'rain_chance': round((sum(1 for r in day_data['rain'] if r > 0) / len(day_data['rain'])) * 100),
                'humidity_avg': round(sum(day_data['humidity']) / len(day_data['humidity'])),
                'wind_speed_avg': round(sum(day_data['wind_speed']) / len(day_data['wind_speed']) * 3.6, 1)
            })
        
        return jsonify({
            'location': location_name,
            'forecast': daily_forecast,
            'units': units,
            'last_updated': datetime.utcnow().isoformat(),
            'current_time': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@weather_bp.route('/complete', methods=['GET'])
def get_complete_weather():
    """Get both current weather and forecast in one call"""
    location = request.args.get('location', 'Colombo')
    units = request.args.get('units', 'metric')
    
    try:
        # Get coordinates first
        geo_response = requests.get(
            f"{GEO_URL}?q={location}&limit=1&appid={API_KEY}"
        )
        geo_data = geo_response.json()
        
        if not geo_data:
            return jsonify({'error': 'Location not found'}), 404
        
        lat = geo_data[0]['lat']
        lon = geo_data[0]['lon']
        location_name = geo_data[0].get('name', location)
        
        # Get current weather
        current_response = requests.get(
            f"{BASE_URL}/weather?lat={lat}&lon={lon}&appid={API_KEY}&units={units}"
        )
        current_data = current_response.json()
        
        if current_response.status_code != 200:
            return jsonify(current_data), current_response.status_code
        
        # Get forecast
        forecast_response = requests.get(
            f"{BASE_URL}/forecast?lat={lat}&lon={lon}&appid={API_KEY}&units={units}"
        )
        forecast_data = forecast_response.json()
        
        if forecast_response.status_code != 200:
            return jsonify(forecast_data), forecast_response.status_code
        
        # Process current weather
        processed_current = {
            'temp': round(current_data['main']['temp']),
            'feels_like': round(current_data['main']['feels_like']),
            'humidity': current_data['main']['humidity'],
            'pressure': current_data['main']['pressure'],
            'wind_speed': round(current_data['wind']['speed'] * 3.6, 1),
            'wind_deg': current_data['wind'].get('deg', 0),
            'visibility': current_data.get('visibility', 10000) / 1000,
            'condition': current_data['weather'][0]['main'],
            'description': current_data['weather'][0]['description'],
            'icon': current_data['weather'][0]['icon'],
            'sunrise': current_data['sys']['sunrise'],
            'sunset': current_data['sys']['sunset'],
            'clouds': current_data['clouds']['all'],
            'rain': current_data.get('rain', {}).get('1h', 0),
            'snow': current_data.get('snow', {}).get('1h', 0),
            'uvi': 0
        }
        
        # Process forecast data
        forecasts_by_day = {}
        for forecast in forecast_data['list']:
            forecast_time = datetime.fromtimestamp(forecast['dt'])
            day_key = forecast_time.strftime('%Y-%m-%d')
            
            if day_key not in forecasts_by_day:
                forecasts_by_day[day_key] = {
                    'temps': [],
                    'feels_like': [],
                    'humidity': [],
                    'conditions': [],
                    'icons': [],
                    'rain': [],
                    'wind_speed': [],
                    'dt': forecast['dt']
                }
            
            day_data = forecasts_by_day[day_key]
            day_data['temps'].append(forecast['main']['temp'])
            day_data['feels_like'].append(forecast['main']['feels_like'])
            day_data['humidity'].append(forecast['main']['humidity'])
            day_data['conditions'].append(forecast['weather'][0]['main'])
            day_data['icons'].append(forecast['weather'][0]['icon'])
            day_data['rain'].append(forecast.get('rain', {}).get('3h', 0))
            day_data['wind_speed'].append(forecast['wind']['speed'])
        
        # Create daily forecast
        daily_forecast = []
        days_of_week = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        
        for i, (date_key, day_data) in enumerate(list(forecasts_by_day.items())[:7]):
            forecast_date = datetime.fromtimestamp(day_data['dt'])
            avg_temp = round(sum(day_data['temps']) / len(day_data['temps']))
            max_temp = round(max(day_data['temps']))
            min_temp = round(min(day_data['temps']))
            
            most_common_condition = max(set(day_data['conditions']), key=day_data['conditions'].count)
            most_common_icon = max(set(day_data['icons']), key=day_data['icons'].count)
            
            daily_forecast.append({
                'day': days_of_week[forecast_date.weekday()],
                'date': forecast_date.strftime('%b %d'),
                'temp_avg': avg_temp,
                'temp_max': max_temp,
                'temp_min': min_temp,
                'condition': most_common_condition,
                'icon': most_common_icon,
                'rain_chance': round((sum(1 for r in day_data['rain'] if r > 0) / len(day_data['rain'])) * 100),
                'humidity_avg': round(sum(day_data['humidity']) / len(day_data['humidity'])),
                'wind_speed_avg': round(sum(day_data['wind_speed']) / len(day_data['wind_speed']) * 3.6, 1)
            })
        
        # Combine data
        combined_data = {
            'location': location_name,
            'country': geo_data[0].get('country', ''),
            'coordinates': {'lat': lat, 'lon': lon},
            'current': processed_current,
            'forecast': daily_forecast,
            'units': units,
            'last_updated': datetime.utcnow().isoformat(),
            'current_time': datetime.now().isoformat()
        }
        
        return jsonify(combined_data)
        
    except Exception as e:
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@weather_bp.route('/uv-index', methods=['GET'])
def get_uv_index():
    """Get UV index for coordinates"""
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    
    if not lat or not lon:
        return jsonify({'error': 'Latitude and longitude required'}), 400
    
    try:
        # Note: UV index requires One Call API 3.0 which might need a different endpoint
        # This is a simplified version
        response = requests.get(
            f"{BASE_URL}/uvi?lat={lat}&lon={lon}&appid={API_KEY}"
        )
        uv_data = response.json()
        
        return jsonify({
            'uv_index': uv_data.get('value', 0),
            'last_updated': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'error': 'UV index fetch failed',
            'message': str(e)
        }), 500

@weather_bp.route('/health', methods=['GET'])
def weather_health_check():
    """Weather service health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'service': 'Weather API',
        'api_configured': bool(API_KEY)
    })

@weather_bp.route('/recommendations', methods=['GET'])
def get_farming_recommendations():
    """Get farming recommendations based on weather"""
    location = request.args.get('location', 'Colombo')
    
    try:
        # Get coordinates
        geo_response = requests.get(
            f"{GEO_URL}?q={location}&limit=1&appid={API_KEY}"
        )
        geo_data = geo_response.json()
        
        if not geo_data:
            return jsonify({'error': 'Location not found'}), 404
        
        lat = geo_data[0]['lat']
        lon = geo_data[0]['lon']
        
        # Get current weather
        response = requests.get(
            f"{BASE_URL}/weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
        )
        weather_data = response.json()
        
        if response.status_code != 200:
            return jsonify(weather_data), response.status_code
        
        # Extract current weather data
        current = {
            'temp': weather_data['main']['temp'],
            'rain': weather_data.get('rain', {}).get('1h', 0),
            'humidity': weather_data['main']['humidity'],
            'wind_speed': weather_data['wind']['speed'] * 3.6
        }
        recommendations = []
        alerts = []
        
        # Generate recommendations based on weather conditions
        if current['rain'] > 5:
            recommendations.append({
                'type': 'rain',
                'priority': 'high',
                'message': 'Rain expected - Delay irrigation and pesticide application',
                'icon': 'CloudRain',
                'color': 'blue'
            })
            alerts.append({
                'type': 'rain_alert',
                'message': 'Prepare for rainfall',
                'severity': 'medium'
            })
        
        if current['temp'] > 30:
            recommendations.append({
                'type': 'heat',
                'priority': 'high',
                'message': 'High temperatures - Increase irrigation frequency',
                'icon': 'Sun',
                'color': 'orange'
            })
            alerts.append({
                'type': 'heat_alert',
                'message': 'Protect crops from heat stress',
                'severity': 'high'
            })
        
        if current['humidity'] > 80:
            recommendations.append({
                'type': 'humidity',
                'priority': 'medium',
                'message': 'High humidity - Watch for fungal diseases',
                'icon': 'Droplets',
                'color': 'blue'
            })
        
        if current['wind_speed'] > 20:
            recommendations.append({
                'type': 'wind',
                'priority': 'medium',
                'message': 'Strong winds - Secure farm structures',
                'icon': 'Wind',
                'color': 'gray'
            })
        
        if current['temp'] < 10:
            recommendations.append({
                'type': 'cold',
                'priority': 'high',
                'message': 'Low temperatures - Protect sensitive crops',
                'icon': 'CloudSnow',
                'color': 'blue'
            })
            alerts.append({
                'type': 'cold_alert',
                'message': 'Frost warning for sensitive plants',
                'severity': 'high'
            })
        
        # Default recommendations if no specific conditions
        if not recommendations:
            recommendations.append({
                'type': 'optimal',
                'priority': 'low',
                'message': 'Good conditions for fieldwork and planting',
                'icon': 'Cloud',
                'color': 'green'
            })
        
        return jsonify({
            'recommendations': recommendations,
            'alerts': alerts,
            'based_on': {
                'temp': current['temp'],
                'rain': current['rain'],
                'humidity': current['humidity'],
                'wind_speed': current['wind_speed']
            }
        })
        
    except Exception as e:
        return jsonify({
            'error': 'Recommendations fetch failed',
            'message': str(e)
        }), 500

# Blueprint is now ready to be registered in main app.py