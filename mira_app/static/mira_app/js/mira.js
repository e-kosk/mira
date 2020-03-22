function updateTime() {
    let date =  new Date;
    let weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    $('#time span:nth-child(1)').text(("0" + date.getHours()).slice(-2) + ':' + ("0" + date.getMinutes()).slice(-2));

    $('#date-day span').text(weekdays[date.getDay()]);
    $('#date-year span').text(("0" + date.getDate()).slice(-2) + '.' + ("0" + (date.getMonth() + 1)).slice(-2) + '.' + date.getFullYear());
}


function getWeather() {
    $.ajax({
        url: 'weather/',
        method: 'get',
    }).done(function (r) {
        let current_temp = r['currently']['temperature'].toString();
        let current_icon = r['currently']['icon'];

        $('#weather-value').text(current_temp.split('.')[0]);
        $('#weather-icon').removeClass().addClass('wi').addClass('weather-icon').addClass(weatherTranslates[current_icon]);

        getWeatherForecast(r.hourly.temperature, r.hourly.precipitation);
    })
}


// function checkWeatherIcon() {
//     let i = 1000;
//     $.each(weatherTranslates, function (k, v) {
//         i += 1000;
//         setTimeout(function () {
//             setInterval(function() {
//                 $('#weather-icon').removeClass().addClass('wi').addClass('weather-icon').addClass(v);
//             }, Object.keys(weatherTranslates).length * 1000);
//             $('#weather-icon').removeClass().addClass('wi').addClass('weather-icon').addClass(v);
//         }, i)
//     })
// }


function getCalendar() {
    let e = [];

    $.ajax({
        url: 'calendar/',
        method: 'get',
    }).done(function (r) {
        $.each(r.events, function (k, v) {
            let d = new Date(v.start);
            e.push({'Date': new Date(d.getFullYear(), d.getMonth(), d.getDate()), 'Title': v.title},);
            showEvent(v.title, v.description, new Date(d.getFullYear(), d.getMonth(), d.getDate()))
        });
        const settings = {
            Color: '',
            LinkColor: '',
            NavShow: false,
            NavVertical: false,
            NavLocation: '',
            DateTimeShow: false,
            DateTimeFormat: 'mmm, yyyy',
            DatetimeLocation: '',
            EventClick: '',
            EventTargetWholeDay: false,
            DisabledDays: [5, 6],
        };
        const element = document.getElementById('calendar-m');
        caleandar(element, e, settings);
    });
}


function showEvent(title, description, date) {
    let eventsList = $('#events ul');

    let li = $('<li>');
    let eventEl = $('<div class="event">');
    // let eventIcon = $('<div class="event-icon">');
    let eventTitle = $('<div class="event-title bold">');
    let eventDate = $('<div class="event-date grey">');
    let eventDescription = $('<div class="event-description light">');

    eventTitle.text(title);
    eventDate.text(("0" + date.getDate()).slice(-2) + '.' + ("0" + (date.getMonth() + 1)).slice(-2) + '.' + date.getFullYear());

    // eventEl.append(eventIcon);
    eventEl.append(eventTitle);
    eventEl.append(eventDate);

    if (description) {
        eventDescription.text(description);
        eventEl.append(eventDescription);
    }

    li.append(eventEl);
    eventsList.append(li);
}


function getCart() {
    let cart = $('#cart');

    $.ajax({
        url: 'cart/',
        method: 'get',
    }).done(function (r) {
        cart.html('');

        $.each(r.needed, function (k, v) {
            let li = $('<li>');
            let span_name = $('<span>');
            let span_quantity = $('<span class="cart-quantity bold grey right">');

            span_name.text(k);
            span_quantity.text(v);

            li.append(span_name);
            li.append(span_quantity);
            cart.append(li);
        });
    });
}


async function getTransportData(line) {
    let result = null;

    await $.ajax({
        url: `public_transport/${line}/`,
        method: 'get',
    }).done(function (r) {
        result = r;
    });

    return result
}


