from django.contrib import admin
from .models import Business, Profile
from django.db import connection


@admin.register(Business)
class BusinessAdmin(admin.ModelAdmin):
    readonly_fields = ('encrypted_preview',)

    def encrypted_preview(self, obj):
        if not obj.pk:
            return "Save first"
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT name, address, contact_number, website, special_offers, rating, latitude, longitude, price_level, user_ratings_total FROM app_business WHERE id = %s",
                [obj.pk]
            )
            row = cursor.fetchone()
        if not row:
            return "Not found"
        labels = ["name", "address", "contact_number", "website", "special_offers", "rating", "latitude", "longitude", "price_level", "user_ratings_total"]
        return "\n".join(f"{label}: {val}" for label, val in zip(labels, row))

    encrypted_preview.short_description = "Raw Encrypted DB Values"


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    pass