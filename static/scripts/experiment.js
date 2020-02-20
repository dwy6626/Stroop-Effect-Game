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
    if (event.defaultPrevented) return;

    if (event.key in keyMap && !resultShown) {
        if (!started) {
            description.style.color = 'white';
            started = true;
            updateNext();
        } else updateExperiment(keyMap[event.key]);
    }
});


function addTable(contents, tableContent=false, conflictTexts=null) {
    let table = "";
    let i;
    for (i=0; i<maxTableContent; i++) {
        table += `<div class="pure-u-1-3" id="${i}">`;
        if (tableContent) {
            if (conflictTexts === null) {
                table += `<span class="block" style="background-color: ${contents[i].toLowerCase()}"> </span>`;
            } else {
                table += `<p style="color: ${contents[i].toLowerCase()}">${conflictTexts[i].toUpperCase()}</p>`;
            }
        }
        table += '</div>'
    }
    document.getElementById("exp-table").innerHTML = table;
    active = 0;
    if (tableContent) {
        document.getElementById(active).style.borderColor = 'black';
        sample = contents;
        lastTimeStamp = Date.now();
    }
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
    getSample.send();
    getSample.onreadystatechange = function () {
        if (getSample.readyState === XMLHttpRequest.DONE) {
            if (getSample.status === 200) {
                const res = JSON.parse(getSample.response);

                // check if the experiment is ended
                let conflictTexts = null;
                if (res['samples'] !== null) {
                    if (res['isConflict']) conflictTexts = res['conflictTexts'];
                    addTable(res['samples'], true, conflictTexts);
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
    getConfig.send();
    getConfig.onreadystatechange = function () {
        config = JSON.parse(getConfig.response);
    };
    addTable();
};


function clean() {
    description.style.color = 'black';
    if (config) description.textContent = config['Wording']['between_exp'];
    started = false;
    data = [];
    addTable();
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
