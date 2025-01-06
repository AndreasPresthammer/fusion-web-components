import { css, type CSSResult, html, LitElement, type TemplateResult } from 'lit';
import { property, query, queryAsync } from 'lit/decorators.js';
import { MarkdownViewerElementProps } from './types';
import {defaultMarkdownParser, MarkdownParser} from 'prosemirror-markdown';
import { EditorView } from 'prosemirror-view';
import { EditorState } from 'prosemirror-state';


// const customMarkdownParser = new MarkdownParser(defaultMarkdownParser.schema, schema, defaultMarkdownParser.tokenizer, {
//   blockquote: {block: "blockquote"},
//   paragraph: {block: "paragraph"},
//   list_item: {block: "list_item"},
//   bullet_list: {block: "bullet_list", getAttrs: (_, tokens, i) => ({tight: listIsTight(tokens, i)})},
//   ordered_list: {block: "ordered_list", getAttrs: (tok, tokens, i) => ({
//       order: +tok.attrGet("start")! || 1,
//       tight: listIsTight(tokens, i)
//     })},
//   heading: {block: "heading", getAttrs: tok => ({level: +tok.tag.slice(1)})},
//   code_block: {block: "code_block", noCloseToken: true},
//   fence: {block: "code_block", getAttrs: tok => ({params: tok.info || ""}), noCloseToken: true},
//   hr: {node: "horizontal_rule"},
//   image: {node: "image", getAttrs: tok => ({
//       src: tok.attrGet("src"),
//       title: tok.attrGet("title") || null,
//       alt: tok.children![0] && tok.children![0].content || null
//     })},
//   hardbreak: {node: "hard_break"},
//
//   em: {mark: "em"},
//   strong: {mark: "strong"},
//   link: {mark: "link", getAttrs: tok => ({
//       href: tok.attrGet("href"),
//       title: tok.attrGet("title") || null
//     })},
//   code_inline: {mark: "code", noCloseToken: true}
// })

const styles = css`
  slot {
    display: none;
  }
`;

export type Feature = "link" | "image";

/**
 * @tag fwc-markdown-viewer
 */
export class MarkdownViewerElement extends LitElement implements MarkdownViewerElementProps {
  static styles: CSSResult = styles;

  @property({ type: Array, reflect: true, converter: (a) => a?.split(',') })
  excludeFeatures: Feature[] = [];

  @property({ type: String, reflect: true })
  value = '';

  @queryAsync('#viewer')
  viewer!: Promise<HTMLDivElement>;

  protected view!: EditorView;

  @query('slot')
  mainSlot!: HTMLSlotElement;

  connectedCallback() {
    super.connectedCallback();
    this.initializeViewer();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.view && this.view.destroy();
  }

  private async initializeViewer() {
    const customMarkdownParser = new MarkdownParser(defaultMarkdownParser.schema, defaultMarkdownParser.tokenizer, {
      ...defaultMarkdownParser.tokens,
      ...this.excludeFeatures.includes("link") ? {
        link: {ignore: true}  
      } : {},
      ...this.excludeFeatures.includes("image") ? {
        image: {node: "image", ignore: true},
      } : {},
    });


    this.view = new EditorView(await this.viewer, {
      state: EditorState.create({
        doc: customMarkdownParser.parse(this.value),
      }),
      // nodeViews: {
      //   ...(this.excludeFeatures.includes("image") ? ({
      //     image: (() => {
      //       const span = document.createElement("span")
      //       // span.innerText = `[EMBEDDED IMAGE NOT SUPPORTED]`;
      //       return {
      //         dom: span
      //       }
      //     }) as NodeViewConstructor
      //   }) : {}),
      //   ...(this.excludeFeatures.includes("link") ? ({
      //     link: ((node, x) => {
      //       const span = document.createElement("span")
      //       // console.log(node.textContent);
      //       return {
      //         dom: span,
      //       }
      //     }) as NodeViewConstructor 
      //   }) : {})
      // }
    });
  }

  protected handleSlotChange(): void {
    this.value = this.mainSlot.assignedNodes()[0]?.textContent || '';
  }

  public render(): TemplateResult {
    console.table("this.excludeFeatures", this.excludeFeatures);
    return html`
      <slot @slotchange=${this.handleSlotChange}></slot>
      <div id="viewer"></div>
    `;
  }
}

export default MarkdownViewerElement;
