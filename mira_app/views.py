from django.http import JsonResponse
from django.shortcuts import render
from django.views import View

from mira_app.google_calendar import get_events
from mira_app.models import ProductModel
from mira_app.static.mira_app.get_data import get_weather_data, get_public_transport_data


class WeatherAPIView(View):

    def get(self, request):
        weather_data = get_weather_data()
        return JsonResponse(weather_data)


class PublicTransportAPIView(View):

    def get(self, request, line):
        bus_data = get_public_transport_data(line)
        return JsonResponse(bus_data)


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
            'test': 'Hello World'
        }
        return render(request, 'mira.html', context)
