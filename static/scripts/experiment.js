const experimentColor = ["red", "green", "blue"];
const dataAPI = '/api/record';
const sampleAPI = '/api/sample';


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
let active;
let sample;
let data = [];


window.addEventListener("keydown", function (event) {
    if (event.defaultPrevented) return;

    if (event.key in keyMap && !resultShown) {
        if (!started) {
            document.getElementById("text-before-exp").style.color = 'white';
            started = true;
            updateNext();
        } else updateExperiment(keyMap[event.key]);
    }
});


function addTable(contents, tableContent='None') {
    let table = "";
    let i;
    for (i=0; i<maxTableContent; i++) {
        table += `<div class="pure-u-1-3" id="${i}">`;
        if (tableContent === 'Block')
            table += `<span class="block" style="background-color: ${contents[i].toLowerCase()}"> </span>`;
        else if (tableContent === 'Text') table += `<p>${contents[i].toUpperCase()}</p>`;
        table += '</div>'
    }
    document.getElementById("exp-table").innerHTML = table;
    active = 0;
    if (tableContent !== 'None') {
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
            updateNext();
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
                console.log(res);

                // check if the experiment is ended
                if (res['isConflict'] !== null) {
                    const testType = (res['isConflict'] ? 'Text' : 'Block');
                    addTable(res['samples'], testType);
                } else {
                    showResult()
                }


            } else {
                alert('There was a problem with the request, please reload the page.');
            }
            console.log(data);
            data = [];
        }
    };
}


window.onload = addTable;


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
