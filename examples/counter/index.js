import React from 'react';
import fef, { connect, router, effects } from '../../src';

const { Router, Route } = router;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

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
    *minus(data, state, send) {
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
