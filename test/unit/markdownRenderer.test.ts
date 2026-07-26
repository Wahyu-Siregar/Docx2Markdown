import test from 'node:test';
import assert from 'node:assert/strict';
import { MarkdownRenderer } from '../../src/core/markdownRenderer.ts';
import { DEFAULT_CONFIG } from '../../src/types/config.ts';
import type { DocumentAST, TableNode } from '../../src/types/ast.ts';

test('MarkdownRenderer - basic AST rendering', () => {
  const ast: DocumentAST = {
    nodes: [
      {
        type: 'heading',
        level: 1,
        children: [{ type: 'text', text: 'Judul Utama' }],
      },
      {
        type: 'paragraph',
        children: [
          { type: 'text', text: 'Teks ' },
          { type: 'bold', text: 'tebal' },
          { type: 'text', text: ' dan ' },
          { type: 'italic', text: 'miring' },
        ],
      },
      {
        type: 'list',
        ordered: false,
        items: [
          { type: 'list_item', level: 0, children: [{ type: 'text', text: 'Item 1' }] },
          { type: 'list_item', level: 0, children: [{ type: 'text', text: 'Item 2' }] },
        ],
      },
      {
        type: 'code_block',
        code: 'console.log("hello");',
        language: 'js',
      },
    ],
    footnotes: new Map(),
    images: [],
    statistics: { headings: 1, paragraphs: 1, lists: 1, tables: 0, images: 0, hyperlinks: 0 },
  };

  const config = { ...DEFAULT_CONFIG, includeTableOfContents: false };
  const res = MarkdownRenderer.render(ast, new Map(), config);

  assert.match(res.markdown, /# Judul Utama/);
  assert.match(res.markdown, /\*\*tebal\*\*/);
  assert.match(res.markdown, /\*miring\*/);
  assert.match(res.markdown, /- Item 1/);
  assert.match(res.markdown, /```js\nconsole\.log\("hello"\);\n```/);
});

test('MarkdownRenderer - renders underline as HTML tag <u>', () => {
  const ast: DocumentAST = {
    nodes: [
      {
        type: 'paragraph',
        children: [{ type: 'underline', text: 'Underlined Text' }],
      },
    ],
    footnotes: new Map(),
    images: [],
    statistics: { headings: 0, paragraphs: 1, lists: 0, tables: 0, images: 0, hyperlinks: 0 },
  };

  const config = { ...DEFAULT_CONFIG, includeTableOfContents: false };
  const res = MarkdownRenderer.render(ast, new Map(), config);

  assert.equal(res.markdown, '<u>Underlined Text</u>');
});

test('MarkdownRenderer - safely fences backticks in inline code and code blocks', () => {
  const ast: DocumentAST = {
    nodes: [
      {
        type: 'paragraph',
        children: [{ type: 'code', text: 'var `x` = 1;' }],
      },
      {
        type: 'code_block',
        language: 'markdown',
        code: '```js\nconsole.log("nested code block");\n```',
      },
    ],
    footnotes: new Map(),
    images: [],
    statistics: { headings: 0, paragraphs: 1, lists: 0, tables: 0, images: 0, hyperlinks: 0 },
  };

  const config = { ...DEFAULT_CONFIG, includeTableOfContents: false };
  const res = MarkdownRenderer.render(ast, new Map(), config);

  assert.match(res.markdown, /``var `x` = 1;``/);
  assert.match(res.markdown, /````markdown\n```js\nconsole\.log\("nested code block"\);\n```\n````/);
});

test('MarkdownRenderer - escapes plain text markdown triggers', () => {
  const ast: DocumentAST = {
    nodes: [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Special *star* _underscore_ #hash [bracket]' }],
      },
    ],
    footnotes: new Map(),
    images: [],
    statistics: { headings: 0, paragraphs: 1, lists: 0, tables: 0, images: 0, hyperlinks: 0 },
  };

  const config = { ...DEFAULT_CONFIG, includeTableOfContents: false };
  const res = MarkdownRenderer.render(ast, new Map(), config);

  assert.equal(res.markdown, 'Special \\*star\\* \\_underscore\\_ \\#hash \\[bracket\\]');
});

test('MarkdownRenderer - renders nested formatting in hyperlinks', () => {
  const ast: DocumentAST = {
    nodes: [
      {
        type: 'paragraph',
        children: [
          {
            type: 'link',
            url: 'https://example.com',
            text: 'Link Tebal',
            children: [{ type: 'bold', text: 'Link Tebal' }],
          },
        ],
      },
    ],
    footnotes: new Map(),
    images: [],
    statistics: { headings: 0, paragraphs: 1, lists: 0, tables: 0, images: 0, hyperlinks: 1 },
  };

  const config = { ...DEFAULT_CONFIG, includeTableOfContents: false };
  const res = MarkdownRenderer.render(ast, new Map(), config);

  assert.equal(res.markdown, '[**Link Tebal**](https://example.com)');
});

test('MarkdownRenderer - complex table text fallback normalization', () => {
  const complexTable: TableNode = {
    type: 'table',
    isComplex: true,
    headers: {
      type: 'table_row',
      cells: [
        { type: 'table_cell', children: [{ type: 'text', text: 'H1' }], colSpan: 2 },
        { type: 'table_cell', children: [{ type: 'text', text: 'H2' }] },
      ],
    },
    rows: [
      {
        type: 'table_row',
        cells: [
          { type: 'table_cell', children: [{ type: 'text', text: 'A' }] },
          { type: 'table_cell', children: [{ type: 'text', text: 'B' }] },
          { type: 'table_cell', children: [{ type: 'text', text: 'C' }] },
        ],
      },
    ],
  };

  const ast: DocumentAST = {
    nodes: [complexTable],
    footnotes: new Map(),
    images: [],
    statistics: { headings: 0, paragraphs: 0, lists: 0, tables: 1, images: 0, hyperlinks: 0 },
  };

  const config = { ...DEFAULT_CONFIG, complexTableFallback: 'text' as const, includeTableOfContents: false };
  const res = MarkdownRenderer.render(ast, new Map(), config);

  assert.match(res.markdown, /\| H1 \|  \| H2 \|/);
  assert.match(res.markdown, /\| A \| B \| C \|/);
  assert.equal(res.warnings.length, 1);
  assert.equal(res.warnings[0].code, 'COMPLEX_TABLE_TEXT_FALLBACK');
});

test('MarkdownRenderer - complex table html fallback', () => {
  const complexTable: TableNode = {
    type: 'table',
    isComplex: true,
    headers: {
      type: 'table_row',
      cells: [
        { type: 'table_cell', children: [{ type: 'text', text: 'H1' }], colSpan: 2 },
      ],
    },
    rows: [],
  };

  const ast: DocumentAST = {
    nodes: [complexTable],
    footnotes: new Map(),
    images: [],
    statistics: { headings: 0, paragraphs: 0, lists: 0, tables: 1, images: 0, hyperlinks: 0 },
  };

  const config = { ...DEFAULT_CONFIG, complexTableFallback: 'html' as const, includeTableOfContents: false };
  const res = MarkdownRenderer.render(ast, new Map(), config);

  assert.match(res.markdown, /<table[\s\S]*<th colspan="2">H1<\/th>/);
  assert.equal(res.warnings[0].code, 'COMPLEX_TABLE_HTML_FALLBACK');
});
