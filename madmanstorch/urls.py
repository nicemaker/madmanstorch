from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
from django.conf.urls.static import static
from django.conf import settings
from ongoingon import views

admin.autodiscover()


urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'madmanstorch.views.home', name='home'),
    # url(r'^madmanstorch/', include('madmanstorch.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
    url(r'^$', views.index, name='index'), 
    url(r'^ongoingon/', include('ongoingon.urls') ),
)+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


