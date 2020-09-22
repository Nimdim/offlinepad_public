# from django.template import RequestContext
from django.shortcuts import render
from django.http import JsonResponse, HttpResponseForbidden

from .models import Chat, ChatMessage
import secrets
from datetime import datetime
# Create your views here.
# from django.http import HttpResponse


def new(request):
    context = {
        "breadcrumbs": [
            {"name": "OfflinePad", "url": "index"},
            {"name": "Задать вопрос"},
        ],
    }
    return render(request, 'chat/new.html', context)


def view(request):
    id = request.GET["id"]
    secret = request.GET["secret"]
    chat = Chat.objects.filter(id=id, secret=secret).get()
    if chat is not None:
        context = {
            "id": id,
            "secret": secret,
            "question": chat.question,
        }
        return render(request, 'chat/view.html', context)


def create(request):
    if request.method == "POST":
        name = request.POST["name"]
        email = request.POST["email"]
        question = request.POST["question"]
        secret = secrets.token_hex(64)
        chat = Chat(
            name=name, email=email, question=question, secret=secret,
            new=True, state="open"
        )
        chat.save()
        result = {"id": chat.id, "secret": secret}
        return JsonResponse(result)


def poll_client(request):
    if request.method == "POST":
        id = request.POST["id"]
        secret = request.POST["secret"]
        stamp = datetime.utcfromtimestamp(float(request.POST["stamp"]))
        chats = Chat.objects.filter(id=id, secret=secret)
        if len(chats) > 0:
            chat = chats[0]
            messages = ChatMessage.objects.filter(chat=chat, timestamp__gt=stamp).order_by('timestamp')
            result = []
            for message in messages:
                if message.direction == "support" and not message.readed:
                    message.readed = True
                    message.save()
                result.append({
                    "timestamp": message.timestamp.timestamp(),
                    "direction": message.direction,
                    "text": message.text,
                    "readed": message.readed,
                })
            result = {
                "error": "ok",
                "items": result
            }
        else:
            result = {
                "error": "wrong id or secret",
            }
        return JsonResponse(result)


def new_client_message(request):
    if request.method == "POST":
        id = request.POST["id"]
        secret = request.POST["secret"]
        timestamp = datetime.utcnow()
        text = request.POST["text"]
        chats = Chat.objects.filter(id=id, secret=secret)
        if len(chats) > 0:
            chat = chats[0]
            message = ChatMessage(
                chat=chat, timestamp=timestamp,
                direction="client", text=text, readed=False
            )
            message.save()
            result = {
                "error": "ok",
            }
        else:
            result = {
                "error": "wrong id or secret",
            }
        return JsonResponse(result)


def admin_required(func):
    def wrapper(request):
        if not request.user.is_authenticated:
            return HttpResponseForbidden()
        else:
            return func(request)
    return wrapper


@admin_required
def admin_list(request):
    chats = Chat.objects.order_by("-id")
    chats_data = []
    for chat in chats:
        new_client_messages = chat.messages.filter(direction="client", readed=False).order_by("id")
        new_from_client = chat.messages.filter(direction="client", readed=False).count()
        unreaded_by_client = chat.messages.filter(direction="support", readed=False).count()
        if unreaded_by_client:
            style = "background: rgb(202, 255, 202);"
        elif new_from_client:
            style = "background: rgb(255, 202, 202);"
        else:
            style = ""
        item = {
            "style": style,
            "id": chat.id,
            "question": chat.question,
            "name": chat.name,
            "email": chat.email,
            "total": chat.messages.count(),
            "new_from_client": new_from_client,
            "unreaded_by_client": unreaded_by_client,
            "new_client_messages": [i.text for i in new_client_messages],
        }
        chats_data.append(item)
    context = {
        "chats": chats_data,
    }
    return render(request, 'chat/admin_list.html', context)


@admin_required
def admin_view(request):
    id = request.GET["id"]
    chat = Chat.objects.filter(id=id).get()
    if chat is not None:
        context = {
            "id": id,
            "question": chat.question,
        }
        return render(request, 'chat/admin_view.html', context)


@admin_required
def poll_admin(request):
    if request.method == "POST":
        id = request.POST["id"]
        stamp = datetime.utcfromtimestamp(float(request.POST["stamp"]))
        chats = Chat.objects.filter(id=id)
        if len(chats) > 0:
            chat = chats[0]
            messages = ChatMessage.objects.filter(chat=chat, timestamp__gt=stamp).order_by('timestamp')
            result = []
            for message in messages:
                if message.direction == "client" and not message.readed:
                    message.readed = True
                    message.save()
                result.append({
                    "timestamp": message.timestamp.timestamp(),
                    "direction": message.direction,
                    "text": message.text,
                    "readed": message.readed,
                })
            result = {
                "error": "ok",
                "items": result
            }
        else:
            result = {
                "error": "wrong id",
            }
        return JsonResponse(result)


@admin_required
def new_admin_message(request):
    if request.method == "POST":
        id = request.POST["id"]
        timestamp = datetime.utcnow()
        text = request.POST["text"]
        chats = Chat.objects.filter(id=id)
        if len(chats) > 0:
            chat = chats[0]
            message = ChatMessage(
                chat=chat, timestamp=timestamp,
                direction="support", text=text, readed=False
            )
            message.save()
            result = {
                "error": "ok",
            }
        else:
            result = {
                "error": "wrong id",
            }
        return JsonResponse(result)
