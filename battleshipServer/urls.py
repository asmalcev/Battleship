from django.urls import path, re_path
from . import views

urlpatterns = [
  path('search', views.search),
  path('quit', views.quit),
  path('create', views.create),
  path('', views.index),
]