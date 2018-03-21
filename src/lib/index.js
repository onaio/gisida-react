import fs from 'fs';
import App from './components/App/App';
import TitleBar from './components/TitleBar/TitleBar';
import Menu from './components/Menu/Menu';
import Map from './components/Map/Map';
import StyleSelector from './components/StyleSelector/StyleSelector';
import Legend from './components/Legend/Legend';
import SummaryChart from './components/Charts/SummaryChart';
import DetailView from './components/DetailView/DetailView';

// Paths for sub-module components
const FilterSelectorPath = './submodules/gisida-react-private/src/components/FilterSelector/FilterSelector';
const TimeSeriesSliderPath = './submodules/gisida-react-private/src/components/TimeSeriesSlider/TimeSeriesSlider';
const FilterPath = './submodules/gisida-react-private/src/components/Filter/Filter';

// Assign component var if submodule paths found
let FilterSelector;
let TimeSeriesSlider;
let Filter;

if (fs.existsSync(FilterSelectorPath)) {
  FilterSelector = require(`${FilterSelectorPath}`);
} else if (fs.existsSync(`${TimeSeriesSliderPath}`)) {
  TimeSeriesSlider(require(TimeSeriesSliderPath));
} else if (fs.existsSync(Filter)) {
  Filter = require(`${FilterPath}`);
}

export {
  App,
  TitleBar,
  Menu,
  Map,
  StyleSelector,
  Legend,
  SummaryChart,
  DetailView,
  // Submodule components
  Filter,
  FilterSelector,
  TimeSeriesSlider,
}
