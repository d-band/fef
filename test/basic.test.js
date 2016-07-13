import expect from 'expect';
import Fef from '../src/index';

describe('basic', () => {
  it('basic', () => {
    let sagaCount = 0;

    const app = Fef();
    app.model({
      namespace: 'count',
      state: 0,
      reducers: {
        addDone(data, state) {
          return state + 1;
        }
      },
      effects: {
        *add(data, state, send) {
          sagaCount = sagaCount + 1;
          yield send('count:addDone');
        }
      }
    });
    app.router(({ history }) => <div />);
    app.start();

    app.store.dispatch({ type: 'count:add' });
    expect(app.store.getState().count).toEqual(1);
    expect(sagaCount).toEqual(1);
  });
});
