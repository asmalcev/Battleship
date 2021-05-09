import os
import re

from urls import urlpatterns

async def read_body(receive):
  body      = b''
  more_body = True

  while more_body:
    message   = await receive()
    body     += message.get('body', b'')
    more_body = message.get('more_body', False)

  return body

def parse_cookie(cookie):
  return cookie.split('=') if not cookie == None else None

def find_jwt_cookie(cookie):
  return next(
      (
        cook for cook in map(lambda c: c.strip(), cookie.split(';')) if parse_cookie(cook)[0] == 'jwttoken'
      ),
      None
    )

async def wsgi_app(scope, receive, send, uss):
  body             = await read_body(receive)
  response         = ()

  has_jwt_token = True
  jwt_token     = ''

  cookie = next(
    (
      header for header in scope['headers'] if header[0] == b'cookie'
    ),
    None
  )
  if cookie == None:
    has_jwt_token = False
  else:
    jwt_token = parse_cookie(
      find_jwt_cookie(cookie[1].decode())
    )
    if jwt_token == None:
      has_jwt_token = False
    else:
      jwt_token = jwt_token[1]
      if uss.decode_jwt(jwt_token) == None:
        has_jwt_token = False

  for urlpattern in urlpatterns:
    if re.match(urlpattern[0], scope['path']):
      if len(urlpattern) > 2 and urlpattern[2] == 'no-jwt':
        response = urlpattern[1]({
          'body'   : body,
          'scope'  : scope,
          'session': {
            'uss': uss,
            'jwt': jwt_token
          }
        })

      else:
        if has_jwt_token:
          response = urlpattern[1]({
            'body'   : body,
            'scope'  : scope,
            'session': {
              'uss': uss,
              'jwt': jwt_token
            }
          })
        else:
          response = (
            b'403 Forbidden',
            {
              'status': 403
            }
          )
      break

  response_body    = b''
  response_headers = {
    'status': 200
  }
  if type(response) is str:
    response_body = response.encode()

  elif type(response) is tuple or type(response) is list:
    if type(response[0]) is str:
      response_body = response[0].encode()
    else:
      response_body = response[0]
    response_headers = response[1]

  elif type(response) is bytes:
    response_body = response

  response_headers['type'] = 'http.response.start'

  await send(response_headers)
  await send({
    'type': 'http.response.body',
    'body': response_body,
  })