const scrollAmout = 300;

let chatSocket = new WebSocket(
    `ws://${window.location.host}/ws/gestures/`
);

chatSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    const message = data.message;
    console.log(message);

    if (message === 'down') {
        scrollDown();
    } else if (message === 'up') {
        scrollUp();
    }
};

chatSocket.onclose = function(e) {
    console.error('Chat socket closed unexpectedly');
};

function scrollDown() {
    window.scrollBy(0, -scrollAmout);
}

function scrollUp() {
    window.scrollBy(0, scrollAmout);
}
