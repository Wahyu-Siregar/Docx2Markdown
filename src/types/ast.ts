export type ImageHandlingMode = 'none' | 'base64' | 'external';

export type LineEnding = 'auto' | 'lf' | 'crlf';



export interface InlineNode {
  type: 'text' | 'bold' | 'italic' | 'strikethrough' | 'code' | 'link' | 'subscript' | 'superscript' | 'underline';
  text?: string;
  url?: string;
  children?: InlineNode[];
}

export interface HeadingNode {
  type: 'heading';
  level: number; // 1 to 6
  children: InlineNode[];
}

export interface ParagraphNode {
  type: 'paragraph';
  children: InlineNode[];
  style?: string;
}

export interface ListItemNode {
  type: 'list_item';
  level: number;
  checked?: boolean;
  children: InlineNode[];
}

export interface ListNode {
  type: 'list';
  ordered: boolean;
  items: ListItemNode[];
}

export interface TableCellNode {
  type: 'table_cell';
  children: InlineNode[];
  colSpan?: number;
  rowSpan?: number;
  isHeader?: boolean;
}

export interface TableRowNode {
  type: 'table_row';
  cells: TableCellNode[];
}

export interface TableNode {
  type: 'table';
  headers?: TableRowNode;
  rows: TableRowNode[];
  isComplex: boolean; // Has merged cells or nested elements
}

export interface ImageNode {
  type: 'image';
  id: string;
  rId: string;
  originalFilename: string;
  mimeType: string;
  caption?: string;
  altText?: string;
  title?: string;
  buffer: Uint8Array;
  processedFilename?: string;
}

export interface QuoteNode {
  type: 'quote';
  level: number;
  children: ASTNode[];
}

export interface CodeBlockNode {
  type: 'code_block';
  code: string;
  language?: string;
}

export interface FootnoteNode {
  type: 'footnote';
  id: string;
  number: number;
  children: ASTNode[];
}

export interface PageBreakNode {
  type: 'page_break';
  breakType: 'page' | 'section';
}

export type ASTNode =
  | HeadingNode
  | ParagraphNode
  | ListNode
  | TableNode
  | ImageNode
  | QuoteNode
  | CodeBlockNode
  | FootnoteNode
  | PageBreakNode;

export interface DocumentAST {
  nodes: ASTNode[];
  footnotes: Map<string, FootnoteNode>;
  images: ImageNode[];
  statistics: {
    headings: number;
    paragraphs: number;
    lists: number;
    tables: number;
    images: number;
    hyperlinks: number;
  };
}

export interface ConversionWarning {
  code: string;
  message: string;
  location?: string;
  impact?: string;
  suggestion?: string;
}
