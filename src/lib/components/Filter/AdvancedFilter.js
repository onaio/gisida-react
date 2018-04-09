import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import QuantColumnChart from './../Charts/QuantColumnChart';

const mapStateToProps = (state, ownProps) => {
  return {
  }
}

export class AdvancedFilter extends React.Component {
  // helper funciton for finding AND intersection
  // todo - move to includes file?
  getObectIntersect(n, m) {
    // create set of unique keys from both option objects
    const keys = [...new Set([...Object.keys(n), ...Object.keys(m)])];
    const nextOptionsMap = {};
    let key;

    for (let i = 0; i < keys.length; i += 1) {
      key = keys[i];
      if (n[key] && m[key]) nextOptionsMap[key] = n[key];
    }

    return nextOptionsMap;
  }

  constructor(props) {
    super(props);

    const { filterKey, options, queries, dataType } = this.props;
    const isQuant = dataType === 'quantitative';
    this.state = {
      queries: queries && queries.length ? queries : [{
        isOR: true,
        val: isQuant ? {
          min: Math.min(...options),
          max: Math.max(...options),
        } : '',
        control: isQuant ? 'between' : 'contains',
      }],
      isQuant,
      filterKey,
      prevOptions: options,
      logicalOrSelected: true,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.queries) {
      this.setState({ queries: nextProps.queries });
    }
  }

  getQueryMatches(queries, q) {
    const { isQuant, prevOptions } = this.state;
    const query = queries[q];
    const qContr = query.control;
    const qValue = query.val;
    const isOR = q ? query.isOR : false;
    const options = !q || isOR
      ? isQuant
        ? [...new Set(prevOptions)]
        : Object.keys(prevOptions)
      : queries[q - 1].matches;

    const isEmpty = !isQuant
      ? query.val === ''
      : query.val.min === Math.min(...options) && query.val.max === Math.max(...options);
    if (isEmpty) return options;

    const matches = [];
    let optionKey;
    let hasCount;
    let isMatched = false;
    for (let i = 0; i < options.length; i += 1) {
      optionKey = options[i];
      hasCount = prevOptions[optionKey] && prevOptions[optionKey].count;
      switch (qContr) {
        case 'between':
        case 'not between':
          isMatched = options[i] >= qValue.min && options[i] <= qValue.max;
          if (qContr !== 'between') isMatched = !isMatched;
          break;
        case 'less than':
          isMatched = options[i] < qValue.max;
          break;
        case 'greater than': 
          isMatched = options[i] > qValue.min;
          break;

        case 'contains':
        case 'does not contain': {
          isMatched = hasCount
            ? (optionKey.toLowerCase()).indexOf(qValue.toLowerCase()) !== -1
            : false;
          if (hasCount && qContr !== 'contains') isMatched = !isMatched;
          break;
        }
        case 'starts with':
        case 'does not start with':
          isMatched = hasCount
            ? (optionKey.toLowerCase()).indexOf(qValue.toLowerCase()) === 0
            : false;
          if (hasCount && qContr !== 'starts with') isMatched = !isMatched;
          break;
        case 'is':
        case 'is not': {
          isMatched = hasCount
            ? optionKey.toLowerCase() === qValue.toLowerCase()
            : false;
          if (hasCount && qContr !== 'is') isMatched = !isMatched;
          break;
        }

        default:
          isMatched = false; // this pretty much shouldn't happen
          break;
      }

      if (isMatched) {
        matches.push(options[i]);
      }
    }

    return matches;
  }

  reduceQueryMatches(queries) {
    const { isQuant, prevOptions } = this.state;
    let q;
    let query;
    const nextMatches = [];

    // loop through all queries
    for (q = 0; q < queries.length; q += 1) {
      query = queries[q];
      if (query.matches) {
        // handle combing of queries based on logical operator
        // AND operations are condensed into a single set of passing options
        // OR operations create a new set of passing options
        // eg - [(conditionA1, conditionB1, ..., conditionN1), (conditionA2, ...), ...]
        if (!q || query.isOR) {
          nextMatches.push(query.matches);
        } else if (query.matches) {
          nextMatches[nextMatches.length - 1] = AdvancedFilter.getObectIntersect(
            nextMatches[nextMatches.length - 1],
            query.matches
          );
        }
      }
    }

    // reduce all matching sets into one set
    let reducedMatches = [];
    for (q = 0; q < nextMatches.length; q += 1) {
      reducedMatches = [...new Set([...reducedMatches, ...nextMatches[q]])];
    }

    return reducedMatches.length // check for matches
      ? reducedMatches // return matches
      : queries.length === 1 && (!isQuant // check for first and empty
        ? query.val === ''
        : query.val.min === Math.min(...prevOptions) && query.val.max === Math.max(...prevOptions))
      ? null // if first and empty, return null
      : []
    ;
  }

