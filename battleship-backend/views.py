import os
import json
import datetime

from rooms import Rooms

def find(request):
  rooms = Rooms()

  json_body = {}
  if not request['body'] == b'':
    try:
      json_body = json.loads(request['body'])
    except:
      pass

  if len(rooms.get_by_id(json_body['roomId'])) == 0:
    return [
      'Nothing has been found',
      {
        'status': 404,
      }
    ]
  else:
    return connect(request)

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

  is_open = False
  if not request['body'] == b'':
    try:
      is_open = json.loads(request['body'])['isOpen']
    except:
      pass

  room_id = rooms.create(user[0], is_open)
  uss.update_room(user[0], room_id)

  return [str(room_id), {
    'status' : 200
  }]

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

def delete_room(request):
  user  = request['session']['user']
  uss   = request['session']['uss']
  rooms = Rooms()

  json_body = {}
  if not request['body'] == b'':
    try:
      json_body = json.loads(request['body'])
    except:
      pass

  room = rooms.get_by_id(json_body['roomId'])[0]
  if room[1] == user[0]:
    rooms.delete_room(json_body['roomId'])
  else:
    rooms.change_guest_id(json_body['roomId'], 0)

  uss.update_room(user[0], 0)

  return ['Deleted room: %s' % json_body['roomId'], {
    'status' : 200
  }]

def connect(request):
  user  = request['session']['user']
  uss   = request['session']['uss']
  rooms = Rooms()

  json_body = {}
  if not request['body'] == b'':
    try:
      json_body = json.loads(request['body'])
    except:
      pass

  rooms.change_guest_id(json_body['roomId'], json_body['userId'])
  uss.update_room(user[0], json_body['roomId'])

  return ['Connected to room: %s' % json_body['roomId'], {
    'status' : 200
  }]