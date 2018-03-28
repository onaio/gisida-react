import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const mapStateToProps = (state, ownProps) => {
  return {
  }
}

export class AdvancedFilter extends React.Component {
  getQueriedOptionKeys(queries, prevOptions, isQuant) {
    // const { queries, prevOptions } = this.state;
    const nextOptions = [];
    let options = {}; // map iterated per query, reset to prevOptions for ORs
    let nextOptionKeys = [];
    let query;
    let optionKey = '';
    let isEmpty = true;
    let isOR = false;
    let qValue = '';
    let qContr;
    let i;
    let q;
    let isMatched;
    let nOptions;
    let mOptions;

    for (q = 0; q < queries.length; q += 1) {
      query = queries[q];
      qContr = query.control;
      qValue = query.val;
      isEmpty = query.val === '';
      isOR = q ? query.isOR : false;
      if (!q && isEmpty) break;

      /* Handle Individual Queries */
      options = q && !isOR
        ? nextOptions[nextOptions.length - 1]
        : isQuant ? prevOptions : Object.assign({}, prevOptions);

      nextOptions.push((isQuant ? [] : {}));
      // loop through all options
      if (isQuant) {
        for (i = 0; i < options.length; i += 1) {
          switch (qContr) {
            case 'between':
            case 'not between':
              isMatched = options[i] >= qValue.min && options[i] <= qValue.max;
              if (qContr !== 'between') isMatched = !isMatched;
              break;
            default:
              isMatched = false;
              break;
          }

          if (isMatched) {
            nextOptions[nextOptions.length - 1].push(options[i]);
          }
        }
      } else {
        nextOptionKeys = Object.keys(options);
        for (i = 0; i < nextOptionKeys.length; i += 1) {
          optionKey = nextOptionKeys[i];
          if (options[optionKey].count) {
            // determine option-query match based on control
            switch (qContr) {
              case 'contains':
              case 'does not contain': {
                isMatched = (optionKey.toLowerCase()).indexOf(qValue.toLowerCase()) !== -1;
                if (qContr !== 'contains') isMatched = !isMatched;
                break;
              }

              case 'starts with':
              case 'does not start with': {
                isMatched = (optionKey.toLowerCase()).indexOf(qValue.toLowerCase()) === 0;
                if (qContr !== 'starts with') isMatched = !isMatched;
                break;
              }

              case 'is':
              case 'is not': {
                isMatched = optionKey.toLowerCase() === qValue.toLowerCase();
                if (qContr !== 'is') isMatched = !isMatched;
                break;
              }

              default: {
                isMatched = false; // this pretty much shouldn't happen
                break;
              }
            }

            // add matched options to nextOptions
            if (isMatched) {
              nextOptions[nextOptions.length - 1][optionKey] =
                Object.assign({}, options[optionKey]);
            }
          }
        }
      }

      // handle combing of queries based on logical operator
      // And operations are condensed into a single set of passing options
      // Or operations create a new set of passing options
      // eg - [(conditionA1, conditionB1, ..., conditionN1), (conditionA2, ...), ...]
      if (q && !isOR) {
        // remove last query options results
        nOptions = nextOptions.pop();
        // define query results to merge into
        mOptions = nextOptions[nextOptions.length - 1];
        // evaluate query results from both to find overlap
        nextOptions[nextOptions.length - 1] = isQuant
          ? [...new Set([...nOptions, ...mOptions])]
          : this.getObectIntersect(nOptions, mOptions);
      }
    }

    let queriedOptionKeys = [];
    for (q = 0; q < nextOptions.length; q += 1) {
      queriedOptionKeys = isQuant
        ? [...new Set([...queriedOptionKeys, ...nextOptions[q]])]
        : queriedOptionKeys.concat(Object.keys(nextOptions[q]));
    }
    return queriedOptionKeys.length
      ? [...new Set(queriedOptionKeys)]
      : queries.length === 1 && queries[0].val === ''
        ? null
        : [];
  }

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

  onInputChange(e, q) {
    const nextQueries = [];
    const { queries, filterKey, prevOptions, isQuant } = this.state;
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
    }

    const queriedOptionKeys = this.getQueriedOptionKeys(
      nextQueries, prevOptions, isQuant);
    this.props.setFilterQueries(filterKey, nextQueries, queriedOptionKeys);
  }

  // todo - merge this with onInputChange
  onControlChange(e, q) {
    const nextQueries = [];
    const { queries, prevOptions, filterKey, isQuant } = this.state;
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
    }

    const queriedOptionKeys = this.getQueriedOptionKeys(
      nextQueries, prevOptions, isQuant);
    this.props.setFilterQueries(filterKey, nextQueries, queriedOptionKeys);
  }

  onAddRemoveClick(e, q, doAdd) {
    e.preventDefault();
    const { queries, prevOptions, filterKey } = this.state;
    const nextQueries = [...queries];
    // const isLast = q === nextQueries.length - 1;

    if (doAdd) {
      nextQueries.splice(q + 1, 0, {
        isOR: false,
        val: '',
        control: 'contains',
      });
    } else {
      nextQueries.splice(q, 1);
    }

    if (!nextQueries.length) {
      nextQueries.push({
        isOR: false,
        val: '',
        control: 'contains',
      });
    }

    const queriedOptionKeys = this.getQueriedOptionKeys(nextQueries, prevOptions);
    this.props.setFilterQueries(filterKey, nextQueries, queriedOptionKeys);
  }

  toggleLogicalOperators(e, q) {
    // e.preventDefault();
    e.stopPropagation();
    const { queries, prevOptions, filterKey, isQuant } = this.state;
    const nextQueries = [...queries];
    nextQueries[q].isOR = !nextQueries[q].isOR;

    const queriedOptionKeys = this.getQueriedOptionKeys(
      nextQueries, prevOptions, isQuant);
    this.props.setFilterQueries(filterKey, nextQueries, queriedOptionKeys);
  }

  buildQuantInputEl(query, q) {
    const { control, val } = query;

    let inputEl;
    switch (control) {
      case 'between': {
        const min = Math.min(...this.props.options);
        const max = Math.max(...this.props.options);
        inputEl = (
          <div className="inputBetween">
            <input
              className="inputMin"
              type="number"
              placeholder="min"
              value={val.min}
              min={min}
              max={val.max}
              step={1}
              onChange={(e) => { this.onInputChange(e, q); }}
            />
            <input
              className="inputMax"
              type="number"
              placeholder="max"
              value={val.max}
              min={val.min}
              max={max}
              step={1}
              onChange={(e) => { this.onInputChange(e, q); }}
            />
          </div>
        );
        break;
      }

      default:
        break;
    }
    return inputEl;
  }

  render() {
    const { queries, isQuant } = this.state;
    const queryEls = [];
    let query;
    let queryEl;
    let isClear = true;
    // let isFirst = true;
    // let isLast = true;
    // let iconClass = '';
    let controlSelectorEl;
    let inputEl;

    for (let q = 0; q < queries.length; q += 1) {
      query = queries[q];
      isClear = query.val === '';
      /* isFirst = q === 0;
       isLast = q === queries.length - 1; */

      // Determine whether the button should be plus or minus
      // todo - Move this logic to isPlus or doAddQuery state variable
      /* iconClass = isFirst
        ? (isLast ? 'plus' : 'minus')
        : isLast
          ? (isClear ? 'minus' : 'plus')
          : 'minus'
      ; */

      // Control Selector
      controlSelectorEl = isQuant ? (
        <select onChange={(e) => { this.onControlChange(e, q); }} role="button">
          <option label="between" selected="selected">between</option>
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
              <tbody>
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
              </tbody>
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
