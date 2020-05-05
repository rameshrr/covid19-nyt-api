const path = require('path');
const CsvParser = require('../src/CsvParser');

const csvParser = new CsvParser('FILE', path.resolve(__dirname, './data/us-states.csv'));
// const csvParser = new CsvParser('API', 'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv');
csvParser.process();
