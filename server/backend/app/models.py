from django.db import models
from django.conf import settings
from encrypted_model_fields.fields import (
    EncryptedCharField,
    EncryptedTextField,
)


class Business(models.Model):
    name = EncryptedCharField(max_length=255)
    address = EncryptedCharField(max_length=255)
    latitude = EncryptedCharField(max_length=50, null=True, blank=True)
    longitude = EncryptedCharField(max_length=50, null=True, blank=True)
    reviews = models.JSONField(default=list, blank=True)
    place_id = models.CharField(max_length=255, unique=True)
    types = models.JSONField(default=list, blank=True)
    rating = EncryptedCharField(max_length=50, null=True, blank=True)
    user_ratings_total = EncryptedCharField(max_length=50, null=True, blank=True)
    price_level = EncryptedCharField(max_length=50, null=True, blank=True)
    website = EncryptedCharField(max_length=500, null=True, blank=True)   # was EncryptedURLField
    contact_number = EncryptedCharField(max_length=20, null=True, blank=True)
    opening_hours = models.JSONField(default=dict, blank=True)
    photos = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    special_offers = EncryptedTextField(null=True, blank=True)

    def __str__(self):
        return self.name

    def _to_float(self, value):
        try:
            return float(value) if value not in (None, '') else None
        except (TypeError, ValueError):
            return None

    def _to_int(self, value):
        try:
            return int(value) if value not in (None, '') else None
        except (TypeError, ValueError):
            return None

    def return_dict(self):
        return {
            "name": self.name,
            "address": self.address,
            "latitude": self._to_float(self.latitude),
            "longitude": self._to_float(self.longitude),
            "reviews": self.reviews,
            "place_id": self.place_id,
            "types": self.types,
            "rating": self._to_float(self.rating),
            "user_ratings_total": self._to_int(self.user_ratings_total),
            "price_level": self._to_int(self.price_level),
            "website": self.website,
            "contact_number": self.contact_number,
            "opening_hours": self.opening_hours,
            "photos": self.photos,
            "special_offers": self.special_offers,
        }


class Profile(models.Model):
    ROLE_USER = 'user'
    ROLE_BUSINESS = 'business'
    ROLE_ADMIN = 'admin'

    ROLE_CHOICES = [
        (ROLE_USER, 'User'),
        (ROLE_BUSINESS, 'Business'),
        (ROLE_ADMIN, 'Admin'),
    ]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    bookmarked_businesses = models.ManyToManyField(Business, blank=True, related_name='bookmarked_by')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_USER)

    def __str__(self):
        return f"Profile: {self.user} ({self.role})"

    def is_business(self):
        return self.role == self.ROLE_BUSINESS

    def is_admin(self):
        return self.role == self.ROLE_ADMIN

    def to_dict(self):
        return {
            "user_id": self.user.id,
            "username": getattr(self.user, "username", None),
            "role": self.role,
        }