async function getPublicTransport() {
    let result = {};

    await getTransportData('182').then(r => result['182'] = r);
    await getTransportData('52').then(r => result['52'] = r);
    await getTransportData('139').then(r => result['139'] = r);
    await getTransportData('139r').then(r => result['139r'] = r);
    await getTransportData('159').then(r => result['159'] = r);

    return result;
}


function updatePublicTransport(data) {
    let nearestTimes = {};

    $.each(data, function (k, v) {
        let nearest = getNearest(v);
        nearestTimes[k] = nearest
    });

    console.log('nearest times', nearestTimes);

    let nearestLines = orderLines(nearestTimes);

    console.log('nearest lines', nearestLines);


}


function getNearest(lineData) {
    let nearest = [];
    let currDate = new Date;

    $.each(lineData, function(k, v) {
        let departDate = new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate(), v.split(':')[0], v.split(':')[1]);

        if (currDate < departDate) {
            nearest.push(v);
            if (nearest.length >= 3) {
                return false;
            }
        }
    });

    return nearest
}


function orderLines(nearestLines) {
    let result = {};
    let nearest = {};
    let sortable = [];

    $.each(nearestLines, function(k, v) {
        nearest[k] = v[0]
    });

    $.each(nearest, function (k, v) {
        sortable.push([k, v]);
    });

    sortable.sort(function(a, b) {
        return parseInt(a[1].replace(':', '')) - parseInt(b[1].replace(':', ''))
    });

    $.each(sortable, function (k, v) {
        result[k] = {
            line: v[0],
            time: v[1]
        }
    });

    return result
}


function toMinutes(hour) {
    let currDate = new Date;
    let departDate = new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate(), v.split(':')[0], v.split(':')[1]);

    return Math.floor((currDate - departDate) / 1000 / 60)
}


function getWeatherForecast(temp, precip) {
    let d = new Date;
    let temperatures = [];
    let precipitation = [];
    let labels = [];

    $.each(temp, function (k, v) {
        temperatures.push(v);
        labels.push((k * 1 + d.getHours()) % 24)
    });

    $.each(precip, function (k, v) {
        precipitation.push(v);
    });

    let ctx = document.getElementById('myChart').getContext('2d');
    let myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'temp',
                data: temperatures,
                yAxisID: 'temp',
                borderWidth: 2,
                borderColor: 'rgb(255,255,255)',
                pointRadius: 0,
            }, {
                label: 'rain',
                data: precipitation,
                yAxisID: 'precip',
                borderColor: 'rgb(133,127,133)',
                fill: true,
                borderWidth: 2,
                pointRadius: 0,
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    // display: false,
                    id: 'temp',
                    type: 'linear',
                    position: 'left',
                    ticks: {
                        // min: -10,
                        // max: 30,
                        stepSize: 5,
                    }
                }, {
                    display: false,
                    id: 'precip',
                    type: 'linear',
                    position: 'right',
                    ticks: {
                        max: 1,
                        min: 0.02,
                        beginAtZero: true
                    }
                }]
            },
            legend: {
                display: false
            },
            // labels: {
            //     stepSize: 10,
            // }
        }
    });
}


function getDelay() {
    let currDate = new Date;
    let destDate = new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate() + 1, 0, 0);
    let difference = destDate - currDate;

    return difference / 60
}


document.addEventListener('DOMContentLoaded', function () {
    let publicTransportData;

    getPublicTransport().then(r => {publicTransportData = r; updatePublicTransport(r)});
    updateTime();
    getWeather();
    getCalendar();
    getCart();

    setTimeout(function () {
        setInterval(function () {
            publicTransportData = getPublicTransport(publicTransportData);
        }, 86400000)
    }, getDelay());

    setInterval(function () {
        updatePublicTransport(publicTransportData);
    }, 60000);

    setInterval(function () {
        updateTime();
    }, 60000);

    setInterval(function () {
        getWeather();
    }, 3600000);

    setInterval(function () {
        getCalendar();
    }, 3600000);

    setInterval(function () {
        getCart();
    }, 60000);
});
