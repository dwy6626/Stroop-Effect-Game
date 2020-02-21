const description = document.getElementById("text-before-exp");
const experimentColor = ["red", "green", "blue"];
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


{
    const keyInterval = 50;
    let lastKeyTime = Date.now();
    let pressedKeys = {};


    window.addEventListener("keydown", function (event) {
        if (event.defaultPrevented) return;

        if (event.key in keyMap) {
            pressedKeys[event.key] = true;
            let thisKeyTime = Date.now();
            if (!resultShown && keyUniq() && thisKeyTime - lastKeyTime > keyInterval) {
                if (!started) {
                    description.style.color = 'white';
                    started = true;
                    showSample();
                } else updateExperiment(keyMap[event.key]);
            }
            lastKeyTime = thisKeyTime;
        }
    });


    window.addEventListener("keyup", function (event) {
        if (event.key in pressedKeys) pressedKeys[event.key] = false;
    });


    function keyUniq() {
        let down = 0;

        function checkDown(x) {
            if (pressedKeys[x]) down++;
        }

        Object.keys(keyMap).forEach(checkDown);
        return down === 1;
    }
}

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
        if (active < maxTableContent-1) updateBorder();
        else updateNext ();
        lastTimeStamp = Date.now();
    } else {
        data.push(['wrong', timeDifference]);
        console.log('wrong');
    }
}


function updateNext () {
    let getSample = new XMLHttpRequest();
    getSample.open('POST', sampleAPI, true);
    getSample.responseType = 'json';
    getSample.send(JSON.stringify(data));
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
    description.style.color = 'black';
    if (config) description.textContent = config['Wording']['between_exp'];
    started = false;
    data = [];
}


function showSample() {
    document.querySelectorAll("#sample").forEach(
        x => x.style.visibility = 'visible'
    );
    active = 0;
    document.getElementById(0).style.borderColor = 'black';
    lastTimeStamp = Date.now();
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


function showResult() {
    resultShown = true;
    let httpRequest = new XMLHttpRequest();
    httpRequest.overrideMimeType('text/xml');
    httpRequest.open('POST', '/api/results', true);
    httpRequest.setRequestHeader('Content-Type', 'text/plain');
    httpRequest.send(window.location.pathname);
    httpRequest.onreadystatechange = function () {
        document.body.innerHTML = httpRequest.response;
        let getImage = new XMLHttpRequest();
        getImage.open('GET', configAPI, true);
        getImage.responseType = 'document';
        getImage.send();
        getImage.onreadystatechange = function () {
            if (getImage.readyState === XMLHttpRequest.DONE) {
                if (getImage.status === 200) {
                    document.getElementById('image-show').innerHTML = '<img src="/results.png" alt="results">'
                }
            }
        };
    };


}