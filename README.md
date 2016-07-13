FEF ( Front-End Framework )
======

> Front-end framework based on react, redux, react-redux, react-router and redux-saga, inspired by elm and choo. Fork from [dva](https://github.com/sorrycc/dva).

[![NPM version](https://img.shields.io/npm/v/fef.svg)](https://www.npmjs.com/package/fef)
[![NPM downloads](https://img.shields.io/npm/dm/fef.svg)](https://www.npmjs.com/package/fef)
[![Build Status](https://travis-ci.org/d-band/fef.svg?branch=master)](https://travis-ci.org/d-band/fef)
[![Coverage Status](https://coveralls.io/repos/github/d-band/fef/badge.svg?branch=master)](https://coveralls.io/github/d-band/fef?branch=master)
[![Dependency Status](https://david-dm.org/d-band/fef.svg)](https://david-dm.org/d-band/fef)

## Getting Started

### Install

```bash
$ npm install --save fef
```

### Usage Example

Let's create an count app that changes when user click the + or - button. 

```javascript
import React from 'react';
import fef, { connect, router } from 'fef';

const { Router, Route } = router;

// 1. Initialize
const app = fef();

// 2. Model
app.model({
  namespace: 'count',
  state: 0,
  reducers: {
    addDone(data, state) { return state + 1 },
    minusDone(data, state) { return state - 1 }
  },
  effects: {
    *add(data, state, send) {
      yield delay(1000);
      yield send('count:addDone');
    },
    *add(data, state, send) {
      yield delay(1000);
      yield send('count:minusDone');
    }
  }
});

// 3. View
const App = connect(({ count }) => ({
  count
}))(function(props) {
  return (
    <div>
      <h2>{ props.count }</h2>
      <button key="add" onClick={() => { props.dispatch({type: 'count:add'})}}>+</button>
      <button key="minus" onClick={() => { props.dispatch({type: 'count:minus'})}}>-</button>
    </div>
  );
});

// 4. Router
app.router(({ history }) =>
  <Router history={history}>
    <Route path="/" component={App} />
  </Router>
);

// 5. Start
app.start(document.getElementById('root'));
```

## Report a issue

* [All issues](https://github.com/d-band/fef/issues)
* [New issue](https://github.com/d-band/fef/issues/new)

## License

fef is available under the terms of the MIT License.