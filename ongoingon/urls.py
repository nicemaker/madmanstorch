from django.conf.urls import patterns, include, url
from ongoingon import views
urlpatterns = patterns('',
    url(r'^$', views.index, name='index'),
    url(r'^mobile/$', views.mobile, name='mobile'),
)
