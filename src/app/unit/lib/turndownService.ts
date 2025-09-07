import TurndownService from "turndown";

const turndownService = new TurndownService({
  bulletListMarker: "-",
});
turndownService.addRule("diceEmoticon", {
  filter: (node) => {
    if (node.tagName === "IMG") {
      console.log("node", node, node.classList);
    }
    return node.tagName === "IMG" && node.classList.contains("emoticon");
  },
  replacement: function (content, node) {
    const ele = node as HTMLElement;
    return ele.getAttribute("alt") || "";
  },
});

export { turndownService };
