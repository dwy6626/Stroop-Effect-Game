const experimentText = ["RED", "GREEN", "BLUE"];
const displayContent = document.querySelector("div .experiment-texts");
const dataAPI = '/api/record';
const configAPI = '/api/config';


// global variables
let lastTimeStamp;
let countConflict = 0;
let countNormal = 0;
let started = false;

// temperate values, will be modified from backend
let maxShow = 10;


document.querySelector("span.circle.red").addEventListener("click", function () {
    updateExperiment(experimentText[0])
});


document.querySelector("span.circle.green").addEventListener("click", function () {
    updateExperiment(experimentText[1])
});


document.querySelector("span.circle.blue").addEventListener("click", function () {
    updateExperiment(experimentText[2])
});


function getRandomInt(x){
    return Math.floor(Math.random()*x);
}


function updateExperiment (key) {
    if (!started) {
        started = true;
        document.querySelector("div.block-over").textContent = ""
    } else {
        const keyTime = Date.now();
        const prevText = displayContent.textContent;
        const timeDifference = keyTime - lastTimeStamp;

        // judgement
        if (key === prevText) {
            console.log("pass");

        } else {
            // test until success
            console.log("fail");
            return
        }

        // record time difference
        console.log(`TD: ${timeDifference}`);

        let httpRequest = new XMLHttpRequest();
        httpRequest.overrideMimeType('text/xml');
        httpRequest.open('POST', dataAPI, true);
        httpRequest.setRequestHeader('Content-Type', 'text/plain');
        httpRequest.send(`${displayContent.style.color} ${timeDifference}`);
    }
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
    httpRequest.open('GET', configAPI, true);
    httpRequest.setRequestHeader('Content-Type', 'text/plain');
    httpRequest.onreadystatechange = alertContents;
    httpRequest.send(document.location.pathname);

    function alertContents() {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                const res = JSON.parse(httpRequest.response);
                maxShow = parseInt(
                    res[document.location.pathname.substr(1)], 10
                );
            } else {
                alert('There was a problem with the request, please reload the page.');
            }
        }
    }
};


function showResult() {
    let httpRequest = new XMLHttpRequest();
    httpRequest.overrideMimeType('text/xml');
    httpRequest.open('POST', '/api/results', true);
    httpRequest.setRequestHeader('Content-Type', 'text/plain');
    httpRequest.send(window.location.pathname);
    httpRequest.onreadystatechange = function () {
        document.body.innerHTML = httpRequest.response
    };
}
