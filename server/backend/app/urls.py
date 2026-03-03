from django.contrib import admin
from django.urls import path, include
from .views import (
    fetch_businesses,
    getBusiness,
    add_bookmark,
    user_bookmarks,
    get_businesses,
    my_profile,
    featured_resources,
    submit_resource,
)

urlpatterns = [
    path('nearby_businesses/', fetch_businesses, name='fetch_businesses'),
    path('getBusiness/', getBusiness, name='fetch_businesses'),
    path('add_bookmark/', add_bookmark, name='add_bookmark'),
    path('businesses/', get_businesses, name='get_businesses'),
    path('user_bookmarks/', user_bookmarks, name='user_bookmarks'),
    path('my_profile/', my_profile, name='my_profile'),
    path('resources/featured/', featured_resources, name='featured_resources'),
    path('submissions/', submit_resource, name='submit_resource'),
]