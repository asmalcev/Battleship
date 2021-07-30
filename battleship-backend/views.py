import os
import json
import datetime

from rooms import Rooms

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
    user = uss.register_new()

  response[0] = json.dumps({
    'id'       : user[0],
    'jwttoken' : user[1],
    'roomId'   : user[2],
  })

  return response

def create_room(request):
  user  = request['session']['user']
  uss   = request['session']['uss']
  rooms = Rooms()

  response = [b'Ok', {
    'status' : 200,
    'headers': [
      (b'Content-Type', b'application/json')
    ]
  }]

  uss.update_room(user[0], rooms.create(user[0]))

  return response

def get_all_opened(request):
  rooms = Rooms()

  return [
    json.dumps(
      list( map( lambda room: room[0], rooms.get_all_opened() ) )
    ), {
    'status' : 200,
    'headers': [
      (b'Content-Type', b'application/json')
    ]
  }]