# Create your views here.
from django.http import HttpResponse
from django.shortcuts import render

def index(result):
    return HttpResponse( 'yo' )