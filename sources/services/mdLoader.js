import MarkdownIt from "markdown-it";
import markdownItAttrs from "markdown-it-attrs";
import markdownSpans from "markdown-it-bracketed-spans";

const md = new MarkdownIt({html: true}).use(markdownSpans).use(markdownItAttrs);

export default md;