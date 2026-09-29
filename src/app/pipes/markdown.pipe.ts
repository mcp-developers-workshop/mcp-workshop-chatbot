import { Pipe, PipeTransform } from '@angular/core';

const ITEM_RE = /^(\s*)(?:([-*+])|(\d{1,9})[.)])\s+(.*)$/;
const FENCE_RE = /^\s*```(\w*)\s*$/;
const HEADING_RE = /^(#{1,6})\s+(.*)$/;
const RULE_RE = /^\s*(?:-\s*){3,}$|^\s*(?:\*\s*){3,}$|^\s*(?:_\s*){3,}$/;
const QUOTE_RE = /^\s*>\s?(.*)$/;
const TABLE_SEP_RE = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?\s*$/;
const SAFE_URL_RE = /^(?:https?:\/\/|mailto:|tel:|\/|#)/i;

/**
 * Renders a Markdown subset (headings, lists, tables, code, emphasis, links)
 * as HTML. The source is HTML-escaped before any tags are added, and the
 * result still passes through Angular's sanitizer via [innerHTML].
 */
@Pipe({ name: 'markdown' })
export class MarkdownPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }
    return this.renderBlocks(value.replace(/\r\n?/g, '\n').split('\n'));
  }

  private renderBlocks(lines: string[]): string {
    const html: string[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      if (/^\s*$/.test(line)) {
        i++;
        continue;
      }

      const fence = FENCE_RE.exec(line);
      if (fence) {
        const body: string[] = [];
        i++;
        while (i < lines.length && !FENCE_RE.test(lines[i])) {
          body.push(lines[i]);
          i++;
        }
        i++; // closing fence
        html.push(`<pre><code>${this.escape(body.join('\n'))}</code></pre>`);
        continue;
      }

      if (RULE_RE.test(line)) {
        html.push('<hr>');
        i++;
        continue;
      }

      const heading = HEADING_RE.exec(line);
      if (heading) {
        const level = heading[1].length;
        html.push(`<h${level}>${this.inline(heading[2])}</h${level}>`);
        i++;
        continue;
      }

      if (ITEM_RE.test(line)) {
        const list = this.parseList(lines, i);
        html.push(list.html);
        i = list.next;
        continue;
      }

      if (QUOTE_RE.test(line)) {
        const body: string[] = [];
        while (i < lines.length && QUOTE_RE.test(lines[i])) {
          body.push(QUOTE_RE.exec(lines[i])![1]);
          i++;
        }
        html.push(`<blockquote>${this.renderBlocks(body)}</blockquote>`);
        continue;
      }

      if (line.includes('|') && i + 1 < lines.length && TABLE_SEP_RE.test(lines[i + 1])) {
        const table = this.parseTable(lines, i);
        html.push(table.html);
        i = table.next;
        continue;
      }

      const paragraph: string[] = [];
      while (i < lines.length && !this.isBlockStart(lines, i)) {
        paragraph.push(this.inline(lines[i].trim()));
        i++;
      }
      html.push(`<p>${paragraph.join('<br>')}</p>`);
    }

    return html.join('');
  }

  /** True when the line ends the current paragraph by opening another block. */
  private isBlockStart(lines: string[], i: number): boolean {
    const line = lines[i];
    return (
      /^\s*$/.test(line) ||
      FENCE_RE.test(line) ||
      RULE_RE.test(line) ||
      HEADING_RE.test(line) ||
      ITEM_RE.test(line) ||
      QUOTE_RE.test(line) ||
      (line.includes('|') && i + 1 < lines.length && TABLE_SEP_RE.test(lines[i + 1]))
    );
  }

  private parseList(lines: string[], start: number): { html: string; next: number } {
    const first = ITEM_RE.exec(lines[start])!;
    const indent = first[1].length;
    const ordered = !!first[3];
    const tag = ordered ? 'ol' : 'ul';
    const startAttr = ordered && first[3] !== '1' ? ` start="${parseInt(first[3], 10)}"` : '';

    const items: string[] = [];
    let buffer: string[] = [];
    let open = false;
    let i = start;

    const flush = () => {
      if (open) {
        items.push(`<li>${buffer.join('')}</li>`);
        buffer = [];
        open = false;
      }
    };

    while (i < lines.length) {
      const line = lines[i];

      if (/^\s*$/.test(line)) {
        let j = i;
        while (j < lines.length && /^\s*$/.test(lines[j])) {
          j++;
        }
        const next = j < lines.length ? ITEM_RE.exec(lines[j]) : null;
        const continues = next ? next[1].length >= indent : false;
        if (!continues) {
          break;
        }
        i = j;
        continue;
      }

      const item = ITEM_RE.exec(line);
      if (item) {
        const itemIndent = item[1].length;
        if (itemIndent < indent) {
          break;
        }
        if (itemIndent > indent && open) {
          const nested = this.parseList(lines, i);
          buffer.push(nested.html);
          i = nested.next;
          continue;
        }
        if (!!item[3] !== ordered) {
          break;
        }
        flush();
        open = true;
        buffer.push(this.inline(item[4]));
        i++;
        continue;
      }

      if (!open) {
        break;
      }
      buffer.push(`<br>${this.inline(line.trim())}`);
      i++;
    }

    flush();
    return { html: `<${tag}${startAttr}>${items.join('')}</${tag}>`, next: i };
  }

  private parseTable(lines: string[], start: number): { html: string; next: number } {
    const cells = (line: string) =>
      line
        .trim()
        .replace(/^\||\|$/g, '')
        .split('|')
        .map(cell => this.inline(cell.trim()));

    const head = cells(lines[start]);
    const body: string[][] = [];
    let i = start + 2; // header + separator

    while (i < lines.length && lines[i].includes('|') && !/^\s*$/.test(lines[i])) {
      body.push(cells(lines[i]));
      i++;
    }

    const headRow = `<tr>${head.map(c => `<th>${c}</th>`).join('')}</tr>`;
    const bodyRows = body
      .map(row => `<tr>${row.map(c => `<td>${c}</td>`).join('')}</tr>`)
      .join('');

    return {
      html: `<table><thead>${headRow}</thead><tbody>${bodyRows}</tbody></table>`,
      next: i
    };
  }

  private inline(text: string): string {
    const codes: string[] = [];

    // Pull code spans out first so their contents are left untouched.
    let out = this.escape(text).replace(/`([^`]+)`/g, (_match, code: string) => {
      codes.push(code);
      return `\u0000${codes.length - 1}\u0000`;
    });

    out = out
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (match, label: string, url: string) =>
        SAFE_URL_RE.test(url)
          ? `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`
          : match
      )
      .replace(/(\*\*|__)(?=\S)([\s\S]*?\S)\1/g, '<strong>$2</strong>')
      .replace(/(^|[^*\w])\*(?=\S)([^*]*?\S)\*/g, '$1<em>$2</em>')
      .replace(/(^|[^_\w])_(?=\S)([^_]*?\S)_/g, '$1<em>$2</em>')
      .replace(/~~(?=\S)([\s\S]*?\S)~~/g, '<del>$1</del>');

    return out.replace(/\u0000(\d+)\u0000/g, (_match, index: string) => `<code>${codes[+index]}</code>`);
  }

  private escape(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
