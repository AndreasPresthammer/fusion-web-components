import {Feature} from "./element";

export type MarkdownViewerElementProps = {
  /** Markdown content */
  value?: string;
  excludeFeatures?: Feature[];
};
