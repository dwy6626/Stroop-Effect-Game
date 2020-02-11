window.addEventListener("keydown", function (event) {
    if (event.defaultPrevented) {
        return; // Do nothing if the event was already processed
    }

    // if (event.key in keyMap) updateExperiment(event.key);
    if (["Esc", "Escape"].includes(event.key)) window.location.href = '/';

    // Cancel the default action to avoid it being handled twice
    event.preventDefault();
});
