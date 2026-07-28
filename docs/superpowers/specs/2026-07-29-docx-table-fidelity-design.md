# DOCX Table Fidelity Design

## Goal

Preserve DOCX table semantics as far as Markdown permits while keeping simple
tables as readable GFM pipe tables and using HTML only when the structure
requires it.

## Scope

This change covers:

- explicit Word table-header detection;
- tables without headers;
- horizontal and vertical merged cells;
- multiple paragraphs and line breaks inside cells;
- lists, quotes, code blocks, images, and nested tables inside cells;
- portable HTML output for complex tables;
- regression tests using in-memory DOCX fixtures.

Word-specific visual styling such as exact column width, border thickness,
shading, font face, and page-layout measurements is intentionally excluded
because Markdown cannot represent it consistently.

## Data Model

`TableCellNode` stores ordered block content as `ASTNode[]` rather than a flat
`InlineNode[]`. This keeps paragraphs, lists, quotes, images, code blocks, and
nested tables intact.

`TableNode` stores explicit header rows separately from body rows. Header rows
come only from Word's `w:tblHeader`; the first row is no longer assumed to be a
header.

Cells retain `colSpan` and `rowSpan`. A vertical merge continuation cell is not
emitted as a second logical cell; it increases the owning cell's `rowSpan`.

## Parsing

The parser walks `w:tr` and `w:tc` in document order.

- `w:gridSpan` becomes `colSpan`.
- `w:vMerge w:val="restart"` starts an active vertical merge.
- `w:vMerge` without a value, or with `continue`, extends the active merge.
- `w:tblHeader` marks a row as a header.
- Direct `w:p` and `w:tbl` children inside a cell become ordered cell blocks.
- Nested tables mark the containing table as complex.
- More than one header row marks the table as complex because GFM supports
  only one separator/header row.

Malformed vertical continuations without an active owner are retained as
ordinary cells so content is not silently discarded.

## Rendering

### GFM pipe tables

Simple tables use pipe-table syntax.

- A table with one explicit header uses that row.
- A table without an explicit header receives a synthetic empty header; all
  Word rows remain body data.
- Cell blocks are joined with `<br>`.
- Embedded newlines and tabs are normalized for a single pipe-table row.
- Pipes remain escaped.
- `colSpan` is flattened into the original cell plus empty cells.

When the user selects the text fallback for a complex table, vertical-merge,
nested-table, and multi-header semantics may be flattened, and the existing
conversion warning must state that fidelity was reduced.

### HTML tables

Complex tables use native HTML.

- Header rows render inside `<thead>` only when Word explicitly marked them.
- Other rows render inside `<tbody>`.
- `colspan` and `rowspan` are emitted.
- Inline formatting becomes native HTML (`strong`, `em`, `del`, `u`, `code`,
  `sub`, `sup`, and `a`).
- Text and attribute values are HTML-escaped.
- Paragraphs, lists, quotes, code blocks, images, and nested tables render as
  their corresponding HTML structures.

## Error Handling

- Empty tables return no output.
- Missing image processing results omit the image rather than producing a
  broken reference.
- Invalid or orphaned merge metadata preserves cell content and degrades to an
  unmerged cell.
- Fidelity reductions use conversion warnings instead of aborting conversion.

## Tests

Parser fixtures must verify:

1. an explicit `w:tblHeader`;
2. a table without a header;
3. `gridSpan`;
4. vertical merge restart and continuation;
5. multiple paragraphs and lists inside a cell;
6. an image inside a cell;
7. a nested table.

Renderer tests must verify:

1. a synthetic empty GFM header;
2. `<br>` normalization in pipe-table cells;
3. `rowspan` and `colspan` in HTML;
4. native HTML inline formatting;
5. nested-table rendering;
6. HTML text and attribute escaping.

The full unit suite, TypeScript lint, production build, and Electron startup
test remain required completion gates.
