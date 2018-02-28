import React from 'react';
import renderer from 'react-test-renderer';
import ReactDOM from 'react-dom';
import App from '../../../../src/lib/components/App/App';

describe('App', () => {
  it('component renders correctly', () => {
    const div = document.createElement('div');
    ReactDOM.render(<App />, div);
    
  });

  it('App renders child components', () => {
    const component = renderer.create(<App />);
    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });
});
