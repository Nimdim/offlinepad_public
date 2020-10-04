from django.urls import path
from django.conf.urls.static import static

from . import views

urlpatterns = [
    path('new', views.new, name='new_chat'),
    path('view', views.view, name='view_chat'),
    path('create', views.create, name='create_chat'),
    path('delete', views.delete_chat, name='delete_chat'),
    path('poll_client', views.poll_client, name='poll_client_chat'),
    path('new_client_message', views.new_client_message, name='new_client_message_chat'),

    path('admin_list', views.admin_list, name='admin_list_chat'),
    path('admin_view', views.admin_view, name='admin_view_chat'),
    path('poll_admin', views.poll_admin, name='poll_admin_chat'),
    path('new_admin_message', views.new_admin_message, name='new_admin_message_chat'),
]
# ] + static('/js', document_root="js") \
#   + static('/css', document_root="css") \
#   + static('/images', document_root="images") \
#   + static('/fonts', document_root="fonts")
