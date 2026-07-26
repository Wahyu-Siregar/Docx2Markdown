import type {
  DocumentAST,
  ASTNode,
  HeadingNode,
  ParagraphNode,
  ListNode,
  TableNode,
  TableRowNode,
  TableCellNode,
  ImageNode,
  InlineNode,
  QuoteNode,
  CodeBlockNode,
  FootnoteNode,
  ConversionWarning,
} from '../types/ast.ts';
import type { ConversionConfig } from '../types/config.ts';
import type { ProcessedImageResult } from './imageProcessor.ts';

export interface RenderResult {
  markdown: string;
  warnings: ConversionWarning[];
}

export class MarkdownRenderer {
  public static render(
    ast: DocumentAST,
    processedImages: Map<string, ProcessedImageResult>,
    config: ConversionConfig
  ): RenderResult {
    const warnings: ConversionWarning[] = [];
    const lines: string[] = [];

    // Optional Table of Contents
    if (config.includeTableOfContents) {
      const tocLines = MarkdownRenderer.generateTOC(ast.nodes);
      if (tocLines.length > 0) {
        lines.push('## Daftar Isi\n');
        lines.push(...tocLines);
        lines.push('\n---\n');
      }
    }

    let lastHeadingLevel = 0;

    for (let i = 0; i < ast.nodes.length; i++) {
      const node = ast.nodes[i];

      if (node.type === 'heading') {
        const hNode = node as HeadingNode;
        if (lastHeadingLevel > 0 && hNode.level > lastHeadingLevel + 1) {
          warnings.push({
            code: 'HEADING_LEVEL_JUMP',
            message: `Heading level melompat dari H${lastHeadingLevel} ke H${hNode.level}`,
            location: `Heading "${MarkdownRenderer.renderInlines(hNode.children)}"`,
            suggestion: 'Pertimbangkan untuk menyusun hierarki heading secara berurutan.',
          });
        }
        lastHeadingLevel = hNode.level;
        lines.push(MarkdownRenderer.renderHeading(hNode));
      } else if (node.type === 'paragraph') {
        lines.push(MarkdownRenderer.renderParagraph(node as ParagraphNode));
      } else if (node.type === 'list') {
        lines.push(MarkdownRenderer.renderList(node as ListNode));
      } else if (node.type === 'table') {
        const tNode = node as TableNode;
        const renderedTbl = MarkdownRenderer.renderTable(tNode, config, warnings);
        lines.push(renderedTbl);
      } else if (node.type === 'image') {
        const imgNode = node as ImageNode;
        const imgRes = processedImages.get(imgNode.id);
        if (imgRes) {
          if (imgRes.warning) {
            warnings.push({
              code: 'IMAGE_BASE64_LARGE',
              message: imgRes.warning,
              location: imgRes.filename || imgNode.originalFilename,
            });
          }
          if (imgRes.markdownRef) {
            lines.push(`\n${imgRes.markdownRef}\n`);
          }
        }
      } else if (node.type === 'quote') {
        lines.push(MarkdownRenderer.renderQuote(node as QuoteNode));
      } else if (node.type === 'code_block') {
        lines.push(MarkdownRenderer.renderCodeBlock(node as CodeBlockNode));
      } else if (node.type === 'page_break') {
        if (config.pageBreakMode === 'horizontal-rule') {
          lines.push('\n---\n');
        } else if (config.pageBreakMode === 'comment') {
          lines.push('\n<!-- pagebreak -->\n');
        }
      }
    }

    // Render Footnotes at the end
    if (ast.footnotes.size > 0) {
      lines.push('\n---\n');
      ast.footnotes.forEach((fn) => {
        const content = fn.children
          .map((c) => (c.type === 'paragraph' ? MarkdownRenderer.renderInlines((c as ParagraphNode).children) : ''))
          .join(' ');
        lines.push(`[^${fn.number}]: ${content}`);
      });
    }

    let markdownText = lines.join('\n\n');

    // Clean multiple empty lines
    markdownText = markdownText.replace(/\n{3,}/g, '\n\n');

    // Handle line endings
    if (config.lineEnding === 'crlf') {
      markdownText = markdownText.replace(/\r?\n/g, '\r\n');
    } else if (config.lineEnding === 'lf') {
      markdownText = markdownText.replace(/\r?\n/g, '\n');
    }

    return {
      markdown: markdownText,
      warnings,
    };
  }

