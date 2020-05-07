from django.urls import path, re_path
from . import views

urlpatterns = [
  path('search', views.search),
  path('create', views.create),
  path('quit', views.quit),
  path('', views.index),
]