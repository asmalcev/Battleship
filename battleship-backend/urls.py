from views import *

urlpatterns = [
  (r'/find', find),
  (r'/auth', auth, 'no-jwt'),
  (r'/', not_found),
]