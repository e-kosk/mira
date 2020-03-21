import requests
import json
import time


while True:
    url = 'http://ttss.mpk.krakow.pl/internetservice/services/passageInfo/stopPassages/stop?stop=383&mode=departure'
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.137 Safari/537.36',
    }

    response = requests.get(url=url, headers=headers)
    res = json.loads(response.content)

    with open('trip_ids.json', 'r') as file:
        file_data = json.loads(file.read())

    for data in res['actual']:

        file_data[data['patternText']][data['plannedTime']] = {'tripId': data['tripId'], 'direction': data['direction']}

        with open('trip_ids.json', 'w') as file:
            file.write(json.dumps(file_data, indent=4))

    print(json.dumps(res, indent=4))

    time.sleep(1500)
