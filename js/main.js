(function () {
    'use strict';

    /* globals MediaRecorder */

    document.getElementById('start').addEventListener('click', function () {
        startVideo();
    });
    document.getElementById('stop').addEventListener('click', function () {
        stopVideo();
    });
    const downloadButton = document.querySelector('button#download');
    downloadButton.addEventListener('click', () => {
        const blob = new Blob(recordedBlobs, {type: 'video/webm'});
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'Test-video.webm';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
    });

    const constraints = {
        video: true
    };
    const mediaSource = new MediaSource();
    mediaSource.addEventListener('sourceopen', handleSourceOpen, false);
    let mediaRecorder;
    let recordedBlobs;
    let sourceBuffer;

    const video = document.querySelector('video');
    function startRecording() {
        recordedBlobs = [];
        let options = {mimeType: 'video/webm;codecs=vp9'};
        try {
            mediaRecorder = new MediaRecorder(window.stream, options);
            /*var signal  = new SignalingChannel();*/
        } catch (e) {
            console.error('Exception while creating MediaRecorder:', e);
            return;
        }
        console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
        mediaRecorder.ondataavailable = handleDataAvailable;
        mediaRecorder.start(10); // collect 10ms of data
        console.log('MediaRecorder started', mediaRecorder);
    }
    function blobToDataURL(blob, callback) {
        var a = new FileReader();
        a.onload = function(e) {callback(e.target.result);};
        a.readAsDataURL(blob);
    }
    function handleDataAvailable(event) {
        if (event.data && event.data.size > 0) {
            console.log(event.data);
            blobToDataURL(event.data,function (data) {
                //console.log(data);
            });
            recordedBlobs.push(event.data);
        }
    }
    function handleSourceOpen(event) {
        console.log('MediaSource opened');
        sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
        console.log('Source buffer: ', sourceBuffer);
    }
    function startVideo() {
        function hasUserGotMedia() {
            return !!(navigator.mediaDevices &&
                navigator.mediaDevices.getUserMedia);
        }
        if(hasUserGotMedia()){
            navigator.mediaDevices.getUserMedia(constraints).
            then((stream) => {
                console.log(stream);
                video.srcObject = stream;
                window.stream = stream;
                startRecording();
            }).catch((error)=>{
                alert('error');
            });
        }else{
            alert('no userGotMedia');
        }
    }
    function stopVideo() {
        function hasUserGotMedia() {
            return !!(navigator.mediaDevices &&
                navigator.mediaDevices.getUserMedia);
        }
        if(hasUserGotMedia()){
            navigator.mediaDevices.getUserMedia(constraints).
            then((stream) => {
                console.log(stream);
                video.srcObject = stream;
                stream.getVideoTracks()[0].stop();
                mediaRecorder.stop();
            }).catch((error)=>{
                alert('error');
            });
        }else{
            alert('no userGotMedia');
        }
    }
})();