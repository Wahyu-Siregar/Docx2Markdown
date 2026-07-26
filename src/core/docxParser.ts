import JSZip from 'jszip';
import { XMLParser } from 'fast-xml-parser';
import type {
  DocumentAST,
  ASTNode,
  HeadingNode,
  ParagraphNode,
  ListNode,
  ListItemNode,
  TableNode,
  TableRowNode,
  TableCellNode,
  ImageNode,
  InlineNode,
  FootnoteNode,
  PageBreakNode,
} from '../types/ast.ts';

interface Relationship {
  id: string;
  type: string;
  target: string;
}

interface StyleMap {
  [styleId: string]: {
    name: string;
    headingLevel?: number;
    isQuote?: boolean;
    isCode?: boolean;
    isCaption?: boolean;
  };
}

// ── preserveOrder navigation helpers ────────────────────────────────
// With preserveOrder: true, each XML element becomes:
//   { "tagName": [ ...children... ], ":@": { "@_attr": "val" } }
// Children arrays contain ordered nodes of potentially different tags.

/** Find first node with `tag` in an ordered children array. */
function poFind(arr: any[], tag: string): any | undefined {
  if (!Array.isArray(arr)) return undefined;
  return arr.find((n: any) => n && typeof n === 'object' && tag in n);
}

/** Find all nodes with `tag` in an ordered children array. */
function poAll(arr: any[], tag: string): any[] {
  if (!Array.isArray(arr)) return [];
  return arr.filter((n: any) => n && typeof n === 'object' && tag in n);
}

/** Get attribute from a preserveOrder node's `:@` bag. */
function poAttr(node: any, attr: string): string | undefined {
  return node?.[':@']?.[attr];
}

/** Get `#text` content from a children array. */
function poText(arr: any[]): string {
  if (!Array.isArray(arr)) return '';
  const t = arr.find((n: any) => n && '#text' in n);
  return t ? String(t['#text']) : '';
}

/** Check if a formatting attribute (w:b, w:i, w:u, w:strike) is enabled, ignoring w:val="0" / "false" / "off". */
function isToggleOn(rPr: any[], tag: string): boolean {
  const node = poFind(rPr, tag);
  if (!node) return false;
  const val = poAttr(node, '@_w:val');
  if (val === undefined || val === null) return true;
  const v = String(val).toLowerCase();
  return v !== '0' && v !== 'false' && v !== 'off' && v !== 'none';
}

/** Check if `tag` exists in children array. */
function poHas(arr: any[], tag: string): boolean {
  return poFind(arr, tag) !== undefined;
}

/** Navigate a dotted path: poNav(root, 'w:document', 'w:body') */
function poNav(root: any[], ...path: string[]): any[] {
  let current: any[] = root;
  for (const tag of path) {
    const found = poFind(current, tag);
    if (!found) return [];
    current = found[tag];
    if (!Array.isArray(current)) return [];
  }
  return current;
}

// ────────────────────────────────────────────────────────────────────

export class DocxParser {
  private xmlParser: XMLParser;

