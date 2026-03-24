function getSel() {
    const txtarea = document.getElementById("novel-content");
    const start = txtarea.selectionStart;
    const finish = txtarea.selectionEnd;
    const sel = txtarea.value.substring(start, finish);

    return { content: sel, initialIndex: start, finalIndex: finish };
}

document.querySelectorAll(".modifier-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        const { content, initialIndex, finalIndex } = getSel();
        if (!content) return;
        console.log(content, initialIndex, finalIndex);
    });
});