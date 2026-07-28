# DOCX Table Fidelity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preserve DOCX table headers, merged cells, structured cell content, and portable formatting in GFM or HTML output.

**Architecture:** Table cells will store ordered AST blocks instead of flattened inline nodes. The parser will resolve Word merge metadata into `colSpan` and `rowSpan`, while the renderer will keep simple tables as GFM and render complex structures as escaped native HTML.

**Tech Stack:** TypeScript, JSZip, fast-xml-parser, Node.js test runner, React/Electron build pipeline.

## Global Constraints

- Keep simple tables as GFM pipe tables.
- Use HTML only for complex tables or the configured HTML fallback.
- Tables without explicit Word headers receive a synthetic empty GFM header.
- Do not add dependencies.
- Preserve existing conversion warnings and add no new UI configuration.
- Follow red-green-refactor for every production behavior.

---

### Task 1: Replace flattened table cells with ordered blocks

**Files:**
- Modify: `src/types/ast.ts`
- Modify: `src/core/docxParser.ts`
- Modify: `test/unit/docxParser.test.ts`

**Interfaces:**
- Produces: `TableCellNode.blocks: ASTNode[]`
- Produces: `TableNode.headerRows: TableRowNode[]`
- Removes: `TableCellNode.children`
- Removes: `TableNode.headers`

- [ ] **Step 1: Write failing parser tests for explicit and missing headers**

Add two in-memory DOCX fixtures. The explicit-header fixture contains:

```xml
<w:tr>
  <w:trPr><w:tblHeader/></w:trPr>
  <w:tc><w:p><w:r><w:t>Header</w:t></w:r></w:p></w:tc>
</w:tr>
<w:tr>
  <w:tc><w:p><w:r><w:t>Data</w:t></w:r></w:p></w:tc>
</w:tr>
```

Assert:

```ts
assert.equal(table.headerRows.length, 1);
assert.equal(table.rows.length, 1);
assert.equal(table.headerRows[0].cells[0].blocks[0].type, 'paragraph');
```

For a table without `w:tblHeader`, assert `headerRows.length === 0` and both
Word rows remain in `rows`.

- [ ] **Step 2: Run parser tests and verify RED**

Run:

```powershell
node --experimental-strip-types --no-warnings --test test/unit/docxParser.test.ts
```

Expected: FAIL because `headerRows` and `blocks` do not exist.

- [ ] **Step 3: Change the AST contracts**

Use:

```ts
export interface TableCellNode {
  type: 'table_cell';
  blocks: ASTNode[];
  colSpan?: number;
  rowSpan?: number;
  isHeader?: boolean;
}

export interface TableNode {
  type: 'table';
  headerRows: TableRowNode[];
  rows: TableRowNode[];
  isComplex: boolean;
}
```

- [ ] **Step 4: Parse explicit header rows and ordered cell blocks**

In `parseTable`:

- read `w:trPr/w:tblHeader` with `isToggleOn`;
- iterate direct `w:p` and `w:tbl` children in their original order;
- append parsed paragraph nodes to `blocks`;
- recursively parse direct nested tables and append them to `blocks`;
- place explicit header rows in `headerRows`, all others in `rows`;
- set `isComplex` when a nested table or multiple header rows exist.

- [ ] **Step 5: Run parser tests and verify GREEN**

Run the Task 1 command and expect all parser tests to pass.

- [ ] **Step 6: Commit**

```powershell
git add src/types/ast.ts src/core/docxParser.ts test/unit/docxParser.test.ts
git commit -m "feat: preserve DOCX table headers and cell blocks"
```

---

### Task 2: Resolve vertical and horizontal merged cells

**Files:**
- Modify: `src/core/docxParser.ts`
- Modify: `test/unit/docxParser.test.ts`

**Interfaces:**
- Consumes: `TableCellNode.blocks`, `colSpan`, and `rowSpan`
- Produces: resolved rows with vertical continuation cells removed

- [ ] **Step 1: Write failing merge fixtures**

Create an in-memory table containing:

```xml
<w:tc>
  <w:tcPr><w:gridSpan w:val="2"/><w:vMerge w:val="restart"/></w:tcPr>
  <w:p><w:r><w:t>Merged</w:t></w:r></w:p>
</w:tc>
```

followed on the next row by:

```xml
<w:tc>
  <w:tcPr><w:gridSpan w:val="2"/><w:vMerge/></w:tcPr>
  <w:p/>
</w:tc>
```

Assert the owner cell has `colSpan === 2`, `rowSpan === 2`, and the continuation
cell is absent from the second logical row.

Add an orphan continuation fixture and assert its content remains as an
ordinary cell.

- [ ] **Step 2: Run parser tests and verify RED**

Expected: FAIL because `rowSpan` is not calculated and continuation cells
remain.

- [ ] **Step 3: Implement merge resolution**

Parse each cell into an internal record:

```ts
interface ParsedTableCell {
  cell: TableCellNode;
  merge: 'none' | 'restart' | 'continue';
}
```

After parsing each row, walk logical column offsets with an active-owner map:

- `restart`: initialize `rowSpan = 1` and register the owner for every spanned
  logical column;
- `continue`: increment the unique active owner's `rowSpan` once for the row
  and omit the continuation cell;
- orphan `continue`: keep the cell and clear its merge state;
- ordinary cells: clear active owners for their occupied columns.

- [ ] **Step 4: Run parser tests and verify GREEN**

Run the parser test command and expect all parser tests to pass.

- [ ] **Step 5: Commit**

```powershell
git add src/core/docxParser.ts test/unit/docxParser.test.ts
git commit -m "feat: preserve DOCX vertical table merges"
```

---

### Task 3: Preserve rich cell content and image sources

