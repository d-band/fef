import expect from 'expect';
import Fef from '../src/index';

describe('app.start', () => {

  it('throw error if no routes defined', () => {
    const app = Fef();
    expect(() => {
      app.start();
    }).toThrow(/Routes is not defined/);
  });

  it('opts.initialState', () => {
    const app = Fef();
    app.model({
      namespace: 'count',
      state: 0
    });
    app.router(({ history }) => <div />);
    app.start({
      initialState: {
        count: 1
      }
    });
    expect(app.store.getState().count).toEqual(1);
  });

  it('opts.reducers', () => {
    const reducers = {
      count: (state, { type }) => {
        if (type === 'add') {
          return state + 1;
        }
        // default state
        return 0;
      }
    };
    const app = Fef();
    app.router(({ history }) => <div />);
    app.start({
      reducers
    });

    expect(app.store.getState().count).toEqual(0);
    app.store.dispatch({ type: 'add' });
    expect(app.store.getState().count).toEqual(1);
  });

  it('opts.reducers: throw error if not plain object', () => {
    const app = Fef();
    app.router(({ history }) => <div />);
    expect(() => {
      app.start({
        reducers: 0
      });
    }).toThrow(/Reducers must be object/);
  });

  it('opts.reducers: throw error if conflicts', () => {
    const app = Fef();
    app.model({
      namespace: 'count',
      state: 0
    });
    app.router(({ history }) => <div />);
    expect(() => {
      app.start({
        reducers: { count: function () {} }
      });
    }).toThrow(/Reducers should not be conflict with namespace in model/);
  });

  it('opts.middlewares', () => {
    let count = 0;
    const countMiddleware = ({ dispatch, getState }) => next => action => {
      count = count + 1;
    };

    const app = Fef();
    app.router(({ history }) => <div />);
    app.start({
      middlewares: [ countMiddleware ]
    });

    app.store.dispatch({ type: 'test' });
    expect(count).toEqual(1);
  });

  it('opts.middlewares: throw error if not array', () => {
    const app = Fef();
    app.router(({ history }) => <div />);
    expect(() => {
      app.start({
        middlewares: 0
      });
    }).toThrow(/Middlewares must be array/);
  });

});
