import TurndownService from "turndown";

const turndownService = new TurndownService({
  bulletListMarker: "-",
});
turndownService.addRule("diceEmoticon", {
  filter: (node) => {
    return node.tagName === "IMG" && node.classList.contains("emoticon");
  },
  replacement: function (content, node) {
    const ele = node as HTMLElement;
    return ele.getAttribute("alt") || "";
  },
});

turndownService.addRule("doubleBr", {
  filter: (node) =>
    node.tagName === "BR" && node.classList.contains("double-br"),
  replacement: function (content, node) {
    return "\n\n";
  },
});

turndownService.addRule("singleBr", {
  filter: (node) =>
    node.tagName === "BR" && !node.classList.contains("double-br"),
  replacement: function (content, node) {
    return "";
  },
});

export { turndownService };
