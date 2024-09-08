import { Plugin } from 'obsidian';

// stole code from https://docs.obsidian.md/Plugins/Editor/Markdown+post+processing#Post-process+Markdown+code+blocks

class CsvParser {
  constructor(source, delimiter = ',') {
    this.source = source;
    this.delimiter = delimiter;
  }

  // Split a CSV row taking care of escaping quotes and delimiters
  parseRow(row) {
    const result = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      const nextChar = row[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped double-quote
          currentField += '"';
          i++;
        } else {
          // Toggle inQuotes
          inQuotes = !inQuotes;
        }
      } else if (char === this.delimiter && !inQuotes) {
        // Field complete
        result.push(currentField);
        currentField = '';
      } else {
        currentField += char;
      }
    }

    // Push the last field
    result.push(currentField);
    return result;
  }

  // Split source text into rows
  parse() {
    const rows = this.source.split(/\r\n|\n|\r/).filter(row => row.length > 0);
    return rows.map(row => this.parseRow(row));
  }
}

export default class CsvCodeBlockPlugin extends Plugin {
  async onload() {
    this.registerMarkdownCodeBlockProcessor("csv", (source, el, ctx) => {
      const parser = new CsvParser(source);
      const rows = parser.parse();

      const table = el.createEl("table");
      const body = table.createEl("tbody");

      for (let i = 0; i < rows.length; i++) {
        const row = body.createEl("tr");

        for (let j = 0; j < rows[i].length; j++) {
          row.createEl("td", { text: rows[i][j] });
        }
      }
    });

    this.registerMarkdownCodeBlockProcessor("tsv", (source, el, ctx) => {
      const parser = new CsvParser(source, '\u0009');
      const rows = parser.parse();

      const table = el.createEl("table");
      const body = table.createEl("tbody");

      for (let i = 0; i < rows.length; i++) {
        const row = body.createEl("tr");

        for (let j = 0; j < rows[i].length; j++) {
          row.createEl("td", { text: rows[i][j] });
        }
      }
    });
  }
}
