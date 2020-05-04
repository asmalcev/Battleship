from django.shortcuts import render, HttpResponse, redirect
from django.contrib.sessions.models import Session
from random import random
from .models import Room

def getRandomID():
  return int(random() * 900000 + 100000)

def index(request):
  # Room.objects.all().delete()
  # Session.objects.all().delete()
  print(Session.objects.all())
  print(list(map(lambda x: 'hostID: {0}; guestID: {1}; roomID: {2}'.format(x.hostID, x.guestID, x.roomID) , list(Room.objects.all()))))
  playerID = request.session.get('playerID', getRandomID())
  roomID = request.session.get('roomID', None)
  # roomID = None
  request.session['playerID'] = playerID

  context = {
    'playerID': playerID,
  }
  if roomID == None:
    return render(request, 'server/index.html', context)
  else:
    context['roomID'] = roomID
    return render(request, 'server/game.html', context)

def search(request):
  print(list(map(lambda x: 'hostID: {0}; guestID: {1}; roomID: {2}'.format(x.hostID, x.guestID, x.roomID) , list(Room.objects.all()))))
  msg = request.read()
  ID = int(msg.decode('utf-8'))
  try:
    room = Room.objects.get(pk = ID)
    room.guestID = request.session['playerID']
    room.save()
    request.session['roomID'] = ID
    return redirect('/')
  except:
    return HttpResponse(status=404)

def create(request):
  roomID = getRandomID()
  room = Room(hostID=request.session['playerID'], roomID=roomID, hostField='0'*100, guestField='0'*100)
  room.save()

  request.session['roomID'] = roomID
  print(list(map(lambda x: 'hostID: {0}; guestID: {1}; roomID: {2}'.format(x.hostID, x.guestID, x.roomID) , list(Room.objects.all()))))
  return redirect('/')

def quit(request):
  room = Room.objects.get(pk = request.session['roomID'])
  room.delete()
  del request.session['roomID']
  print(list(map(lambda x: 'hostID: {0}; guestID: {1}; roomID: {2}'.format(x.hostID, x.guestID, x.roomID) , list(Room.objects.all()))))
  return redirect('/')