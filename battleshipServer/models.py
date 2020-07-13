from django.db import models

class Room(models.Model):
  hostID = models.DecimalField(max_digits=6, decimal_places=0)
  guestID = models.DecimalField(max_digits=6, decimal_places=0, null=True, blank=True)
  roomID = models.DecimalField(max_digits=6, decimal_places=0, primary_key=True, null=False, unique=True)
  hostField = models.CharField(max_length=100)
  guestField = models.CharField(max_length=100)
  hostStatus = models.SmallIntegerField(null=True, blank=True)
  guestStatus = models.SmallIntegerField(null=True, blank=True)

  def __str__(self):
    return str(self.roomID)