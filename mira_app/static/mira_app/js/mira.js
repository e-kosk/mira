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


function getPublicTransport() {
    let lines = ['139', '139r', '182', '159', '52'];
    lines = ['139', '182'];

    let res = {};

    $.each(lines, function (k, v) {
        getTD(v).then(x => res[v] = x);
    });

    return res
}


async function getTD(line) {
    return $.ajax({
        url: `public_transport/${line}/`,
        type: 'GET',
    });
}


function updatePublicTransport() {

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
                // backgroundColor: 'rgba(255, 99, 132, 1)',
                yAxisID: 'temp',
                borderWidth: 2,
                // borderColor: 'rgba(255, 99, 132, 1)',
                borderColor: 'rgb(255,255,255)',
                // borderColor: function(context) {
                //     var index = context.dataIndex;
                //     var value = context.dataset.data[index];
                //     console.log(index);
                //     console.log(value);
                //     console.log(value > 7 ? 'green' : 'red');
                //     return value > 7 ? 'green' : 'red';
                // },
                // fill: false,
                pointRadius: 0,
                // stepSize: 5,
            }, {
                label: 'rain',
                data: precipitation,
                yAxisID: 'precip',
                // backgroundColor: 'rgb(133,127,133)',
                // borderColor: 'rgb(128,212,255)',
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
            labels: {
                stepSize: 10,
            }
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
    let publicTransportData = getPublicTransport();

    updateTime();
    getWeather();
    getCalendar();
    getCart();

    setTimeout(function () {
        console.log('p', publicTransportData);
    }, 3000);

    setTimeout(function () {
        setInterval(function () {
            publicTransportData = getPublicTransport();
        }, 86400000)
    }, getDelay());

    setInterval(function () {
        updatePublicTransport();
    }, 60000);

    setInterval(function () {
        updateTime();
    }, 60000);

    // setInterval(function () {
    //     getWeather();
    // }, 3600000);

    // setInterval(function () {
    //     getCalendar();
    // }, 3600000);

    setInterval(function () {
        getCart();
    }, 60000);

    // setInterval(function () {
    //     getPublicTransport();
    // }, 60000);

});
