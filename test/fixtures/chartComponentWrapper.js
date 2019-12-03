import React from 'react';

const body = document.body;
body.insertAdjacentHTML('afterbegin', '<div id="chart-test"></div>');
const chartTestElement = document.getElementById('chart-test');

export const wrapper =(Component, action, props={}) => action(
	<Component 
		{...props}
	/>,
	{
		attachTo: chartTestElement 
	}
);


export const detach = (compWrapper) => {
    compWrapper.detach();
	body.removeChild(chartTestElement);
}