  onInputChange(e, q) {
    const nextQueries = [];
    const { queries, filterKey, isQuant } = this.state;
    let query;
    const isMin = e.target.placeholder === 'min';

    for (let i = 0; i < queries.length; i += 1) {
      query = queries[i];
      if (q === i) {
        nextQueries.push(Object.assign(
          {},
          query,
          {
            val: !isQuant ? e.target.value : {
              min: isMin ? Number(e.target.value) : queries[i].val.min,
              max: isMin ? queries[i].val.max : Number(e.target.value),
            },
          },
        ));
      } else {
        nextQueries.push(query);
      }
      nextQueries[i].matches = this.getQueryMatches(nextQueries, i);
    }

    const queriedOptionKeys = this.reduceQueryMatches(nextQueries);
    this.props.setFilterQueries(filterKey, nextQueries, queriedOptionKeys);
  }

  // todo - merge this with onInputChange
  onControlChange(e, q) {
    const nextQueries = [];
    const { queries, filterKey } = this.state;
    let query;

    for (let i = 0; i < queries.length; i += 1) {
      query = queries[i];
      if (q === i) {
        nextQueries.push(Object.assign(
          {},
          query,
          {
            control: e.target.value,
          },
        ));
      } else {
        nextQueries.push(query);
      }
      nextQueries[i].matches = this.getQueryMatches(nextQueries, i);
    }

    const queriedOptionKeys = this.reduceQueryMatches(nextQueries);
    this.props.setFilterQueries(filterKey, nextQueries, queriedOptionKeys);
  }

  onAddRemoveClick(e, q, doAdd) {
    e.preventDefault();
    const { queries, filterKey, isQuant } = this.state;
    const { options } = this.props;
    const nextQueries = [...queries];
    // const isLast = q === nextQueries.length - 1;

    if (doAdd) {
      nextQueries.splice(q + 1, 0, {
        isOR: false,
        val: isQuant ? {
          min: Math.min(...options),
          max: Math.max(...options),
        } : '',
        control: isQuant ? 'between' : 'contains',
      });
    } else {
      nextQueries.splice(q, 1);
    }

    if (!nextQueries.length) {
      nextQueries.push({
        isOR: false,
        val: isQuant ? {
          min: Math.min(...options),
          max: Math.max(...options),
        } : '',
        control: isQuant ? 'between' : 'contains',
      });
    }

    const queriedOptionKeys = this.reduceQueryMatches(nextQueries);
    this.props.setFilterQueries(filterKey, nextQueries, queriedOptionKeys);
  }

  toggleLogicalOperators(e, q) {
    // e.preventDefault();
    e.stopPropagation();
    const { queries, filterKey } = this.state;
    const nextQueries = [];
    // nextQueries[q].isOR = !nextQueries[q].isOR;

    for (let i = 0; i < queries.length; i += 1) {
      if (q === i) {
        nextQueries.push(Object.assign(
          {},
          queries[i],
          {
            isOR: !queries[i].isOR,
          }
        ));
      } else {
        nextQueries.push(queries[i]);
      }
      nextQueries[i].matches = this.getQueryMatches(nextQueries, i);
    }

    const queriedOptionKeys = this.reduceQueryMatches(nextQueries);
    this.props.setFilterQueries(filterKey, nextQueries, queriedOptionKeys);
  }

