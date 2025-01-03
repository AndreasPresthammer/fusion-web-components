import { css, type CSSResult, html, LitElement, type TemplateResult } from 'lit';
import { property, query, queryAsync } from 'lit/decorators.js';
import { MarkdownViewerElementProps } from './types';
import { defaultMarkdownParser } from 'prosemirror-markdown';
import { EditorView } from 'prosemirror-view';
import { EditorState } from 'prosemirror-state';

const styles = css`
  slot {
    display: none;
  }
`;

/**
 * @tag fwc-markdown-viewer
 */
export class MarkdownViewerElement extends LitElement implements MarkdownViewerElementProps {
  static styles: CSSResult = styles;

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
