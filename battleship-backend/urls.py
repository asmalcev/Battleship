from views import *

urlpatterns = [
  (r'/get-opened-rooms', get_all_opened),
  (r'/connect', connect),
  (r'/delete' , delete_room),
  (r'/create' , create_room),
  (r'/find'   , find),
  (r'/auth'   , auth, 'no-jwt'),
  (r'/'       , not_found),
]