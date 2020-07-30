import os

import django

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'battleship.settings')
os.environ["DJANGO_ALLOW_ASYNC_UNSAFE"] = "true"

django.setup()

from battleship.websocket import WebsocketApplication

django_application = get_asgi_application()

async def application(scope, receive, send):
  if scope['type'] == 'http':
    await django_application(scope, receive, send)
  elif scope['type'] == 'websocket':
    wa = WebsocketApplication(scope, receive, send)
    await wa.run()
  else:
    raise NotImplementedError(f"Unknown scope type {scope['type']}")