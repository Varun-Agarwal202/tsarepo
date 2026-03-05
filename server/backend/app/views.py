from django.conf import settings
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
import requests
from django.db.models import Q
from django.db import connection
from django.http import JsonResponse
from .models import Business, Profile

REQUEST_TIMEOUT = 8  # seconds

@csrf_exempt
@api_view(['GET', 'POST'])
def fetch_businesses(request):
    """
    POST endpoint used by frontend to perform either a Places Text Search (when 'query'
    is provided) or a Nearby Search (when only lat/lng are provided). Results are also
    persisted into Business table when new.
    """
    url_nearby = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    url_text = "https://maps.googleapis.com/maps/api/place/textsearch/json"

    data = request.data if request.method == 'POST' else request.GET
    lat = data.get('lat')
    lng = data.get('lng')
    radius_km = float(data.get('radius', 5))
    try:
        radius = int(radius_km * 1000)
    except Exception:
        radius = 5000
    keyword = data.get('type', '')    # kept for compatibility
    query = (data.get('query') or '').strip()
    api_key = getattr(settings, 'GOOGLE_PLACES_API_KEY', None)
    if not api_key:
        return JsonResponse({'error': 'API key not configured'}, status=500)

    # Build params and choose endpoint
    try:
        if query:
            # text search
            params = {'query': f'nonprofits {query}', 'key': api_key}
            if lat and lng:
                params.update({'location': f'{lat},{lng}'})
            if keyword:
                params['type'] = keyword
            response = requests.get(url_text, params=params, timeout=REQUEST_TIMEOUT)
        else:
            # nearby search (radius required)
            params = {'key': api_key}
            if lat and lng:
                params.update({'location': f'{lat},{lng}', 'radius': radius})
            if keyword:
                params['type'] = keyword
            else:
                # add a generic keyword to bias results toward businesses
                params.setdefault('keyword', 'nonprofits')
            response = requests.get(url_nearby, params=params, timeout=REQUEST_TIMEOUT)
    except requests.RequestException as e:
        return JsonResponse({'error': 'External API request failed', 'details': str(e)}, status=502)

    if response.status_code != 200:
        return JsonResponse({'error': 'Places API returned error', 'status_code': response.status_code}, status=502)

    api_data = response.json()
    results = api_data.get('results', [])

    # Save each result to the database (only create/update when needed)
    for place in results:
        place_id = place.get('place_id')
        if not place_id:
            continue
        business, created = Business.objects.get_or_create(
            place_id=place_id,
            defaults={
                'latitude': place['geometry']['location']['lat'],
                'longitude': place['geometry']['location']['lng'],
            }
        )

        # Only populate details when newly created (avoid repeated detail calls)
        if created:
            details = get_business_details(place_id, api_key)
            business.name = details.get('name', place.get('name', ''))
            business.address = details.get('formatted_address', place.get('vicinity', ''))
            business.rating = details.get('rating') or place.get('rating')
            business.user_ratings_total = details.get('user_ratings_total') or place.get('user_ratings_total')
            business.price_level = details.get('price_level') or place.get('price_level')
            business.website = details.get('website')
            business.contact_number = details.get('formatted_phone_number')
            business.opening_hours = details.get('opening_hours', {})
            photos = []
            for photo in details.get('photos', []):
                if photo.get('name'):
                    photos.append(f"https://places.googleapis.com/v1/{photo['name']}/media?maxWidthPx=400&key={api_key}")
                elif photo.get('photo_reference'):
                    photos.append(f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference={photo['photo_reference']}&key={api_key}")
            business.photos = photos
            business.reviews = details.get('reviews', [])
            business.types = details.get('types', []) or place.get('types', [])
            business.save()

    return JsonResponse(results, safe=False)


def get_business_details(place_id, api_key):
    details_url = "https://maps.googleapis.com/maps/api/place/details/json"
    details_params = {
        'place_id': place_id,
        'fields': 'name,rating,formatted_phone_number,formatted_address,opening_hours,website,photos,reviews,price_level,user_ratings_total,types',
        'key': api_key
    }
    try:
        details_response = requests.get(details_url, params=details_params, timeout=REQUEST_TIMEOUT)
        if details_response.status_code != 200:
            return {}
        return details_response.json().get('result', {}) or {}
    except requests.RequestException:
        return {}


@csrf_exempt
@api_view(['GET', 'POST'])
def getBusiness(request):
    """
    Accepts POST with JSON { place_id } or GET with ?place_id=...
    """
    data = request.data if request.method == 'POST' else request.GET
    place_id = data.get('place_id')
    if not place_id:
        return JsonResponse({'error': 'place_id required'}, status=400)
    try:
        business = Business.objects.get(place_id=place_id)
        return JsonResponse(business.return_dict(), safe=False)
    except Business.DoesNotExist:
        return JsonResponse({'error': 'Business not found'}, status=404)


@api_view(['GET'])
@authentication_classes([TokenAuthentication, SessionAuthentication])
@permission_classes([IsAuthenticated])
def user_bookmarks(request):
    profile = request.user.profile
    place_ids = list(profile.bookmarked_businesses.values_list('place_id', flat=True))
    return JsonResponse({'bookmarks': place_ids})


@api_view(['POST'])
@authentication_classes([TokenAuthentication, SessionAuthentication])
@permission_classes([IsAuthenticated])
def add_bookmark(request):
    place_id = request.data.get('business')
    profile = request.user.profile
    try:
        business = Business.objects.get(place_id=place_id)
    except Business.DoesNotExist:
        return JsonResponse({'error': 'Business not found'}, status=404)
    if business in profile.bookmarked_businesses.all():
        profile.bookmarked_businesses.remove(business)
        action = 'removed'
    else:
        profile.bookmarked_businesses.add(business)
        action = 'added'
    return JsonResponse({'success': action, 'bookmarks': list(profile.bookmarked_businesses.values_list('place_id', flat=True))})


@csrf_exempt
@api_view(['GET'])
def get_businesses(request):
    q = request.GET.get('q', '').strip()
    type_filter = request.GET.get('type', '').strip()

    queryset = Business.objects.all()

    if q:
        queryset = queryset.filter(
            Q(name__icontains=q) |
            Q(address__icontains=q) |
            Q(place_id__icontains=q)
        )

    if type_filter:
        if connection.vendor == 'postgresql':
            queryset = queryset.filter(types__contains=[type_filter])
        else:
            queryset = queryset.filter(types__icontains=type_filter)

    results = [b.return_dict() for b in queryset]
    return JsonResponse(results, safe=False)


@api_view(['GET', 'POST'])
@authentication_classes([TokenAuthentication, SessionAuthentication])
@permission_classes([IsAuthenticated])
def my_profile(request):
    """
    GET: return { user, role }
    POST: optional -> update role (for testing / signup flow). In production restrict to admin.
    """
    profile = getattr(request.user, 'profile', None)
    if profile is None:
        profile = Profile.objects.create(user=request.user)

    if request.method == 'GET':
        return JsonResponse({'user': request.user.username, 'role': profile.role})

    # POST to change role (CAUTION: restrict in real app)
    new_role = request.data.get('role')
    if new_role and new_role in dict(Profile.ROLE_CHOICES).keys():
        # example restriction: only allow user to set 'business' immediately, or require admin
        profile.role = new_role
        profile.save()
        return JsonResponse({'success': True, 'role': profile.role})
    return JsonResponse({'error': 'invalid role'}, status=400)


@api_view(['POST'])
@permission_classes([AllowAny])
def nearby_businesses(request):
    """Fetch nearby businesses from Google Places API"""
    # This function is an alias for fetch_businesses - use that endpoint instead
    # Keeping for backwards compatibility
    return fetch_businesses(request)


@api_view(['GET'])
@permission_classes([AllowAny])
def featured_resources(request):
    """Get 5 businesses within the specified radius from the user's location"""
    import math
    
    # Get location and radius from query parameters
    lat = request.GET.get('latitude')
    lng = request.GET.get('longitude')
    radius_km = request.GET.get('radius', 5)
    
    try:
        radius_km = float(radius_km)
    except (ValueError, TypeError):
        radius_km = 5
    
    # If no location provided, return first 5 businesses (fallback)
    if not lat or not lng:
        businesses = Business.objects.all().order_by('id')[:5]
    else:
        try:
            user_lat = float(lat)
            user_lng = float(lng)
            
            # Calculate distance for each business and filter by radius
            businesses_with_distance = []
            all_businesses = Business.objects.exclude(latitude__isnull=True).exclude(longitude__isnull=True)
            
            for business in all_businesses:
                if business.latitude is None or business.longitude is None:
                    continue
                
                # Haversine formula to calculate distance in km
                R = 6371  # Earth's radius in km
                d_lat = math.radians(business.latitude - user_lat)
                d_lng = math.radians(business.longitude - user_lng)
                a = (math.sin(d_lat / 2) ** 2 +
                     math.cos(math.radians(user_lat)) * math.cos(math.radians(business.latitude)) *
                     math.sin(d_lng / 2) ** 2)
                c = 2 * math.asin(math.sqrt(a))
                distance = R * c
                
                if distance <= radius_km:
                    businesses_with_distance.append((business, distance))
            
            # Sort by distance and take first 5
            businesses_with_distance.sort(key=lambda x: x[1])
            businesses = [b[0] for b in businesses_with_distance[:5]]
            
        except (ValueError, TypeError):
            # If location parsing fails, return first 5 businesses
            businesses = Business.objects.all().order_by('id')[:5]
    
    if len(businesses) == 0:
        return JsonResponse([], safe=False)
    
    results = []
    for business in businesses:
        results.append({
            'id': business.id,
            'place_id': business.place_id,
            'name': business.name,
            'address': business.address,
            'rating': business.rating,
            'category': business.types[0] if business.types else 'General',
            'description': business.special_offers or f"{business.name} located at {business.address}",
            'phone': business.contact_number,
            'email': None,  # Businesses don't have email in current model
            'website': business.website,
            'photo': business.photos[0] if business.photos else None,
        })
    
    return JsonResponse(results, safe=False)


@api_view(['POST'])
@permission_classes([AllowAny])
def submit_resource(request):
    """Submit a new community resource for review"""
    data = request.data
    
    # Validate required fields
    required_fields = ['name', 'category', 'description', 'submitter_name', 'submitter_email']
    for field in required_fields:
        if not data.get(field):
            return JsonResponse({'error': f'Missing required field: {field}'}, status=400)
    
    # Create a new Business entry (or you could create a separate ResourceSubmission model)
    # For now, we'll create it as a Business with a special flag
    try:
        # Generate a unique place_id for user-submitted resources
        import uuid
        place_id = f"user_submitted_{uuid.uuid4().hex[:12]}"
        
        # Build business data, only including optional fields if they have values
        business_data = {
            'name': data['name'],
            'address': data.get('address', 'Address not provided'),
            'place_id': place_id,
            'types': [data['category']],
            'special_offers': data['description'],
            'latitude': None,  # Explicitly set to None for user-submitted resources
            'longitude': None,  # Explicitly set to None for user-submitted resources
            'rating': None,  # New submissions start with no rating
            'user_ratings_total': 0,
        }
        
        # Only add optional fields if they have non-empty values
        if data.get('phone'):
            business_data['contact_number'] = data['phone']
        if data.get('website'):
            business_data['website'] = data['website']
        
        business = Business.objects.create(**business_data)
        
        return JsonResponse({
            'success': True,
            'message': 'Thank you! Your resource submission has been received and will be reviewed.',
            'id': business.id
        }, status=201)
    except Exception as e:
        return JsonResponse({'error': f'Failed to submit resource: {str(e)}'}, status=500)

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def geocode_address(request):
    """Geocode an address to get coordinates"""
    api_key = getattr(settings, 'GOOGLE_PLACES_API_KEY', None)
    if not api_key:
        return JsonResponse({'error': 'API key not configured'}, status=500)
    
    data = request.data if request.method == 'POST' else request.GET
    address = data.get('address', '').strip()
    
    if not address:
        return JsonResponse({'error': 'Address is required'}, status=400)
    
    try:
        url = "https://maps.googleapis.com/maps/api/geocode/json"
        params = {
            'address': address,
            'key': api_key
        }
        response = requests.get(url, params=params, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        data = response.json()
        
        if data.get('status') == 'OK' and data.get('results'):
            result = data['results'][0]
            location = result['geometry']['location']
            return JsonResponse({
                'success': True,
                'latitude': location['lat'],
                'longitude': location['lng'],
                'formatted_address': result.get('formatted_address', address)
            })
        else:
            status = data.get('status', 'UNKNOWN_ERROR')
            error_message = data.get('error_message', f'Geocoding failed: {status}')
            
            # Provide helpful error messages
            if status == 'REQUEST_DENIED':
                error_message = 'Geocoding API access denied. Please check API key configuration and ensure Geocoding API is enabled.'
            elif status == 'ZERO_RESULTS':
                error_message = 'No results found for this address. Please try a more specific location.'
            elif status == 'OVER_QUERY_LIMIT':
                error_message = 'Geocoding API quota exceeded. Please try again later.'
            
            return JsonResponse({
                'success': False,
                'error': error_message,
                'status': status
            }, status=400)
    except requests.exceptions.RequestException as e:
        return JsonResponse({'error': f'Network error: {str(e)}'}, status=500)
    except Exception as e:
        return JsonResponse({'error': f'Geocoding error: {str(e)}'}, status=500)