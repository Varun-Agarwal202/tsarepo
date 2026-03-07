import django
import os
import sys

# ── Setup ──────────────────────────────────────────────────────────────────
sys.path.append('/Users/varunagarwal/FBLA_CodingProgramming/server/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Override the database URL to use the public Railway connection
os.environ['DATABASE_URL'] = 'postgresql://postgres:oFGrdmVIiyzvmJUsjTyHgfQxRDcoWQMG@hopper.proxy.rlwy.net:26148/railway'

django.setup()

# ── Import model ───────────────────────────────────────────────────────────
from app.models import Business  # change 'api' to your actual app name if different

# ── Load JSON ──────────────────────────────────────────────────────────────
import json

json_path = os.path.join(os.path.dirname(__file__), 'communityresources.json')

with open(json_path) as f:
    data = json.load(f)

# ── Insert records ─────────────────────────────────────────────────────────
created_count = 0
skipped_count = 0

for resource in data['resources']:
    if Business.objects.filter(place_id=resource['place_id']).exists():
        skipped_count += 1
        continue

    Business.objects.create(
        name=resource['name'],
        address=resource['address'],
        latitude=resource.get('latitude'),
        longitude=resource.get('longitude'),
        reviews=resource.get('reviews', []),
        place_id=resource['place_id'],
        types=resource.get('types', []),
        rating=resource.get('rating'),
        user_ratings_total=resource.get('user_ratings_total'),
        price_level=resource.get('price_level'),
        website=resource.get('website') or '',
        contact_number=resource.get('contact_number'),
        opening_hours=resource.get('opening_hours', {}),
        photos=resource.get('photos') or [],
        special_offers=resource.get('special_offers'),
    )
    created_count += 1
    print(f"✓ Created: {resource['name']}")

print(f"\nDone! Created: {created_count} | Skipped: {skipped_count}")