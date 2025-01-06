import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import type { Meta, StoryObj } from '@storybook/web-components';
import { setCustomElementsManifest } from '@storybook/web-components';

import {
  MarkdownViewerElement,
  MarkdownViewerElementProps,
} from '@equinor/fusion-wc-markdown';
import cem from '@equinor/fusion-wc-markdown/custom-elements.json';
import markdownExample from './markdown.example.md?raw';

MarkdownViewerElement;

setCustomElementsManifest(cem);

type Story = StoryObj<MarkdownViewerElementProps>;

const meta: Meta<typeof cem> = {
  component: 'fwc-markdown-viewer',
};

const render = (props: MarkdownViewerElementProps) => html`
  <fwc-markdown-viewer excludeFeatures="${ifDefined(props.excludeFeatures)}">${markdownExample}</fwc-markdown-viewer>
`;

export const Default: Story = {
  args: {},
  render,
};

export const ExcludeFeatures: Story = {
  args: {},
  render: (props) => render({ ...props, excludeFeatures: ['image', 'link'] }),
};

export default meta;
