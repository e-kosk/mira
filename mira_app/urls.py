from django.contrib import admin
from django.urls import path
from mira_app.views import WeatherAPIView, PublicTransportAPIView, CartAPIView, CalendarAPIView, MiraView

urlpatterns = [
    path('weather/', WeatherAPIView.as_view()),
    path('public_transport/<line>/', PublicTransportAPIView.as_view()),
    path('cart/', CartAPIView.as_view()),
    path('calendar/', CalendarAPIView.as_view()),
    path('', MiraView.as_view()),
]