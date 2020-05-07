from django.urls import include, path

from django.contrib.staticfiles.urls import staticfiles_urlpatterns

# ... the rest of your URLconf goes here ...


urlpatterns = [
    path('', include('battleshipServer.urls')),
]

urlpatterns += staticfiles_urlpatterns()