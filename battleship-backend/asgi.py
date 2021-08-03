from dotenv import load_dotenv

from wsgi      import wsgi_app
from session   import UserSessions
from websocket import WebsocketApplication

load_dotenv('.env')

async def application(scope, receive, send):
  if scope['type'] == 'http':
    await wsgi_app(scope, receive, send, UserSessions())

  elif scope['type'] == 'websocket':
    wa = WebsocketApplication(scope, receive, send)
    await wa.run()

  else:
    await send({
      'status': 405,
      'body': b'405 Method Not Allowed'
    })