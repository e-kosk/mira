import requests
import serial


if __name__ == '__main__':
    print('setting up serial port communication...')
    ser = serial.Serial('/dev/ttyUSB0', 9600, timeout=0.01)
    print('ready')
    while True:
        value = ser.read(5).decode('utf-8').lower().strip()
        if value in ['up', 'down', 'left', 'right']:
            print(value)
            res = requests.post('http://127.0.0.1:8000/gesture/', data={'gesture': value.strip()})
            if res.status_code != 200:
                print('error sending request')
