const path = require('path');
const CsvParser = require('../src/CsvParser');

const WORKSPACE = process.env.GITHUB_WORKSPACE || path.resolve(__dirname, '../test/');
const DATA_REPO = 'data';
const MAIN_REPO = 'main';
const CSV_NAME = 'us-states.csv';

const dataPath = path.join(
  WORKSPACE,
  DATA_REPO,
  CSV_NAME,
);

const outputPath = path.join(
  WORKSPACE,
  MAIN_REPO,
  'docs',
);

async function execute() {
  const csvParser = new CsvParser('FILE', dataPath, outputPath);
  await csvParser.process();
}

execute();