  buildQuantInputEl(query, q) {
    const { control, val } = query;
    const { options } = this.props;
    const min = Math.min(...options);
    const max = Math.max(...options);
    let inputEl;
    const datalistEl = (
      <datalist id={`${this.state.filterKey}-datalist`}>
        {[...new Set(options)].map((d, i)=> <option key={i}>{d}</option>)}
      </datalist>
    );

    switch (control) {
      case 'between':
      case 'not between':
        inputEl = (
          <div className="inputBetween">
            <label>Min: {val.min}</label>
            <input
              className="inputMin"
              type="range"
              placeholder="min"
              value={val.min}
              min={min}
              max={val.max}
              // step={1}
              list={`${this.state.filterKey}-datalist`}
              onChange={(e) => { this.onInputChange(e, q); }}
            />
            <br />
            <label>Max: {val.max}</label>
            <input
              className="inputMax"
              type="range"
              placeholder="max"
              value={val.max}
              min={val.min}
              max={max}
              // step={1}
              list={`${this.state.filterKey}-datalist`}
              onChange={(e) => { this.onInputChange(e, q); }}
            />
            {datalistEl}
          </div>
        );
        break;

      case 'less than':
        inputEl = (
          <div className="inputLessThan">
            <label>Less Than: {val.max}</label>
            <input
              className="inputMax"
              type="range"
              placeholder="max"
              value={val.max}
              min={val.min}
              max={max}
              // step={1}
              list={`${this.state.filterKey}-datalist`}
              onChange={(e) => { this.onInputChange(e, q); }}
            />
            {datalistEl}
          </div>
        );
        break;

      case 'greater than':
        inputEl = (
          <div className="inputBetween">
            <label>Greater Than: {val.min}</label>
            <input
              className="inputMin"
              type="range"
              placeholder="min"
              value={val.min}
              min={min}
              max={val.max}
              // step={1}
              list={`${this.state.filterKey}-datalist`}
              onChange={(e) => { this.onInputChange(e, q); }}
            />
            {datalistEl}
          </div>
        );
        break;
      default:
        break;
    }
    return inputEl;
  }

  render() {
    const { queries, isQuant } = this.state;
    const { options, queriedOptionKeys } = this.props;

    const queryEls = [];
    let query;
    let queryEl;
    let isClear = true;
    let controlSelectorEl;
    let inputEl;

    for (let q = 0; q < queries.length; q += 1) {
      query = queries[q];
      isClear = query.val === '';

      // Control Selector
      controlSelectorEl = isQuant ? (
        <select onChange={(e) => { this.onControlChange(e, q); }} role="button">
          <option label="between" selected="selected">between</option>
          <option label="not between" >not between</option>
          <option label="less than">less than</option>
          <option label="greater than">greater than</option>
        </select>
      ) : (
        <select onChange={(e) => { this.onControlChange(e, q); }} role="button">
          <option label="contains" selected="selected">contains</option>
          <option label="does not contain">does not contain</option>
          <option label="starts with">starts with</option>
          <option label="does not start with">does not start with</option>
          <option label="is">is</option>
          <option label="is not">is not</option>
        </select>
      );

      // Input
      inputEl = !isQuant ? (
        <input
          type="text"
          className="advanced-search"
          data-type="advanced-filter"
          // ref={(el) => { this[`searchEl`] = el; }}
          value={query.val}
          onChange={(e) => { this.onInputChange(e, q); }}
        />
      ) : this.buildQuantInputEl(query, q);

      queryEl = (
        <div className="advanced-controls" key={q}>
          { /* Logical Operator toggle */ }
          {q ? (
            <table>
              <tr>
                <td>And</td>
                <td>
                  <label
                    className="switch"
                    htmlFor="operator-toggle"
                  >
                    <input
                      type="checkbox"
                      id="operator-toggle"
                      className="operator-toggle"
                      checked={query.isOR}
                      onChange={(e) => { this.toggleLogicalOperators(e, q); }}
                    />
                    <span className="slider" />
                  </label>
                </td>
                <td>Or</td>
              </tr>
            </table>
            ) : ''}
          {controlSelectorEl}
          {inputEl}
          <div>
            { /* Add / Remove buttons */ }
            {q || queries.length > 1 ?
              <span
                // key={q}
                role="button"
                tabIndex="0"
                className="glyphicon glyphicon-minus"
                onClick={(e) => { this.onAddRemoveClick(e, q, false); }}
              />
            : ''}
            {!q || !isClear ?
              <span
                // key={q}
                role="button"
                tabIndex="0"
                className="glyphicon glyphicon-plus"
                onClick={(e) => { this.onAddRemoveClick(e, q, true); }}
              />
            : ''}
          </div>
        </div>
      );
      queryEls.push(queryEl);
    }

    return (
      <div className="advanced-controls-container">
        {isQuant ? <QuantColumnChart data={options} passing={queriedOptionKeys} /> : ''}
        {queryEls}
      </div>
    );
  }
}

AdvancedFilter.propTypes = {
  options: PropTypes.objectOf(PropTypes.any).isRequired,
  filterKey: PropTypes.string.isRequired,
  queries: PropTypes.arrayOf(PropTypes.any).isRequired,
  dataType: PropTypes.string.isRequired,
  setFilterQueries: PropTypes.func.isRequired,
};

export default connect(mapStateToProps)(AdvancedFilter);
