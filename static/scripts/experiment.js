const experimentText = ["RED", "GREEN", "BLUE"];
const displayContent = document.querySelector("div .experiment-texts");
const dataAPI = '/api/record';
const configAPI = '/api/config';


// key mapping
const keyMap = {
    a: experimentText[0],
    s: experimentText[1],
    d: experimentText[2],
};


// global variables
let lastTimeStamp;
let countConflict = 0;
let countNormal = 0;
let maxShow = 10;  // temperate values, will be modified from backend


window.addEventListener("keydown", function (event) {
    if (event.defaultPrevented) {
        return; // Do nothing if the event was already processed
    }

    if (event.key in keyMap) updateExperiment(event.key);
    else if (["Esc", "Escape"].includes(event.key)) window.location.href = '/';

    // Cancel the default action to avoid it being handled twice
    event.preventDefault();
}, true);


function getRandomInt(x){
    return Math.floor(Math.random()*x);
}


function updateExperiment (keyIn) {
    const keyTime = Date.now();
    const prevText = displayContent.textContent;

    // judgement
    if (keyMap[keyIn] === prevText) {
        console.log("pass");

    } else {
        console.log("fail");
    }

    // record time difference
    console.log(`TD: ${keyTime - lastTimeStamp}`);

    let httpRequest = new XMLHttpRequest();
    httpRequest.overrideMimeType('text/xml');
    httpRequest.open('POST', dataAPI, true);
    httpRequest.setRequestHeader('Content-Type', 'text/plain');
    httpRequest.send(`${keyTime - lastTimeStamp}`);

    // update displayed text
    updateNext();
}


function updateNext () {
    // break?
    const prevText = displayContent.textContent;

    // conflict or normal
    let conflict;
    if (countConflict < maxShow / 2) {
        if (countNormal < maxShow / 2) {
            conflict = getRandomInt(2) === 1;
        } else {
            conflict = true;
        }
    } else if (countNormal < maxShow / 2) {
        conflict = false;
    } else {
        showResult();
        return;
    }

    if (conflict) {
        countConflict ++;
        const prevColor = displayContent.style.color;

        // conflict text
        let text, color;
        do {
            let x1 = 0, x2 = 0;
            do {
                x1 = getRandomInt(3);
                x2 = getRandomInt(3);
            } while (x1 === x2);

            text = experimentText[x1];
            color = experimentText[x2].toLowerCase();
        } while (prevText === text || prevColor === color);

        // modify displayed text
        displayContent.textContent = text;
        displayContent.style.color = color;
    } else {
        countNormal ++;

        // change text
        let text, x;
        do {
            x = getRandomInt(3);
            text = experimentText[x];
        } while (prevText === text);

        // modify displayed text
        displayContent.textContent = text;
        displayContent.style.color = 'white';
    }

    lastTimeStamp = Date.now();
}


window.onload = function () {
    let httpRequest = new XMLHttpRequest();
    httpRequest.overrideMimeType('text/xml');
    httpRequest.open('POST', configAPI, true);
    httpRequest.setRequestHeader('Content-Type', 'text/plain');
    httpRequest.onreadystatechange = alertContents;
    httpRequest.send(document.location.pathname);

    function alertContents() {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                maxShow = parseInt(httpRequest.responseText, 10)
            } else {
                alert('There was a problem with the request, please reload the page.');
            }
        }
    }
    updateNext();
};


function showResult() {
    window.location.href = '/results';
}
