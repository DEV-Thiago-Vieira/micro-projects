const novelContent = document.getElementById("novel-content");
const wordCountEl = document.getElementById("word-count");
const charCountEl = document.getElementById("char-count");
const paragraphCountEl = document.getElementById("paragraph-count");

novelContent.addEventListener("input", () => {
  if (
    novelContent.innerHTML.trim() === "" ||
    novelContent.innerHTML === "<br>"
  ) {
    novelContent.innerHTML = "";
  }

  updateCounters();
});

function updateCounters() {
  const text = novelContent.innerText || "";

  const charCount = text.length;
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const paragraphCount = text.split(/\n+/).filter(Boolean).length;

  wordCountEl.textContent = wordCount;
  charCountEl.textContent = charCount;
  paragraphCountEl.textContent = paragraphCount;
}

function toggleWrap(tagName) {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  if (range.collapsed) return;

  const node = range.commonAncestorContainer;
  const formattedParent = findClosestTag(node, tagName);

  if (formattedParent) {
    partialUnwrap(formattedParent, range);
    return;
  }

  const ancestor = node.nodeType === 1 ? node : node.parentNode;
  const innerFormatted = Array.from(ancestor.querySelectorAll(tagName)).filter(
    (el) => range.intersectsNode(el),
  );

  if (innerFormatted.length === 0) {
    wrap(range, tagName);
    return;
  }

  const startMarker = document.createElement("span");
  const endMarker = document.createElement("span");

  const endR = document.createRange();
  endR.setStart(range.endContainer, range.endOffset);
  endR.collapse(true);
  endR.insertNode(endMarker);

  const startR = document.createRange();
  startR.setStart(range.startContainer, range.startOffset);
  startR.collapse(true);
  startR.insertNode(startMarker);

  innerFormatted.forEach((el) => {
    const p = el.parentNode;
    while (el.firstChild) p.insertBefore(el.firstChild, el);
    p.removeChild(el);
  });

  const newRange = document.createRange();
  newRange.setStartAfter(startMarker);
  newRange.setEndBefore(endMarker);
  startMarker.remove();
  endMarker.remove();

  selection.removeAllRanges();
  selection.addRange(newRange);

  wrap(newRange, tagName);
}

function findClosestTag(node, tagName) {
  while (node && node !== document) {
    if (node.nodeType === 1 && node.nodeName.toLowerCase() === tagName) {
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
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);

  const startMarker = document.createTextNode("");
  const endMarker = document.createTextNode("");

  range.insertNode(startMarker);
  range.collapse(false);
  range.insertNode(endMarker);

  const parent = element.parentNode;

  while (element.firstChild) {
    parent.insertBefore(element.firstChild, element);
  }

  parent.removeChild(element);

  const newRange = document.createRange();
  newRange.setStartAfter(startMarker);
  newRange.setEndBefore(endMarker);

  selection.removeAllRanges();
  selection.addRange(newRange);

  startMarker.remove();
  endMarker.remove();
}

function partialUnwrap(formattedParent, selRange) {
  const tag = formattedParent.nodeName.toLowerCase();
  const parent = formattedParent.parentNode;

  const getElemRange = () => {
    const r = document.createRange();
    r.selectNodeContents(formattedParent);
    return r;
  };

  const elemRange = getElemRange();
  const startIsAtBeginning =
    selRange.compareBoundaryPoints(Range.START_TO_START, elemRange) <= 0;
  const endIsAtEnd =
    selRange.compareBoundaryPoints(Range.END_TO_END, elemRange) >= 0;

  if (startIsAtBeginning && endIsAtEnd) {
    unwrap(formattedParent);
    return;
  }

  const startMarker = document.createElement("span");
  const endMarker = document.createElement("span");

  const endInsert = document.createRange();
  endInsert.setStart(selRange.endContainer, selRange.endOffset);
  endInsert.collapse(true);
  endInsert.insertNode(endMarker);

  const startInsert = document.createRange();
  startInsert.setStart(selRange.startContainer, selRange.startOffset);
  startInsert.collapse(true);
  startInsert.insertNode(startMarker);

  let afterEl = null;
  if (!endIsAtEnd) {
    const er = getElemRange();
    const r = document.createRange();
    r.setStartAfter(endMarker);
    r.setEnd(er.endContainer, er.endOffset);
    const frag = r.extractContents();
    if (frag.childNodes.length > 0) {
      afterEl = document.createElement(tag);
      afterEl.appendChild(frag);
    }
  }

  let beforeEl = null;
  if (!startIsAtBeginning) {
    const er = getElemRange();
    const r = document.createRange();
    r.setStart(er.startContainer, er.startOffset);
    r.setEndBefore(startMarker);
    const frag = r.extractContents();
    if (frag.childNodes.length > 0) {
      beforeEl = document.createElement(tag);
      beforeEl.appendChild(frag);
    }
  }

  if (startMarker.parentNode) startMarker.parentNode.removeChild(startMarker);
  if (endMarker.parentNode) endMarker.parentNode.removeChild(endMarker);

  if (beforeEl) parent.insertBefore(beforeEl, formattedParent);
  while (formattedParent.firstChild) {
    parent.insertBefore(formattedParent.firstChild, formattedParent);
  }
  if (afterEl) parent.insertBefore(afterEl, formattedParent);
  parent.removeChild(formattedParent);
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

const clearBtn = document.querySelector("#clear-btn");
if (clearBtn) {
  clearBtn.addEventListener("mousedown", (e) => {
    e.preventDefault();
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    if (range.collapsed) return;

    const FORMAT_TAGS = ["strong", "em", "u", "s", "b", "i"];
    const ancestor = range.commonAncestorContainer;
    const container = ancestor.nodeType === 1 ? ancestor : ancestor.parentNode;

    FORMAT_TAGS.forEach((tag) => {
      Array.from(container.querySelectorAll(tag))
        .filter((el) => range.intersectsNode(el))
        .forEach((el) => {
          const p = el.parentNode;
          while (el.firstChild) p.insertBefore(el.firstChild, el);
          p.removeChild(el);
        });

      const parent = findClosestTag(range.commonAncestorContainer, tag);
      if (parent) partialUnwrap(parent, range);
    });
  });
}
