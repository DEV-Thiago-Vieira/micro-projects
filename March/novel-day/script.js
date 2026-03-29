const novelContent = document.getElementById("novel-content");

novelContent.addEventListener("input", () => {
    if (
        novelContent.innerHTML.trim() === "" ||
        novelContent.innerHTML === "<br>"
    ) {
        novelContent.innerHTML = "";
    }
});

function toggleWrap(tagName) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) return;

    const node = selection.anchorNode;

    const formattedParent = findClosestTag(node, tagName);

    if (formattedParent) {
        unwrap(formattedParent);
    } else {
        wrap(range, tagName);
    }
}

function findClosestTag(node, tagName) {
    while (node && node !== document) {
        if (
            node.nodeType === 1 &&
            node.nodeName.toLowerCase() === tagName
        ) {
            return node;
        }
        node = node.parentNode;
    }
    return null;
}

function wrap(range, tagName) {
    const wrapper = document.createElement(tagName);
    const content = range.extractContents();

    wrapper.appendChild(content);
    range.insertNode(wrapper);

    const selection = window.getSelection();
    selection.removeAllRanges();

    const newRange = document.createRange();
    newRange.selectNodeContents(wrapper);
    selection.addRange(newRange);
}

function unwrap(element) {
    const parent = element.parentNode;

    while (element.firstChild) {
        parent.insertBefore(element.firstChild, element);
    }

    parent.removeChild(element);
}

function bindButton(id, tag) {
    const btn = document.querySelector(id);
    if (!btn) return;

    btn.addEventListener("mousedown", (e) => {
        e.preventDefault();
        toggleWrap(tag);
    });
}

bindButton("#bold-btn", "strong");
bindButton("#italic-btn", "em");
bindButton("#underline-btn", "u");
bindButton("#strikethrough-btn", "s");