  constructor() {
    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      parseAttributeValue: false,
      preserveOrder: true,
      trimValues: false,
    });
  }

  public async parseDocx(arrayBuffer: ArrayBuffer, filename: string): Promise<DocumentAST> {
    const zip = await JSZip.loadAsync(arrayBuffer);

    // 1. Read Relationships
    const relsMap = await this.parseRelationships(zip);

    // 2. Read Styles
    const stylesMap = await this.parseStyles(zip);

    // 3. Read Images / Media
    const imagesMap = await this.parseMedia(zip, relsMap);

    // 4. Read Footnotes
    const footnotesMap = await this.parseFootnotes(zip, stylesMap);

    // 5. Parse Main Document XML
    const docXmlFile = zip.file('word/document.xml');
    if (!docXmlFile) {
      throw new Error('File document.xml tidak ditemukan di dalam paket DOCX.');
    }

    const docXmlText = await docXmlFile.async('string');
    const docParsed = this.xmlParser.parse(docXmlText);

    const bodyChildren = poNav(docParsed, 'w:document', 'w:body');
    if (bodyChildren.length === 0) {
      throw new Error('Struktur XML dokumen tidak valid.');
    }

    const nodes: ASTNode[] = [];
    const stats = {
      headings: 0,
      paragraphs: 0,
      lists: 0,
      tables: 0,
      images: imagesMap.size,
      hyperlinks: 0,
    };

    let currentList: ListNode | null = null;

    // Helper to push nodes and handle list grouping
    const pushNode = (node: ASTNode | ASTNode[]) => {
      const nodeList = Array.isArray(node) ? node : [node];
      for (const n of nodeList) {
        if (n.type === 'list') {
          if (!currentList) {
            currentList = n as ListNode;
            nodes.push(currentList);
            stats.lists++;
          } else if (currentList.ordered === (n as ListNode).ordered) {
            currentList.items.push(...(n as ListNode).items);
          } else {
            currentList = n as ListNode;
            nodes.push(currentList);
            stats.lists++;
          }
        } else {
          currentList = null;
          nodes.push(n);
        }
      }
    };

    // bodyChildren is already in document order thanks to preserveOrder
    for (const el of bodyChildren) {
      if ('w:p' in el) {
        const pNode = this.parseParagraph(el['w:p'], poAttr(el, '@_w14:paraId'), stylesMap, relsMap, imagesMap, footnotesMap, stats);
        if (pNode) {
          const list = Array.isArray(pNode) ? pNode : [pNode];
          for (const item of list) {
            if (item.type === 'heading') stats.headings++;
            if (item.type === 'paragraph') stats.paragraphs++;
            pushNode(item);
          }
        }
      } else if ('w:tbl' in el) {
        const tblNode = this.parseTable(el['w:tbl'], stylesMap, relsMap, imagesMap, footnotesMap, stats);
        if (tblNode) {
          stats.tables++;
          pushNode(tblNode);
        }
      }
    }

    // Attempt to associate captions with images
    this.associateCaptions(nodes, imagesMap);

    return {
      nodes,
      footnotes: footnotesMap,
      images: Array.from(imagesMap.values()),
      statistics: stats,
    };
  }

  private async parseRelationships(zip: JSZip): Promise<Map<string, Relationship>> {
    const map = new Map<string, Relationship>();
    const relsFile = zip.file('word/_rels/document.xml.rels');
    if (!relsFile) return map;

    const xmlText = await relsFile.async('string');
    const parsed = this.xmlParser.parse(xmlText);
    const relsContainer = poNav(parsed, 'Relationships');
    const relNodes = poAll(relsContainer, 'Relationship');

    for (const r of relNodes) {
      const id = poAttr(r, '@_Id');
      const type = poAttr(r, '@_Type');
      const target = poAttr(r, '@_Target');
      if (id && type && target) {
        map.set(id, { id, type, target });
      }
    }
    return map;
  }

  private async parseStyles(zip: JSZip): Promise<StyleMap> {
    const map: StyleMap = {};
    const stylesFile = zip.file('word/styles.xml');
    if (!stylesFile) return map;

    const xmlText = await stylesFile.async('string');
    const parsed = this.xmlParser.parse(xmlText);
    const stylesContainer = poNav(parsed, 'w:styles');
    const styleNodes = poAll(stylesContainer, 'w:style');

    for (const s of styleNodes) {
      const styleId = poAttr(s, '@_w:styleId');
      if (!styleId) continue;

      const children = s['w:style'] || [];
      const nameNode = poFind(children, 'w:name');
      const nameVal = nameNode ? poAttr(nameNode, '@_w:val') || styleId : styleId;
      const nameLower = String(nameVal).toLowerCase();

      let headingLevel: number | undefined;
      if (nameLower.includes('heading 1') || styleId === 'Heading1') headingLevel = 1;
      else if (nameLower.includes('heading 2') || styleId === 'Heading2') headingLevel = 2;
      else if (nameLower.includes('heading 3') || styleId === 'Heading3') headingLevel = 3;
      else if (nameLower.includes('heading 4') || styleId === 'Heading4') headingLevel = 4;
      else if (nameLower.includes('heading 5') || styleId === 'Heading5') headingLevel = 5;
      else if (nameLower.includes('heading 6') || styleId === 'Heading6') headingLevel = 6;
      else if (nameLower === 'title') headingLevel = 1;

      map[styleId] = {
        name: nameVal,
        headingLevel,
        isQuote: nameLower.includes('quote'),
        isCode: nameLower.includes('code'),
        isCaption: nameLower.includes('caption'),
      };
    }
    return map;
  }

  private async parseMedia(zip: JSZip, relsMap: Map<string, Relationship>): Promise<Map<string, ImageNode>> {
    const map = new Map<string, ImageNode>();

    for (const [rId, rel] of relsMap.entries()) {
      if (rel.type.includes('/image')) {
        const targetPath = rel.target.startsWith('media/')
          ? `word/${rel.target}`
          : rel.target.startsWith('/')
          ? rel.target.substring(1)
          : `word/${rel.target}`;

        const mediaFile = zip.file(targetPath);
        if (mediaFile) {
          const buffer = await mediaFile.async('uint8array');
          const ext = targetPath.split('.').pop()?.toLowerCase() || 'png';
          let mimeType = 'image/png';
          if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
          else if (ext === 'gif') mimeType = 'image/gif';
          else if (ext === 'svg') mimeType = 'image/svg+xml';
          else if (ext === 'webp') mimeType = 'image/webp';
          else if (ext === 'bmp') mimeType = 'image/bmp';

          map.set(rId, {
            type: 'image',
            id: rId,
            rId,
            originalFilename: pathBasename(targetPath),
            mimeType,
            buffer,
          });
        }
      }
    }
    return map;
  }

  private async parseFootnotes(zip: JSZip, stylesMap: StyleMap): Promise<Map<string, FootnoteNode>> {
    const map = new Map<string, FootnoteNode>();
    const file = zip.file('word/footnotes.xml');
    if (!file) return map;

    const xmlText = await file.async('string');
    const parsed = this.xmlParser.parse(xmlText);
    const fnContainer = poNav(parsed, 'w:footnotes');
    const fnNodes = poAll(fnContainer, 'w:footnote');

    let numCounter = 1;
    for (const fn of fnNodes) {
      const id = poAttr(fn, '@_w:id');
      const fnType = poAttr(fn, '@_w:type');
      if (!id || fnType === 'separator' || fnType === 'continuationSeparator') continue;

      const fnChildren = fn['w:footnote'] || [];
      const children: ASTNode[] = [];
      const pNodes = poAll(fnChildren, 'w:p');

      for (const p of pNodes) {
        const parsedP = this.parseParagraph(p['w:p'], undefined, stylesMap, new Map(), new Map(), new Map(), { hyperlinks: 0 });
        if (parsedP) {
          if (Array.isArray(parsedP)) children.push(...parsedP);
          else children.push(parsedP);
        }
      }

      map.set(id, {
        type: 'footnote',
        id,
        number: numCounter++,
        children,
      });
    }
    return map;
  }

  private parseParagraph(
    pChildren: any[], // the ordered children array of a w:p element
    _paraId: string | undefined,
    stylesMap: StyleMap,
    relsMap: Map<string, Relationship>,
    imagesMap: Map<string, ImageNode>,
    footnotesMap: Map<string, FootnoteNode>,
    stats: { hyperlinks: number }
  ): ASTNode | ASTNode[] | null {
    const pPrNode = poFind(pChildren, 'w:pPr');
    const pPr = pPrNode ? pPrNode['w:pPr'] || [] : [];

    const styleNode = poFind(pPr, 'w:pStyle');
    const styleId = styleNode ? poAttr(styleNode, '@_w:val') : undefined;
    const styleInfo = styleId ? stylesMap[styleId] : undefined;

    // Check Page Break
    if (poHas(pPr, 'w:pageBreakBefore')) {
      return { type: 'page_break', breakType: 'page' };
    }

    // Check Numbering (List Item)
    const numPrNode = poFind(pPr, 'w:numPr');
    const numPrChildren = numPrNode ? numPrNode['w:numPr'] || [] : [];
    const ilvlNode = poFind(numPrChildren, 'w:ilvl');
    const numIdNode = poFind(numPrChildren, 'w:numId');
    const ilvl = ilvlNode ? poAttr(ilvlNode, '@_w:val') : undefined;
    const numId = numIdNode ? poAttr(numIdNode, '@_w:val') : undefined;

    const nodes: ASTNode[] = [];
    let currentInlines: InlineNode[] = [];

    const flushInlines = () => {
      if (currentInlines.length === 0) return;
      const hasText = currentInlines.some((i) => (i.text && i.text.length > 0) || (i.children && i.children.length > 0));
      if (!hasText) {
        currentInlines = [];
        return;
      }

      const rawText = currentInlines.map((i) => i.text || '').join('');

      if (numId !== undefined) {
        const level = ilvl ? parseInt(ilvl, 10) : 0;
        const isChecklist = rawText.trim().startsWith('[x]') || rawText.trim().startsWith('[ ]');
        let checked: boolean | undefined;
        if (isChecklist) checked = rawText.trim().startsWith('[x]');

        nodes.push({
          type: 'list',
          ordered: numId === '1' || numId === '2',
          items: [{ type: 'list_item', level, checked, children: currentInlines }],
        });
      } else if (styleInfo?.headingLevel) {
        nodes.push({ type: 'heading', level: styleInfo.headingLevel, children: currentInlines });
      } else if (styleInfo?.isQuote) {
        nodes.push({ type: 'quote', level: 1, children: [{ type: 'paragraph', children: currentInlines }] });
      } else if (styleInfo?.isCode) {
        nodes.push({ type: 'code_block', code: rawText });
      } else {
        nodes.push({ type: 'paragraph', style: styleInfo?.name, children: currentInlines });
      }

      currentInlines = [];
    };

    // Process children in document order — this is the key ordering fix
    for (const child of pChildren) {
      if ('w:r' in child) {
        const res = this.parseRun(child['w:r'], relsMap, footnotesMap, stats);
        if (res.imageId && imagesMap.has(res.imageId)) {
          flushInlines();
          const imgNode = imagesMap.get(res.imageId)!;
          nodes.push(imgNode);
        } else {
          currentInlines.push(...res.inlines);
        }
      } else if ('w:hyperlink' in child) {
        const hlChildren = child['w:hyperlink'] || [];
        const rId = poAttr(child, '@_r:id');
        const rel = rId ? relsMap.get(rId) : undefined;
        const url = rel?.target || '#';
        stats.hyperlinks++;

        const linkInlines: InlineNode[] = [];
        const innerRuns = poAll(hlChildren, 'w:r');
        for (const ir of innerRuns) {
          const res = this.parseRun(ir['w:r'], relsMap, footnotesMap, stats);
          linkInlines.push(...res.inlines);
        }

        const linkText = linkInlines.map((i) => i.text || '').join('');
        currentInlines.push({
          type: 'link',
          text: linkText,
          url,
          children: linkInlines,
        });
      } else if ('w:drawing' in child) {
        const imgInfo = this.extractDrawingImage(child['w:drawing']);
        if (imgInfo && imagesMap.has(imgInfo.rId)) {
          flushInlines();
          const imgNode = imagesMap.get(imgInfo.rId)!;
          if (imgInfo.altText && !imgNode.altText) imgNode.altText = imgInfo.altText;
          nodes.push(imgNode);
        }
      } else if ('w:footnoteReference' in child) {
        const fnId = poAttr(child, '@_w:id') || poAttr(child, '@_w:val');
        if (fnId && footnotesMap.has(fnId)) {
          const fn = footnotesMap.get(fnId)!;
          currentInlines.push({ type: 'text', text: `[^${fn.number}]` });
        }
      }
    }

    flushInlines();

    if (nodes.length === 0) return null;
    if (nodes.length === 1) return nodes[0];
    return nodes;
  }

  private parseRun(
    rChildren: any[], // ordered children of a w:r element
    relsMap: Map<string, Relationship>,
    footnotesMap: Map<string, FootnoteNode>,
    stats: { hyperlinks: number }
  ): { inlines: InlineNode[]; imageId?: string } {
    const rPrNode = poFind(rChildren, 'w:rPr');
    const rPr = rPrNode ? rPrNode['w:rPr'] || [] : [];

    const isBold = isToggleOn(rPr, 'w:b');
    const isItalic = isToggleOn(rPr, 'w:i');
    const isStrike = isToggleOn(rPr, 'w:strike');
    const isUnderline = isToggleOn(rPr, 'w:u');
    const rStyleNode = poFind(rPr, 'w:rStyle');
    const isCode = rStyleNode ? (poAttr(rStyleNode, '@_w:val') || '').toLowerCase().includes('code') : false;
    const vertAlignNode = poFind(rPr, 'w:vertAlign');
    const vertAlign = vertAlignNode ? poAttr(vertAlignNode, '@_w:val') : undefined;

    // Check for drawings in run
    const drawingNode = poFind(rChildren, 'w:drawing');
    if (drawingNode) {
      const imgInfo = this.extractDrawingImage(drawingNode['w:drawing']);
      if (imgInfo) {
        return { inlines: [], imageId: imgInfo.rId };
      }
    }

    // Check text, breaks, tabs, and footnote references in order
    let text = '';
    for (const child of rChildren) {
      if ('w:t' in child) {
        const tVal = child['w:t'];
        if (Array.isArray(tVal)) text += poText(tVal);
        else if (typeof tVal === 'string') text += tVal;
      } else if ('w:br' in child || 'w:cr' in child) {
        text += '\n';
      } else if ('w:tab' in child) {
        text += '\t';
      } else if ('w:footnoteReference' in child) {
        const fnId = poAttr(child, '@_w:id') || poAttr(child, '@_w:val');
        if (fnId && footnotesMap.has(fnId)) {
          const fn = footnotesMap.get(fnId)!;
          text += `[^${fn.number}]`;
        }
      }
    }

    if (!text) return { inlines: [] };

    let node: InlineNode = { type: 'text', text };

    if (isCode) node = { type: 'code', text };
    else if (isBold && isItalic) node = { type: 'bold', children: [{ type: 'italic', text }] };
    else if (isBold) node = { type: 'bold', text };
    else if (isItalic) node = { type: 'italic', text };
    else if (isStrike) node = { type: 'strikethrough', text };
    else if (isUnderline) node = { type: 'underline', text };
    else if (vertAlign === 'superscript') node = { type: 'superscript', text };
    else if (vertAlign === 'subscript') node = { type: 'subscript', text };

    return { inlines: [node] };
  }

  private extractDrawingImage(drawingChildren: any[]): { rId: string; altText?: string } | null {
    try {
      const inlineNode = poFind(drawingChildren, 'wp:inline');
      const anchorNode = poFind(drawingChildren, 'wp:anchor');
      const containerNode = inlineNode || anchorNode;
      if (!containerNode) return null;

      const containerTag = inlineNode ? 'wp:inline' : 'wp:anchor';
      const containerChildren = containerNode[containerTag] || [];

      const docPrNode = poFind(containerChildren, 'wp:docPr');
      const altText = docPrNode
        ? poAttr(docPrNode, '@_descr') || poAttr(docPrNode, '@_title') || poAttr(docPrNode, '@_name')
        : undefined;

      const graphicChildren = poNav(containerChildren, 'a:graphic', 'a:graphicData', 'pic:pic', 'pic:blipFill');
      const blipNode = poFind(graphicChildren, 'a:blip');
      const rId = blipNode ? poAttr(blipNode, '@_r:embed') : undefined;

      if (rId) {
        return { rId, altText };
      }
    } catch {
      // Ignore drawing parse error fallback
    }
    return null;
  }

  private parseTable(
    tblChildren: any[], // ordered children of a w:tbl element
    stylesMap: StyleMap,
    relsMap: Map<string, Relationship>,
    imagesMap: Map<string, ImageNode>,
    footnotesMap: Map<string, FootnoteNode>,
    stats: { hyperlinks: number }
  ): TableNode | null {
    const trNodes = poAll(tblChildren, 'w:tr');
    if (trNodes.length === 0) return null;

    let isComplex = false;
    const rows: TableRowNode[] = [];

    trNodes.forEach((trNode: any, rIdx: number) => {
      const trChildren = trNode['w:tr'] || [];
      const tcNodes = poAll(trChildren, 'w:tc');
      const cells: TableCellNode[] = [];

      tcNodes.forEach((tcNode: any) => {
        const tcChildren = tcNode['w:tc'] || [];
        const tcPrNode = poFind(tcChildren, 'w:tcPr');
        const tcPr = tcPrNode ? tcPrNode['w:tcPr'] || [] : [];

        const gridSpanNode = poFind(tcPr, 'w:gridSpan');
        const gridSpan = gridSpanNode ? poAttr(gridSpanNode, '@_w:val') : undefined;
        const vMerge = poHas(tcPr, 'w:vMerge');

        const colSpan = gridSpan ? parseInt(gridSpan, 10) : 1;
        if (colSpan > 1 || vMerge) isComplex = true;

        const cellInlines: InlineNode[] = [];
        const pNodes = poAll(tcChildren, 'w:p');

        for (const p of pNodes) {
          const parsedP = this.parseParagraph(p['w:p'], undefined, stylesMap, relsMap, imagesMap, footnotesMap, stats);
          const pList = Array.isArray(parsedP) ? parsedP : [parsedP];
          for (const item of pList) {
            if (item && 'children' in item && Array.isArray(item.children)) {
              cellInlines.push(...(item.children as InlineNode[]));
            }
          }
        }

        cells.push({
          type: 'table_cell',
          children: cellInlines,
          colSpan,
          isHeader: rIdx === 0,
        });
      });

      rows.push({
        type: 'table_row',
        cells,
      });
    });

    const headers = rows.length > 0 ? rows[0] : undefined;
    const bodyRows = rows.length > 1 ? rows.slice(1) : [];

    return {
      type: 'table',
      headers,
      rows: bodyRows,
      isComplex,
    };
  }

  private associateCaptions(nodes: ASTNode[], imagesMap: Map<string, ImageNode>): void {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.type === 'image') {
        // Look ahead for adjacent paragraph with caption
        if (i + 1 < nodes.length) {
          const nextNode = nodes[i + 1];
          if (nextNode.type === 'paragraph') {
            const text = nextNode.children.map((c) => c.text || '').join('');
            if (this.isCaptionText(text, nextNode.style)) {
              node.caption = text;
            }
          }
        }
        // Look behind if ahead was empty
        if (!node.caption && i > 0) {
          const prevNode = nodes[i - 1];
          if (prevNode.type === 'paragraph') {
            const text = prevNode.children.map((c) => c.text || '').join('');
            if (this.isCaptionText(text, prevNode.style)) {
              node.caption = text;
            }
          }
        }
      }
    }
  }

  private isCaptionText(text: string, styleName?: string): boolean {
    if (styleName?.toLowerCase().includes('caption')) return true;
    const captionPattern = /^(gambar|figure|fig\.|image)\s*\d+/i;
    return captionPattern.test(text.trim());
  }
}

function pathBasename(p: string): string {
  return p.split('/').pop()?.split('\\').pop() || 'image.png';
}
