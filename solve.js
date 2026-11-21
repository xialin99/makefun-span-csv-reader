/** Parse a CSV string using the contest's record and error recovery rules. */
export function run(input) {
  const text = String(input.text);
  const header = input.header === true;
  const end = text.length;
  const rows = [];
  const errors = [];
  let columns = null;
  let width = 0;
  let offset = text.charCodeAt(0) === 0xfeff ? 1 : 0;
  let line = 1;

  while (offset < end) {
    const first = text.charCodeAt(offset);
    if (first === 10 || (first === 13 && text.charCodeAt(offset + 1) === 10)) {
      offset += first === 10 ? 1 : 2;
      line++;
      continue;
    }

    const recordLine = line;
    const row = header && columns === null ? null : rows.length;
    const fields = [];
    let quoted;
    let delimiter;
    do {
      quoted = text.charCodeAt(offset) === 34;
      let value = '';
      let closed = false;
      if (quoted) {
        const opening = offset++;
        let start = offset;
        let newlines = 0;
        while (offset < end) {
          const code = text.charCodeAt(offset);
          if (code === 34) {
            value += text.slice(start, offset++);
            if (text.charCodeAt(offset) !== 34) {
              closed = true;
              break;
            }
            value += '"';
            start = ++offset;
            continue;
          }
          if (code === 13) {
            value += text.slice(start, offset) + '\n';
            offset += text.charCodeAt(offset + 1) === 10 ? 2 : 1;
            start = offset;
            newlines++;
            continue;
          }
          if (code === 10) newlines++;
          offset++;
        }
        if (closed) {
          line += newlines;
        } else {
          // Re-read the opening quote as bare text. The speculative line count is discarded.
          offset = opening;
          value = '';
          errors.push({ code: 'unterminated_quote', line: recordLine, row });
        }
      }

      // Scan whole spans. Only dropped CRs need multiple slices per bare field.
      let start = offset;
      const prefixLength = value.length;
      for (;;) {
        while (offset < end) {
          delimiter = text.charCodeAt(offset);
          if (delimiter === 44 || delimiter === 10 || delimiter === 13) break;
          offset++;
        }
        value += text.slice(start, offset);
        if (offset === end || delimiter !== 13 || text.charCodeAt(offset + 1) === 10) break;
        errors.push({ code: 'stray_cr', line: recordLine, row });
        start = ++offset;
      }
      if (closed && value.length > prefixLength) {
        errors.push({ code: 'quote_junk', line: recordLine, row });
      }
      fields.push(value);

      if (offset === end) {
        break;
      } else if (delimiter === 44) {
        offset++;
      } else {
        offset += delimiter === 13 ? 2 : 1;
        line++;
      }
    } while (delimiter === 44);

    if (fields.length === 1 && fields[0] === '' && !quoted) continue;
    if (width === 0) width = fields.length;
    if (row === null) {
      columns = fields;
      continue;
    }
    if (fields.length < width) {
      errors.push({ code: 'short_row', line: recordLine, row, fields: fields.length });
      while (fields.length < width) fields.push('');
    } else if (fields.length > width) {
      errors.push({ code: 'long_row', line: recordLine, row, extra: fields.splice(width) });
    }
    rows.push(fields);
  }
  return { columns: header ? (columns ?? []) : null, rows, errors };
}
