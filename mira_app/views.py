import os

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.conf import settings
from django.http import JsonResponse, HttpResponse
from django.shortcuts import render
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt

from mira_app.google_calendar import get_events
from mira_app.models import ProductModel
from mira_app.get_data import get_weather_data, get_public_transport_data


class WeatherAPIView(View):

    def get(self, request):
        weather_data = get_weather_data()
        return JsonResponse(weather_data)


class PublicTransportAPIView(View):

    def get(self, request, line):
        bus_data = get_public_transport_data(line)
        return JsonResponse(bus_data)


@method_decorator(csrf_exempt, name='dispatch')
class CartAPIView(View):

    def get(self, request):
        data = {'needed': {}, 'rest': {}}
        products = ProductModel.objects.all()
        for product in products:
            if product.needed:
                data['needed'][product.name] = product.quantity
            else:
                data['rest'][product.name] = product.quantity
        return JsonResponse(data)

    def post(self, request):
        data = request.POST.dict()

        method = data['method']
        text = data['text']
        value = data['value'] == '1'

        if method == 'create':
            ProductModel.objects.create(name=text, needed=value)

        elif method == 'update':
            product = ProductModel.objects.get(name=text)
            product.needed = value
            product.save()

        else:
            return HttpResponse(status=400)

        return HttpResponse(status=200)


class CalendarAPIView(View):

    def get(self, request):
        events_data = get_events()
        events = []

        for i, event in enumerate(events_data):
            try:
                event_start = event['start']['dateTime']
                event_end = event['end']['dateTime']
            except KeyError:
                event_start = event['start']['date']
                event_end = event['end']['date']

            try:
                event_description = event['description']
            except KeyError:
                event_description = ''

            events.append({
                'start': event_start,
                'end': event_end,
                'title': event['summary'],
                'description': event_description
            })

        return JsonResponse({'events': events})


class MiraView(View):

    def get(self, request):
        context = {
            'http_address': os.path.join('http://' + settings.IP_ADDRESS, 'manage')
        }
        return render(request, 'mira.html', context)


class ManageView(View):

    def get(self, request):
        products = [(product.name, product.needed) for product in ProductModel.objects.all().order_by('-needed', 'name')]
        context = {
            'products': products,
        }
        return render(request, 'manage.html',  context)


class OpenCVView(View):

    def get(self, request):
        return render(request, 'opencv.html')


@method_decorator(csrf_exempt, name='dispatch')
class GestureView(View):

    def post(self, request):
        gesture = request.POST.get('gesture')
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            'gestures',
            {
                'type': 'send_message',
                'message': gesture
            }
        )
        return HttpResponse(status=200)

