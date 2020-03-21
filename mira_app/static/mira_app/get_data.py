import datetime
import json
import re

import requests
from bs4 import BeautifulSoup


def get_weather_data():
    url = 'https://api.darksky.net/forecast/7a31a719515942165dd6e87e76096fb4/50.049683,19.944544?units=si'
    r = requests.get(url)
    j = json.loads(r.text)

    try:
        curr_precip_propability = j['currently']['precipProbability']
    except KeyError:
        curr_precip_propability = 0

    try:
        curr_precip_type = j['currently']['precipType']
    except KeyError:
        curr_precip_type = ''

    data = {
        'currently': {
            'temperature': j['currently']['temperature'],
            'icon': j['currently']['icon'],
            'precipProbability': curr_precip_propability,
            'precipType': curr_precip_type,
        },
        'hourly': {
            'temperature': {},
            'precipitation': {},
        }
    }

    iter_data = j['hourly']['data']
    for i, x in enumerate(iter_data[:24]):
        try:
            precip_propability = x['precipProbability']
        except KeyError:
            precip_propability = 0

        data['hourly']['temperature'][i] = x['temperature']
        data['hourly']['precipitation'][i] = precip_propability

    return data


def get_public_transport_data(line_number):

    def get_content(line):
        url = f"https://www.m.rozkladzik.pl/krakow/rozklad_jazdy.html?l={line if line != '139r' else '139'}&d={line_data[line]['direction']}&b={line_data[line]['stop']}&dt={weekday}"
        res = requests.get(url)
        return res.content

    line_data = {
        '182': {
            'direction': 0,
            'stop': 10,
        },
        '139': {
            'direction': 0,
            'stop': 10,
        },
        '139r': {
            'direction': 1,
            'stop': 31,
        },
        '159': {
            'direction': 0,
            'stop': 5,
        },
        '52': {
            'direction': 0,
            'stop': 2,
        },
        '163': {
            'direction': 1,
            'stop': 4,
        },
    }

    weekday = datetime.date.weekday(datetime.date.today())

    soup = BeautifulSoup(get_content(line_number), features="html.parser")
    time_table = soup.find(id='time_table')

    i = 0

    times = {}

    for tr in time_table.find_all_next('tr'):
        h_regex = r'class="h">(?P<h>\d+)<'
        m_regex = r'class="m">(?P<m>\d+)<'
        h = re.findall(h_regex, str(tr))[0]
        m_list = re.findall(m_regex, str(tr))

        for m in m_list:
            times[i] = f'{h}:{m}'
            i += 1

    return times
