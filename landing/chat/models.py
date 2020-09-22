from django.db import models

class Chat(models.Model):
    secret = models.CharField(max_length=128)
    email = models.CharField(max_length=512)
    name = models.CharField(max_length=128)
    question = models.CharField(max_length=1024)
    state = models.CharField(max_length=16)
    new = models.BooleanField()

class ChatMessage(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name="messages")
    timestamp = models.DateTimeField()
    direction = models.CharField(max_length=16)
    text = models.CharField(max_length=512)
    readed = models.BooleanField()
