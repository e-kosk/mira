document.addEventListener('DOMContentLoaded', function() {

    setTimeout(function () {
        let video = document.getElementById("videoInput"); // video is the id of video tag
        video.width = 640;
        video.height = 480;
        navigator.mediaDevices
            .getUserMedia({video: true, audio: false})
            .then(function (stream) {
                video.srcObject = stream;
                video.play();

                let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
                let dst = new cv.Mat(video.height, video.width, cv.CV_8UC1);
                let cap = new cv.VideoCapture(video);

                const FPS = 5;

                var canvas = document.getElementById('templateCanvas'),
                context = canvas.getContext('2d');

                make_base();

                function make_base()
                {
                    let base_image = new Image();
                    base_image.src = '/static/mira_app/js/hand.jpg';
                    base_image.onload = function(){
                        context.drawImage(base_image, 0, 0);
                    }
                }





                function processVideo() {

                    function abc(){
                        var method  =   cv.TM_CCORR_NORMED;

                        var source      =   dst.clone();
                        var template    =   cv.imread('templateCanvas',  1);
                        var m        =   source.clone();
                        var mask = new cv.Mat();
                        cv.cvtColor(m, mask, cv.COLOR_RGBA2GRAY);

                        let result_cols =   source.cols - template.cols + 1;
                        let result_rows =   source.rows - template.rows + 1;

                        var result      =   new cv.Mat(result_rows, result_rows, cv.CV_32FC1);

                        cv.matchTemplate(source, template, result, method, mask);

                        cv.normalize(result, result, 0, 1, cv.NORM_MINMAX, -1, new cv.Mat() );

                        let minMaxLoc   =   cv.minMaxLoc(result);

                        let matchLoc;

                        if(method == cv.TM_SQDIFF || method == cv.TM_SQDIFF_NORMED){
                            matchLoc    =   minMaxLoc.minLoc;
                        }else{
                            matchLoc    =   minMaxLoc.maxLoc;
                        }

                        let canvas  =   document.createElement("canvas");

                        var output  =   new cv.Mat();
                        source.copyTo(output);

                        let point1 = new cv.Point(matchLoc.x, matchLoc.y);
                        let point2 = new cv.Point(matchLoc.x + template.cols, matchLoc.y + template.rows);

                        let rectangleColor = new cv.Scalar(255, 0, 0);
                        cv.rectangle(output, point1, point2, rectangleColor, 2, cv.LINE_AA, 0);

                        cv.imshow(canvas, output);
                        document.body.appendChild(canvas);
                    }

                    abc();


                    try {
                        let begin = Date.now();

                        // start processing.
                        cap.read(src);
                        let rgba = src.clone();



                        let mask = new cv.Mat();
                        let templ = cv.imread('templateCanvas');
                        let res = new cv.Mat();
                        cv.imshow('templateShowCanvas', templ);

                        cv.matchTemplate(dst, templ, res, cv.TM_CCOEFF, res);
                        // let templMinMax = cv.minMaxLoc(res);
                        //
                        // cv.circle(rgba, templMinMax['maxLoc'], 10, [255, 70, 0, 255], 3);




                        // let dst2 = new cv.Mat();
                        // let mask = new cv.Mat();
                        // cv.matchTemplate(dst, templ, dst2, cv.TM_CCOEFF, mask);
                        // let result = cv.minMaxLoc(dst2, mask);
                        // let maxPoint = result.maxLoc;
                        // let color = new cv.Scalar(255, 0, 0, 255);
                        // let point = new cv.Point(maxPoint.x + templ.cols, maxPoint.y + templ.rows);
                        // cv.rectangle(src, maxPoint, point, color, 2, cv.LINE_8, 0);
                        // cv.imshow('templateMatchingResult', src);
                        // src.delete(); dst.delete(); mask.delete();




                        cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
                        let minMax = cv.minMaxLoc(dst);

                        cv.circle(rgba, minMax['minLoc'], 10, [255, 0, 0, 255], 3);

                        cv.imshow("canvasOutput", rgba);

                        // schedule the next one.
                        let delay = 1000 / FPS - (Date.now() - begin);
                        setTimeout(processVideo, delay);
                    } catch (err) {
                        console.error(err);
                    }
                }

                // schedule the first one.
                setTimeout(processVideo, 0);
            })
            .catch(function (err) {
                console.log("An error occurred! " + err);
            });
    }, 2000)


    // const video = document.getElementById("myvideo");
    // const canvas = document.getElementById("canvas");
    // const context = canvas.getContext("2d");
    // let trackButton = document.getElementById("trackbutton");
    // let updateNote = document.getElementById("updatenote");
    //
    // $('#trackbutton').on('click', function() {
    //     toggleVideo();
    // });
    //
    // let isVideo = false;
    // let model = null;
    //
    // const modelParams = {
    //     flipHorizontal: true,   // flip e.g for video
    //     maxNumBoxes: 1,        // maximum number of boxes to detect
    //     iouThreshold: 0.6,      // ioU threshold for non-max suppression
    //     scoreThreshold: 0.8,    // confidence threshold for predictions.
    // };
    //
    // function startVideo() {
    //     handTrack.startVideo(video).then(function (status) {
    //         console.log("video started", status);
    //         if (status) {
    //             updateNote.innerText = "Video started. Now tracking";
    //             isVideo = true;
    //             runDetection()
    //         } else {
    //             updateNote.innerText = "Please enable video"
    //         }
    //     });
    // }
    //
    // function toggleVideo() {
    //     if (!isVideo) {
    //         updateNote.innerText = "Starting video";
    //         startVideo();
    //     } else {
    //         updateNote.innerText = "Stopping video";
    //         handTrack.stopVideo(video);
    //         isVideo = false;
    //         updateNote.innerText = "Video stopped"
    //     }
    // }
    //
    // let started = false;
    // let loseTimeOut;
    //
    // function runDetection() {
    //     model.detect(video).then(predictions => {
    //         console.log("Predictions: ", predictions);
    //         try {
    //             if (predictions[0].bbox[0] < 150) {
    //                 if (!started) {
    //                     loseTimeOut = setTimeout(function () {
    //                         lose()
    //                     }, 3000);
    //                     startTry();
    //                 }
    //             } else if (predictions[0].bbox[0] > 300) {
    //                 if (started) {
    //                     win();
    //                     setTimeout(function () {
    //                         endTry();
    //                     }, 2000)
    //                 }
    //             }
    //         } catch(e) {
    //             console.log(e)
    //         }
    //         model.renderPredictions(predictions, canvas, context, video);
    //         if (isVideo) {
    //             requestAnimationFrame(runDetection);
    //         }
    //     });
    // }
    //
    // function startTry() {
    //     started = true;
    //     $('body').css('background-color', 'blue')
    // }
    //
    // function endTry() {
    //     started = false;
    //     clearTimeout(loseTimeOut);
    //     $('body').css('background-color', 'grey')
    // }
    //
    // function lose() {
    //     started = false;
    //     $('body').css('background-color', 'pink')
    // }
    //
    // function win() {
    //     started = false;
    //     $('body').css('background-color', 'green')
    // }
    //
    // // Load the model.
    // handTrack.load(modelParams).then(lmodel => {
    //     // detect objects in the image.
    //     model = lmodel;
    //     updateNote.innerText = "Loaded Model!";
    //     trackButton.disabled = false
    // });


});