  private static generateTOC(nodes: ASTNode[]): string[] {
    const lines: string[] = [];
    nodes.forEach((n) => {
      if (n.type === 'heading') {
        const h = n as HeadingNode;
        if (h.level <= 3) {
          const text = MarkdownRenderer.renderInlines(h.children);
          const slug = text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
          const indent = '  '.repeat(h.level - 1);
          lines.push(`${indent}- [${text}](#${slug})`);
        }
      }
    });
    return lines;
  }

  private static renderHeading(node: HeadingNode): string {
    const text = MarkdownRenderer.renderInlines(node.children);
    if (node.level <= 6) {
      const hashes = '#'.repeat(node.level);
      return `${hashes} ${text}`;
    }
    return `**${text}**`;
  }

  private static renderParagraph(node: ParagraphNode): string {
    return MarkdownRenderer.renderInlines(node.children);
  }

  private static escapeText(str: string): string {
    if (!str) return '';
    return str.replace(/(\[\^\d+\])|([\\*_~[\]#>`])/g, (match, fnRef, charToEscape) => {
      if (fnRef) return fnRef;
      return '\\' + charToEscape;
    });
  }

  private static renderInlines(inlines: InlineNode[]): string {
    return inlines
      .map((item) => {
        if (item.type === 'text') return MarkdownRenderer.escapeText(item.text || '');
        if (item.type === 'bold') {
          const content = item.children ? MarkdownRenderer.renderInlines(item.children) : MarkdownRenderer.escapeText(item.text || '');
          return `**${content}**`;
        }
        if (item.type === 'italic') {
          const content = item.children ? MarkdownRenderer.renderInlines(item.children) : MarkdownRenderer.escapeText(item.text || '');
          return `*${content}*`;
        }
        if (item.type === 'strikethrough') {
          const content = item.children ? MarkdownRenderer.renderInlines(item.children) : MarkdownRenderer.escapeText(item.text || '');
          return `~~${content}~~`;
        }
        if (item.type === 'underline') {
          const content = item.children ? MarkdownRenderer.renderInlines(item.children) : MarkdownRenderer.escapeText(item.text || '');
          return `<u>${content}</u>`;
        }
        if (item.type === 'code') {
          const text = item.text || '';
          const maxBackticks = (text.match(/`+/g) || []).reduce((max, cur) => Math.max(max, cur.length), 0);
          const fence = '`'.repeat(maxBackticks + 1);
          const padding = text.startsWith('`') || text.endsWith('`') ? ' ' : '';
          return `${fence}${padding}${text}${padding}${fence}`;
        }
        if (item.type === 'subscript') return `<sub>${MarkdownRenderer.escapeText(item.text || '')}</sub>`;
        if (item.type === 'superscript') return `<sup>${MarkdownRenderer.escapeText(item.text || '')}</sup>`;
        if (item.type === 'link') {
          const content = item.children && item.children.length > 0
            ? MarkdownRenderer.renderInlines(item.children)
            : MarkdownRenderer.escapeText(item.text || '');
          return `[${content}](${item.url})`;
        }
        return MarkdownRenderer.escapeText(item.text || '');
      })
      .join('');
  }

  private static renderList(node: ListNode): string {
    return node.items
      .map((item) => {
        const indent = '  '.repeat(item.level);
        const text = MarkdownRenderer.renderInlines(item.children);

        let prefix = '- ';
        if (node.ordered) prefix = '1. ';
        if (item.checked !== undefined) {
          prefix = item.checked ? '- [x] ' : '- [ ] ';
        }

        return `${indent}${prefix}${text}`;
      })
      .join('\n');
  }

  private static renderTable(node: TableNode, config: ConversionConfig, warnings: ConversionWarning[]): string {
    if (node.isComplex && config.complexTableFallback === 'html') {
      warnings.push({
        code: 'COMPLEX_TABLE_HTML_FALLBACK',
        message: 'Tabel memiliki sel yang digabung (merged cells) sehingga dikonversi ke HTML table.',
        suggestion: 'Format tabel HTML digunakan untuk menjaga tata letak sel.',
      });
      return MarkdownRenderer.renderHtmlTable(node);
    }

    const allRows = [node.headers, ...node.rows].filter(Boolean) as TableRowNode[];
    if (allRows.length === 0) return '';

    // Expand colSpan: a cell with colSpan N becomes N cells (original + N-1 empty)
    const expandRow = (row: TableRowNode): string[] => {
      const cells: string[] = [];
      for (const c of row.cells) {
        cells.push(MarkdownRenderer.renderInlines(c.children).replace(/\|/g, '\\|'));
        const span = (c.colSpan && c.colSpan > 1) ? c.colSpan - 1 : 0;
        for (let s = 0; s < span; s++) cells.push('');
      }
      return cells;
    };

    const expanded = allRows.map(expandRow);
    // Determine column count from the widest row
    const colCount = Math.max(...expanded.map((r) => r.length));

    // Pad short rows, trim long rows
    const normalize = (cells: string[]): string[] => {
      if (cells.length < colCount) return [...cells, ...Array(colCount - cells.length).fill('')];
      return cells.slice(0, colCount);
    };

    if (node.isComplex) {
      warnings.push({
        code: 'COMPLEX_TABLE_TEXT_FALLBACK',
        message: 'Tabel memiliki merged cells yang diratakan (flattened) ke pipe table biasa. Informasi merge hilang.',
      });
    }

    const rows: string[] = [];
    const headerCells = normalize(expanded[0]);
    rows.push(`| ${headerCells.join(' | ')} |`);
    rows.push(`| ${headerCells.map(() => '---').join(' | ')} |`);

    for (let i = 1; i < expanded.length; i++) {
      const dataCells = normalize(expanded[i]);
      rows.push(`| ${dataCells.join(' | ')} |`);
    }

    return rows.join('\n');
  }

  private static renderHtmlTable(node: TableNode): string {
    let html = '<table>\n';
    if (node.headers) {
      html += '  <thead>\n    <tr>\n';
      node.headers.cells.forEach((c) => {
        const cs = c.colSpan && c.colSpan > 1 ? ` colspan="${c.colSpan}"` : '';
        html += `      <th${cs}>${MarkdownRenderer.renderInlines(c.children)}</th>\n`;
      });
      html += '    </tr>\n  </thead>\n';
    }

    html += '  <tbody>\n';
    node.rows.forEach((r) => {
      html += '    <tr>\n';
      r.cells.forEach((c) => {
        const cs = c.colSpan && c.colSpan > 1 ? ` colspan="${c.colSpan}"` : '';
        html += `      <td${cs}>${MarkdownRenderer.renderInlines(c.children)}</td>\n`;
      });
      html += '    </tr>\n';
    });
    html += '  </tbody>\n</table>';
    return html;
  }

  private static renderQuote(node: QuoteNode): string {
    const prefix = '> '.repeat(node.level);
    const content = node.children
      .map((c) => (c.type === 'paragraph' ? MarkdownRenderer.renderInlines((c as ParagraphNode).children) : ''))
      .join('\n');
    return content
      .split('\n')
      .map((line) => `${prefix}${line}`)
      .join('\n');
  }

  private static renderCodeBlock(node: CodeBlockNode): string {
    const lang = node.language || '';
    const maxBackticks = (node.code.match(/`+/g) || []).reduce((max, cur) => Math.max(max, cur.length), 0);
    const fence = '`'.repeat(Math.max(3, maxBackticks + 1));
    return `${fence}${lang}\n${node.code}\n${fence}`;
  }
}
