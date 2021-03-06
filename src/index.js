import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux';
import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import createSagaMiddleware, { takeEvery, takeLatest } from 'redux-saga';
import { browserHistory } from 'react-router';
import { fork, select, put } from 'redux-saga/effects';
import window from 'global/window';
import { is, check, log } from './utils';

export default function fef(opts = {}) {
  const onError = opts.onError || function (err) {
    throw err;
  };

  let _routes = null;
  const _models = [];
  const app = {
    model,
    router,
    start,
    store: null
  };
  return app;

  function model(model) {
    check(model.namespace, is.notUndef, 'Namespace must be defined with model.');
    check(model.namespace, namespace => namespace !== 'routing', 'Namespace should not be routing.');
    _models.push(model);
  }

  function router(routes) {
    check(routes, is.func, 'Routes must be function.');
    _routes = routes;
  }

  // start usage:
  // app.start();
  // app.start(container);
  // app.start(container, opts);
  // app.start(opts);
  function start(container, opts) {
    // If no container supplied, return jsx element.
    if (!opts && !is.element(container)) {
      opts = container;
      container = null;
    }
    opts = opts || {};
    
    check(_routes, is.notUndef, 'Routes is not defined.');

    // Get sagas and reducers from model.
    let sagas = [];
    let reducers = {};
    _models.forEach(model => {
      const ns = model.namespace;
      reducers[ns] = (state = model.state, action) => {
        const [ _ns, _name ] = action.type.split(':');
        const _reducer = _name && model.reducers ? model.reducers[_name] : null;
        if (_ns === ns && _reducer) {
          return _reducer(action.payload, state);
        }
        return state;
      };
      if (model.effects) {
        Object.keys(model.effects).forEach((key) => {
          sagas.push(getWatcher(ns, key, model.effects[key]));
        });
      }
    });

    // Support external reducers.
    if (is.notUndef(opts.reducers)) {
      check(opts.reducers, is.object, 'Reducers must be object.');
      check(opts.reducers, optReducers => {
        for (let k in optReducers) {
          if (k in reducers) return false;
        }
        return true;
      }, 'Reducers should not be conflict with namespace in model.');
      reducers = { ...reducers, ...opts.reducers };
    }

    // Create store.
    if (is.notUndef(opts.middlewares)) {
      check(opts.middlewares, is.array, 'Middlewares must be array.');
    }
    const sagaMiddleware = createSagaMiddleware();
    const enhancer = compose(
      applyMiddleware.apply(null, [ sagaMiddleware, ...(opts.middlewares || []) ]),
      window.devToolsExtension ? window.devToolsExtension() : f => f
    );
    const initialState = opts.initialState || {};
    const store = app.store = createStore(
      combineReducers(reducers), initialState, enhancer
    );

    // Sync history.
    let history = opts.history || browserHistory;

    // Start saga.
    sagaMiddleware.run(rootSaga);

    // Handle subscriptions.
    _models.forEach(({ subscriptions }) => {
      if (subscriptions) {
        check(subscriptions, is.array, 'Subscriptions must be an array');
        subscriptions.forEach(sub => {
          check(sub, is.func, 'Subscription must be an function');
          sub((type, payload) => {
            store.dispatch({ type, payload });
          }, onError);
        });
      }
    });

    // Render and hmr.
    if (container) {
      render();
      if (opts.hmr) {
        opts.hmr(render);
      }
    } else {
      const Routes = _routes;
      return (
        <Provider store={store}>
          <Routes history={history} />
        </Provider>
      );
    }

    function* send(type, payload) {
      yield put({ type, payload });
    }

    function getWatcher(ns, k, saga) {
      let nsk = `${ns}:${k}`;
      let _saga = saga;
      let _type = 'takeEvery';
      if (Array.isArray(saga)) {
        [ _saga, opts ] = saga;
        opts = opts || {};
        check(opts.type, is.sagaType, 'Type must be takeEvery or takeLatest');
        _type = opts.type;
      }

      function* sagaWrap(action) {
        try {
          const _state = yield select(state => state[ns]);
          yield _saga(action.payload, _state, send);
        } catch (e) {
          log('error', nsk, e);
          onError(e);
        }
      }

      if (_type === 'takeEvery') {
        return function*() {
          yield takeEvery(nsk, sagaWrap);
        };
      } else {
        return function*() {
          yield takeLatest(nsk, sagaWrap);
        };
      }
    }

    function* rootSaga() {
      for (let saga of sagas) {
        yield fork(saga);
      }
    }

    function render(routes) {
      const Routes = routes || _routes;
      ReactDOM.render((
        <Provider store={store}>
          <Routes history={history} />
        </Provider>
      ), container);
    }
  }
}

export { connect };
export * as effects from 'redux-saga/effects';
export * as router from 'react-router';
