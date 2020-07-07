document.addEventListener('DOMContentLoaded', function() {
    let timeOut = 1000;
    let lastTime;

    const modelParams = {
        flipHorizontal: true,
        imageScaleFactor: 0.7,
        maxNumBoxes: 1,
        iouThreshold: 0.5,
        scoreThreshold: 0.7,
    }



    navigator.getUserMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia;


    //select everything in my html
    const video = document.querySelector('#video');
    const canvas = document.querySelector('#car');
    const context = canvas.getContext('2d');
    let model;

    handTrack.startVideo(video)
        .then(status => {
            if(status){
                navigator.getUserMedia({video: {}}, stream => {
                    video.srcObject = stream;
                    // timer = setInterval(runDetection, timeOut);
                    createTimer();
                },
                    err => console.log(err)
                );
            }
        });

    function runDetection(){
        model.detect(video)
            .then(predictions => {
                if(predictions.length > 0){
                    console.log(predictions[0].bbox);
                    timeOut = 100;
                    console.log(timeOut);
                } else {
                    timeOut = 1000;
                    console.log(timeOut);
                }

                // if (timeOut !== 200)
                model.renderPredictions(predictions, canvas, context, video);
            });
    }

    function createTimer() {
        setTimeout(function() {
            runDetection();
            createTimer();
        }, timeOut)
    }

    handTrack.load(modelParams).then(lmodel => {
        model = lmodel;
    });
});
