const description = document.getElementById("text-before-exp");
const experimentColor = ["red", "green", "blue"];
const dataAPI = '/api/record';
const sampleAPI = '/api/sample';
const configAPI = '/api/config';


// keyboard mapping
const keyMap = {
    a: experimentColor[0],
    s: experimentColor[1],
    d: experimentColor[2],
};


// global variables
const maxTableContent = 9;
let lastTimeStamp;
let started = false;
let resultShown = false;
let config;
let active;
let sample;
let data = [];


window.addEventListener("keydown", function (event) {
    // TODO: prevent multiple keydown
    if (event.defaultPrevented) return;

    if (event.key in keyMap && !resultShown) {
        if (!started) {
            description.style.color = 'white';
            started = true;
            showSample();
        } else updateExperiment(keyMap[event.key]);
    }
});


function addTable(contents, conflictTexts=null) {
    let table = "";
    for (let i = 0; i < maxTableContent; i++) {
        table += `<div class="pure-u-1-3" id="${i}">`;
        if (conflictTexts === null) {
            table += `<span class="block" id="sample" style="background-color: ${contents[i].toLowerCase()}; visibility: hidden;"> </span>`;
        } else {
            table += `<p id="sample" style="color: ${contents[i].toLowerCase()}; visibility: hidden;">${conflictTexts[i].toUpperCase()}</p>`;
        }
        table += '</div>'
    }
    document.getElementById("exp-table").innerHTML = table;
    sample = contents;
}


function updateBorder() {
    document.getElementById(active).style.borderColor = 'lightgray';
    active += 1;
    document.getElementById(active).style.borderColor = 'black';
}


function updateExperiment (inp) {
    const keyTime = Date.now();
    const timeDifference = keyTime - lastTimeStamp;
    const ans = sample[active].toLowerCase();
    if (inp === ans) {
        console.log(`correct, time: ${timeDifference}`);
        data.push(['correct', timeDifference]);
        if (active < maxTableContent-1) {
            updateBorder();
        } else {
            let sendData = new XMLHttpRequest();
            sendData.open('POST', dataAPI, true);
            sendData.send(JSON.stringify(data));
            clean();
        }
        lastTimeStamp = Date.now();
    } else {
        data.push(['wrong', timeDifference]);
        console.log('wrong');
    }
}


function updateNext () {
    let getSample = new XMLHttpRequest();
    getSample.open('GET', sampleAPI, true);
    getSample.responseType = 'json';
    getSample.send();
    getSample.onreadystatechange = function () {
        if (getSample.readyState === XMLHttpRequest.DONE) {
            if (getSample.status === 200) {
                const res = getSample.response;

                // check if the experiment is ended
                let conflictTexts = null;
                if (res['samples'] !== null) {
                    if (res['isConflict']) conflictTexts = res['conflictTexts'];
                    addTable(res['samples'], conflictTexts);
                } else showResult();

            } else {
                alert('There was a problem with the request, please reload the page.');
            }
        }
    };
}


window.onload = function () {
    let getConfig = new XMLHttpRequest();
    getConfig.open('GET', configAPI, true);
    getConfig.responseType = 'json';
    getConfig.send();
    getConfig.onreadystatechange = function () {
        config = getConfig.response;
    };
    updateNext();
};


function clean() {
    description.style.color = 'black';
    if (config) description.textContent = config['Wording']['between_exp'];
    started = false;
    data = [];
    updateNext();
}


function showResult() {
    resultShown = true;
    let httpRequest = new XMLHttpRequest();
    httpRequest.overrideMimeType('text/xml');
    httpRequest.open('POST', '/api/results', true);
    httpRequest.setRequestHeader('Content-Type', 'text/plain');
    httpRequest.send(window.location.pathname);
    httpRequest.onreadystatechange = function () {
        document.body.innerHTML = httpRequest.response
    };
}


function showSample() {
    document.querySelectorAll("#sample").forEach(
        x => x.style.visibility = 'visible'
    );
    active = 0;
    document.getElementById(0).style.borderColor = 'black';
    lastTimeStamp = Date.now();
}
