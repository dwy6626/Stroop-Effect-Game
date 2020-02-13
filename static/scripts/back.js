window.addEventListener("keydown", function (event) {
    if (event.defaultPrevented) return;
    if (["Esc", "Escape"].includes(event.key)) {
         window.location.href = '/';
        event.preventDefault();
    }
});
