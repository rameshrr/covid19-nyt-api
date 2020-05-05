const fs = require('fs');
const path = require('path');

const axios = require('axios');
const parse = require('csv-parse');

const outputPath = path.resolve(__dirname, '../docs');

class CsvParser {
  constructor(ipSrc, path, opPath, { skipFirstLine } = {}) {
    this.canProcess = false;
    this.inputSource = ipSrc;
    this.csvPath = path;
    this.outputPath = opPath || outputPath;

    this.csvData = null;
    this.jsonData = null;
    this.processedData = {};
    this.skipFirstLine = skipFirstLine || true;
  }

  async process() {
    try {
      await this.fetch();
      await this.doParse();

      this.canProcess = true;
    } catch (err) {
      /// TODO: throw err here
      console.error(err);
      this.canProcess = false;
    }
  }

  async fetch() {
    if (!this.inputSource) {
      throw new Error('Invalid input source');
    }

    if (!this.csvPath) {
      throw new Error('Invalid input path');
    }

    if (this.inputSource === 'FILE') {
      this.csvData = await fs.promises.readFile(this.csvPath, 'utf8');
      return;
    }

    /// considering this.inputSource is API URL
    const response = await axios.get(this.csvPath);
    this.csvData = response.data;
  }

  async doParse() {
    if (!this.csvData || this.csvData.length === 0) {
      throw new Error('Invalid csv Data');
    }

    this.jsonData = [];

    const parser = parse(this.csvData, {
      trim: true,
      columns: true,
      skip_empty_lines: true,
    });

    parser.on('readable', () => {
      let record;

      while (record = parser.read()) {
        if (record && typeof record === 'object') {
          this.jsonData.push({
            state: record.state,
            date: record.date,
            confirmed: record.cases,
            recovered: record.recovered || 0,
            deaths: record.deaths,
          });
        }
      }
    });

    parser.on('error', (err) => {
      throw err;
    });

    parser.on('end', async () => {
      console.log('DONE');
      await this.writeFile();
    });
  }

  async writeFile() {
    if (!this.jsonData || !this.jsonData.length) {
      throw new Error('Unable to process');
    }

    const regions = [];
    const hasVisited = {};

    for (let i = 0; i < this.jsonData.length; i++) {
      if (!hasVisited[this.jsonData[i].state]) {
        regions.push(this.jsonData[i].state);
        hasVisited[this.jsonData[i].state] = true;
      }
    }

    this.processedData.schema = {
    };

    this.processedData.regions = regions;
    this.processedData.data = {};

    for (let i = 0; i < this.jsonData.length; i++) {
      /// TODO: Process
    }

    const jsonData = JSON.stringify({
      version: '0.1',
      description: 'COVID-19 report from NYT',
      data: this.jsonData,
    });

    try {
      if (!fs.existsSync(this.outputPath)) {
        fs.mkdirSync(this.outputPath);
      }

      await fs.promises.writeFile(path.resolve(this.outputPath, 'timeseries.json'), jsonData);
    } catch (err) {
      console.error(err);
    }
  }
}

module.exports = CsvParser;
