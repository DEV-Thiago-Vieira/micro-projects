const novelContent = document.getElementById("novel-content");

novelContent.addEventListener("input", () => {
    if(novelContent.innerHTML.trim() === "" || novelContent.innerHTML === "<br>") {
        novelContent.innerHTML = "";
    }
});

function getSel() {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const sel = range.toString();

    return { content: sel, initialIndex: range.startOffset, finalIndex: range.endOffset };
}

document.querySelectorAll(".modifier-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        const { content, initialIndex, finalIndex } = getSel();
        if (!content) return;
        console.log(content, initialIndex, finalIndex);
    });
});