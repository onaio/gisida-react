
import $ from 'jquery';

const Enzyme = require('enzyme');
const EnzymeAdapter = require('enzyme-adapter-react-16');

// Setup enzyme's react adapter
Enzyme.configure({ adapter: new EnzymeAdapter() });

//add jquery symblo to global
global.$ = global.jQuery = $;

global.URL.createObjectURL = jest.fn(() => 'details');
