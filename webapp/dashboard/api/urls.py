from django.urls import path
from .views import AnimeDashboardAPIView

urlpatterns = [
    path("animes/", AnimeDashboardAPIView.as_view(), name="anime-dashboard"),
]