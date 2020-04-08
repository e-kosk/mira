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

        $('#weather-value').text(current_temp.split('.')[0] === '-0' ? "0" : current_temp.split('.')[0]);
        // $('#weather-icon').removeClass().addClass('wi').addClass('weather-icon').addClass(weatherTranslates[current_icon]);
        $('#weather-icon img').attr('src', `../static/mira_app/gif/${r.currently.icon}.gif`);

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
    let eventsList = $('#events ul');

    $.ajax({
        url: 'calendar/',
        method: 'get',
    }).done(function (r) {
        eventsList.html('');
        $.each(r.events, function (k, v) {
            let d = new Date(v.start);
            e.push({'Date': new Date(d.getFullYear(), d.getMonth(), d.getDate()), 'Title': v.title},);
            showEvent(v.title, v.description, new Date(d.getFullYear(), d.getMonth(), d.getDate()))
        });
        const settings = {
            Color: '#ffffff',
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
        $(element).html('');
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

        if (Object.keys(r.needed).length > 0) {
            $.each(r.needed, function (k, v) {
                let li = $('<li>');
                let span_name = $('<span>');
                let span_quantity = $('<span class="cart-quantity bold grey right">');

                span_name.text(k);
                span_quantity.text(v);

                li.append(span_name);
                // li.append(span_quantity);
                cart.append(li);
            });
        } else {
            $('#cart-container').text('No data to display.');
        }
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

        if (nearest.length !== 0) {
            nearestTimes[k] = nearest
        }
    });

    let nearestLines = orderLines(nearestTimes);

    displayPublicTransport(nearestLines)
}


function displayPublicTransport(transportData) {
    let transportContainer = $('#public-transport-container');
    transportContainer.html('');

    $.each(transportData, function (k, v) {
        let table = createTable(v);
        transportContainer.append(table);
    });

    if (transportContainer.html() === '') {
        transportContainer.text('No data to display.')
    }
}


function createTable(data) {
    let table = $('<table>').addClass('public-transport');

    table.append($('<tr>').append($('<td>').addClass('transport-type').attr('rowspan', 3).text(linesDestinations[data.line].type)).append($('<td>').addClass('line-number').addClass('bold').text(data.line[data.line.length - 1] === 'r' ? data.line.substring(0, 3) : data.line)).append($('<td>').addClass('transport-destination').text(linesDestinations[data.line].final)));
    table.append($('<tr>').append($('<td>').addClass('transport-hour').attr('colspan', 2).append($('<canvas>').addClass('transport-line').attr('width', 300).attr('height', 50))));
    table.append($('<tr>').append($('<td>').addClass('transport-next').attr('colspan', 2).text(toMinutes(data.times).join(' , '))));

    let ctx = table.find('canvas')[0];

    drawLine(ctx, data);

    return table
}


function drawLine(canvas, data) {
    let ctx = canvas.getContext('2d');
    let radius = 4;
    let place1 = 60;
    let place2 = 240;
    let y = 25;
    let textY = 15;
    let destY = 45;
    let textOffset = 14;
    let letterWidth = 6;

    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(300, y);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(place1, y, radius, 0, 2 * Math.PI);
    ctx.arc(place2, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.font = '10pt MyriadLight';
    ctx.fillText(data.nearest, place1 - textOffset, textY);
    ctx.fillText(addTime(data.nearest, linesDestinations[data.line].estTime), place2 - textOffset, textY);
    ctx.fillText(linesDestinations[data.line].home, place1 - linesDestinations[data.line].home.length * letterWidth / 2, destY);
    ctx.fillText(linesDestinations[data.line].dest, place2 - linesDestinations[data.line].dest.length * letterWidth / 2, destY);
}


function addTime(time, duration) {
    let h = parseInt(time.split(':')[0]);
    let m = parseInt(time.split(':')[1]);

    if (m + duration > 59) {
        m = "0" + (m + duration - 60);
        h++;
    } else {
        m += duration;
        m = "0" + m;
    }

    return `${h}:${m.slice(-2)}`
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


function orderLines(nearestTines) {
    let result = {};
    let nearest = {};
    let sortable = [];

    $.each(nearestTines, function(k, v) {
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
            nearest: v[1],
            times: nearestTines[v[0]]
        }
    });

    return result
}


function toMinutes(hoursList) {
    let minutesList = [];
    let currDate = new Date;

    $.each(hoursList, function(k, v) {
        let departDate = new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate(), v.split(':')[0], v.split(':')[1]);
        let minutes = Math.floor((departDate - currDate) / 1000 / 60);

        if (minutes < 60 && 1 <= minutes) {
            minutes = minutes + 'm';
        } else if (minutes < 1) {
            minutes = '<1m';
        }else {
            minutes = Math.floor(minutes/60) + 'h ' + minutes%60 + 'm';
        }

        minutesList.push(minutes)
    });

    return minutesList
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


function showQR() {
    let div = $('#qr');
    let url = div.text();
    div.text('');

    let size = 100;
    new QRCode("qr", {
        text: url,
        width: size,
        height: size,
        colorDark : "#323232",
        // colorDark : "#000000",
        // colorLight : "#ffffff",
        colorLight : "#000000",
        correctLevel : QRCode.CorrectLevel.M
    });
}


function mark_no_data(el) {
    $(el).html()
}


document.addEventListener('DOMContentLoaded', function () {
    let publicTransportData;

    getPublicTransport().then(r => {publicTransportData = r; updatePublicTransport(r)});
    updateTime();
    getWeather();
    getCalendar();
    getCart();
    showQR();

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
