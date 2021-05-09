from views import *

urlpatterns = [
  (r'/create', create),
  (r'/delete', delete),
  (r'/find', find),
  (r'/auth', auth, 'no-jwt'),
  (r'/', index),
]