**Files:**
- Modify: `src/core/docxParser.ts`
- Modify: `src/core/imageProcessor.ts`
- Modify: `test/unit/docxParser.test.ts`
- Modify: `test/unit/imageProcessor.test.ts`

**Interfaces:**
- Produces: ordered paragraph, list, quote, image, code, and nested-table blocks
- Produces: `ProcessedImageResult.source?: string`

- [ ] **Step 1: Write failing cell-content tests**

Add one DOCX fixture whose cell contains:

- two paragraphs;
- a numbered/list paragraph;
- an image relationship and drawing;
- a direct nested `w:tbl`.

Assert the block order is:

```ts
['paragraph', 'paragraph', 'list', 'image', 'table']
```

Add image processor assertions:

```ts
assert.equal(externalResult.source, './attachments/image-001.png');
assert.match(base64Result.source!, /^data:image\/png;base64,/);
```

- [ ] **Step 2: Run tests and verify RED**

Run:

```powershell
npm test
```

Expected: FAIL because table cells are flattened and image results lack
`source`.

- [ ] **Step 3: Complete ordered block parsing**

Ensure `parseTable` appends every node returned by `parseParagraph`, including
arrays created by mixed text/image paragraphs. Parse nested tables recursively.
Do not cast block nodes to `InlineNode`.

- [ ] **Step 4: Expose an image source**

Add:

```ts
source?: string;
```

to `ProcessedImageResult`. Set it to the relative path in external mode and
the data URI in base64 mode. Leave it undefined in no-image mode.

- [ ] **Step 5: Run tests and verify GREEN**

Run `npm test` and expect all tests to pass.

- [ ] **Step 6: Commit**

```powershell
git add src/core/docxParser.ts src/core/imageProcessor.ts test/unit/docxParser.test.ts test/unit/imageProcessor.test.ts
git commit -m "feat: retain rich content inside DOCX table cells"
```

---

### Task 4: Render portable GFM and native HTML tables

**Files:**
- Modify: `src/core/markdownRenderer.ts`
- Modify: `test/unit/markdownRenderer.test.ts`

**Interfaces:**
- Consumes: `TableNode.headerRows`, cell `blocks`, `rowSpan`, `colSpan`
- Consumes: `ProcessedImageResult.source`
- Produces: valid single-line GFM cells or escaped native HTML blocks

- [ ] **Step 1: Write failing GFM renderer tests**

Test a table without headers and expect:

```md
|  |
| --- |
| First Word row |
```

Test two paragraph blocks and embedded newlines/tabs, expecting the cell to
contain `First<br>Second line Tabbed` without splitting the pipe row.

- [ ] **Step 2: Run renderer tests and verify RED**

Run:

```powershell
node --experimental-strip-types --no-warnings --test test/unit/markdownRenderer.test.ts
```

Expected: FAIL because the renderer still expects `headers` and inline
`children`.

- [ ] **Step 3: Write failing HTML renderer tests**

Build an AST containing:

- an explicit header;
- a cell with `rowSpan: 2` and `colSpan: 2`;
- bold, italic, link, and literal `<script>` text;
- a nested table;
- an external image result.

Assert output contains:

```html
<thead>
<th colspan="2" rowspan="2">
<strong>Bold</strong>
&lt;script&gt;
<table>
<img src="./images/image-001.png"
```

and does not contain raw `<script>`.

- [ ] **Step 4: Implement GFM block rendering**

Pass `processedImages` into `renderTable`. Add a cell-block helper that:

- renders inline content;
- joins paragraph-like blocks with `<br>`;
- converts embedded newlines to `<br>` and tabs to spaces;
- flattens lists and quotes with `<br>`;
- uses image Markdown references for images;
- reduces nested tables to readable text only in text fallback;
- expands `colSpan`;
- creates a synthetic empty header when `headerRows` is empty.

- [ ] **Step 5: Implement native HTML block rendering**

Add small private helpers:

```ts
escapeHtml(value: string): string
renderInlinesHtml(inlines: InlineNode[]): string
renderBlocksHtml(blocks: ASTNode[], ...): string
```

Render native elements for paragraphs, lists, quotes, code, images, and nested
tables. Escape text plus link/image attributes. Emit `colspan` and `rowspan`
only when greater than one. Omit `<thead>` when Word supplied no header.

- [ ] **Step 6: Run renderer tests and verify GREEN**

Run the Task 4 renderer command and expect all renderer tests to pass.

- [ ] **Step 7: Commit**

```powershell
git add src/core/markdownRenderer.ts test/unit/markdownRenderer.test.ts
git commit -m "feat: render faithful GFM and HTML tables"
```

---

### Task 5: Full regression verification

**Files:**
- Verify: all modified source and test files

**Interfaces:**
- Consumes: completed parser and renderer behavior
- Produces: verified build-ready repository state

- [ ] **Step 1: Run all unit tests**

```powershell
npm test
```

Expected: zero failed tests.

- [ ] **Step 2: Run TypeScript lint**

```powershell
npm run lint
```

Expected: exit code 0 with no TypeScript errors.

- [ ] **Step 3: Run the production build**

```powershell
npm run build
```

Expected: exit code 0. The existing Vite bundle-size advisory is non-blocking.

- [ ] **Step 4: Run Electron startup regression**

```powershell
node --test test/electron-startup.test.mjs
```

Expected: Electron starts without preload errors.

- [ ] **Step 5: Check the final diff**

```powershell
git status --short
git diff --check
```

Expected: only intended table-fidelity changes and no whitespace errors.

- [ ] **Step 6: Commit any final test-only adjustment**

Only if verification required an adjustment:

```powershell
git add src test
git commit -m "test: complete DOCX table fidelity coverage"
```
