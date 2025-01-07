import { css, type CSSResult, html, LitElement, type TemplateResult } from 'lit';
import { property, query, queryAsync } from 'lit/decorators.js';
import { MarkdownViewerElementProps } from './types';
import { defaultMarkdownParser } from 'prosemirror-markdown';
import { EditorView } from 'prosemirror-view';
import { EditorState } from 'prosemirror-state';
import { Node } from 'prosemirror-model';

const styles = css`
  slot {
    display: none;
  }
`;

export type Feature = 'link' | 'image';

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
    this.view = new EditorView(await this.viewer, {
      state: EditorState.create({
        doc: defaultMarkdownParser.parse(this.value),
      }),
    });

    if (this.excludeFeatures.includes('link')) {
      this.replaceLinksWithLinkText();
    }

    if (this.excludeFeatures.includes('image')) {
      this.replaceImagesWithUnsupportedText();
    }
  }

  protected replaceLinksWithLinkText() {
    this.view.state.doc.descendants((node, pos) => {
      if (this.isProseMirrorLinkNode(node)) {
        this.view.dispatch(this.view.state.tr.delete(pos, pos + node.nodeSize).insertText(node.text || '', pos));
      }
    });
  }

  protected replaceImagesWithUnsupportedText() {
    this.view.state.doc.descendants((node, pos) => {
      if (node.type.name === 'image') {
        this.view.dispatch(this.view.state.tr.delete(pos, pos + 1).insertText('[EMBEDDED IMAGE NOT SUPPORTED]', pos));
      }
    });
  }

  protected isProseMirrorLinkNode(node: Node): boolean {
    return node.marks.filter((mark) => mark.type.name === 'link').length > 0;
  }

  protected handleSlotChange(): void {
    this.value = this.mainSlot.assignedNodes()[0]?.textContent || '';
  }

  public render(): TemplateResult {
    return html`
      <slot @slotchange=${this.handleSlotChange}></slot>
      <div id="viewer"></div>
    `;
  }
}

export default MarkdownViewerElement;
