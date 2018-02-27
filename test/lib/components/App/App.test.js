import React from 'react';
import renderer from 'react-test-renderer';
import ReactDOM from 'react-dom';
import App from '../../../../src/lib/components/App/App';

describe('App', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<App />, div);
    
  });

  it('App renders child components', () => {
    const component = renderer.create(<App />);
    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });
});
