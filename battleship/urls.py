from django.urls import include, path

urlpatterns = [
    path('', include('battleshipServer.urls')),
]
