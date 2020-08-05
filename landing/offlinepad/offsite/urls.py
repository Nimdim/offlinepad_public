from django.urls import path
from django.conf.urls.static import static

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('oldapps.html', views.oldapps, name='oldapps'),
    path('openapp.html', views.openapp, name='openapp'),
] + static('/js', document_root="../js") \
  + static('/css', document_root="../css") \
  + static('/images', document_root="../images") \
  + static('/fonts', document_root="../fonts")
