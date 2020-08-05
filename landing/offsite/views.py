# from django.template import RequestContext
from django.shortcuts import render

# Create your views here.
# from django.http import HttpResponse


def index(request):
    # latest_question_list = Question.objects.order_by('-pub_date')[:5]
    context = {}
    return render(request, 'offsite/index.html', context)


def oldapps(request):
    # latest_question_list = Question.objects.order_by('-pub_date')[:5]
    context = {}
    return render(request, 'offsite/oldapps.html', context)


def openapp(request):
    # latest_question_list = Question.objects.order_by('-pub_date')[:5]
    context = {}
    return render(request, 'offsite/openapp.html', context)


def handler404(request, *args, **argv):
    context = {}
    # response = render('offsite/page-404.html', {}, context)
    return render(request, 'offsite/page-404.html', context)
    # response.status_code = 404
    # return response
