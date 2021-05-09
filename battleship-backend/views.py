def index(request):
  # print(request)

  return (
    b'It\'s Home page',
    {
      'status': 200
    }
  )

def create(request):
  return b'It\'s creating page'

def delete(request):
  return 'It\'s deleting page'

def find(request):
  return [
    'Nothing has been found',
    {
      'status': 404
    }
  ]

def auth(request):
  jwt_token = request['session']['jwt']
  uss       = request['session']['uss']

  response = [b'', {
    'status' : 200,
    'headers': []
  }]

  if jwt_token == None:
    user = uss.register_new()

    response[0]            = str(user[0])
    response[1]['headers'].append(
      [ b'Set-Cookie', ('jwttoken=%s' % user[1]).encode() ]
    )
  else:
    user = uss.find_user_by_jwt(jwt_token)
    print(user)

    response[0] = ('already %s' % user[0]).encode()

  return response