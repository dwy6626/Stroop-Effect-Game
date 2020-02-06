const experimentText = ["RED", "GREEN", "BLUE"];
const displayContent = document.querySelector("div .experiment-texts");


// key mapping
const keyMap = {
    a: experimentText[0],
    s: experimentText[1],
    d: experimentText[2],
};


// global time record in frontend
let lastTimeStamp;


window.addEventListener("keydown", function (event) {
    if (event.defaultPrevented) {
        return; // Do nothing if the event was already processed
    }

    if (event.key in keyMap) getNext(event.key);
    else if (["Esc", "Escape"].includes(event.key)) window.location.href = '/';

    // Cancel the default action to avoid it being handled twice
    event.preventDefault();
}, true);


function getRandomInt(x){
    return Math.floor(Math.random()*x);
}


function getNext(keyIn) {
    const keyTime = Date.now();
    const prevText = displayContent.textContent;
    const prevColor = displayContent.style.color;

    // judgement
    if (lastTimeStamp) {
        // exclude 1st time
        if (keyMap[keyIn] === prevText) {
            console.log("pass");

        } else {
            console.log("fail");
        }

        // record time difference
        console.log(`TD: ${keyTime - lastTimeStamp}`);

        let httpRequest = new XMLHttpRequest();
        httpRequest.overrideMimeType('text/xml');
        httpRequest.open('POST', '/', true);
        httpRequest.setRequestHeader('Content-Type', 'text/plain');
        httpRequest.send(`${keyTime - lastTimeStamp}`);
    }

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
    } while (
        prevText === text || prevColor === color
    );

    // modify displayed text
    displayContent.textContent = text;
    displayContent.style.color = color;
    lastTimeStamp = Date.now();
}
