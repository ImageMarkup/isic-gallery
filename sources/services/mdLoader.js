import MarkdownIt from "markdown-it";
import markdownItAttrs from "markdown-it-attrs";
import markdownSpans from "markdown-it-bracketed-spans";
import markdownItContainers from "markdown-it-container";

const md = new MarkdownIt({html: true}).use(markdownSpans).use(markdownItAttrs).use(markdownItContainers, "card").use(markdownItContainers, "cards-container", {marker: "^"});

export default md;