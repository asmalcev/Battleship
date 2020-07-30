from django.shortcuts import render, HttpResponse, redirect
from django.contrib.sessions.models import Session
from random import random
from .models import Room

def getRandomID():
  return int(random() * 900000 + 100000)

def index(request):
  playerID = request.session.get('playerID', getRandomID())
  roomID = request.session.get('roomID', None)
  request.session['playerID'] = playerID

  context = {
    'playerID': playerID,
  }
  if roomID == None:
    request.session.modified = True
    return render(request, 'server/index.html', context)
  else:
    context['roomID'] = roomID
    request.session.modified = True
    return render(request, 'server/game.html', context)

def search(request):
  msg = request.read()
  ID = int(msg.decode('utf-8'))
  try:
    room = Room.objects.get(pk = ID)
    room.guestID = request.session['playerID']
    room.save()
    request.session['roomID'] = ID
    request.session.modified = True
    return redirect('/')
  except:
    return HttpResponse(status=404)

def create(request):
  roomID = getRandomID()
  room = Room(hostID=request.session['playerID'], roomID=roomID, hostField='0'*100, guestField='0'*100)
  room.save()

  request.session['roomID'] = roomID
  request.session.modified = True
  return redirect('/')

def quit(request):
  try:
    room = Room.objects.get(pk = request.session['roomID'])
    if room.hostID == request.session['playerID']:
      room.delete()
      print('Host deleted room ID: ', request.session['roomID'])
    else:
      room.guestID = None
      room.save()
      print('Guest leaved room ID: ', request.session['roomID'])
    del request.session['roomID']
  except:
    try:
      del request.session['roomID']
    except:
      pass
  request.session.modified = True
  return redirect('/')