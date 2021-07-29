import os
import json
import datetime

def find(request):
  return [
    'Nothing has been found',
    {
      'status': 404,
    }
  ]

def not_found(request):
  return [
    'Nothing has been found',
    {
      'status': 404,
    }
  ]

def auth(request):
  user = request['session']['user']
  uss  = request['session']['uss']

  response = [b'', {
    'status' : 200,
    'headers': [
      (b'Content-Type', b'application/json')
    ]
  }]

  if user == None:
    user        = uss.register_new()

  response[0] = json.dumps({
    'id'       : user[0],
    'jwttoken' : user[1]
  })

  return response