# Create your views here.
# Create your views here.
from django.http import HttpResponse
from django.shortcuts import render
from ongoingon.models import Insight,Snippet

def index(request):
    insights = Insight.objects.all();
    snippets = Snippet.objects.all();
    return render(request,'ongoingon/index.html',{'snippets':snippets,'insights':insights})
    
def mobile(request):
    insights = Insight.objects.all();
    snippets = Snippet.objects.all();
    return render(request,'ongoingon/mobile.html',{'snippets':snippets,'insights':insights})
