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

function wrapSelection(tagName) {
    const selection = window.getSelection();
    if(!selection.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    if(range.collapsed) return;

    const wrapper = document.createElement(tagName);

    try {
        range.surroundContents(wrapper);
    } catch (e) {
        console.error("Failed to wrap selection:", e);
    }
}

document.querySelector("#bold-btn").addEventListener("click", () => wrapSelection("strong"));
document.querySelector("#italic-btn").addEventListener("click", () => wrapSelection("em"));
document.querySelector("#underline-btn").addEventListener("click", () => wrapSelection("u"));
document.querySelector("#strike-btn").addEventListener("click", () => wrapSelection("s"));