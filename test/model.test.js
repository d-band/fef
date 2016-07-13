import expect from 'expect';
import Fef, { effects } from '../src/index';

const { call } = effects;
const delay = (timeout) => {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
};

describe('app.model', () => {
  it('effects: type takeEvery', () => {
    let count = 0;
    const app = Fef();
    app.model({
      namespace: 'count',
      state: 0,
      effects: {
        add: [ function*() {
          count = count + 1;
          yield 1;
        }, {
          type: 'takeEvery'
        } ]
      }
    });
    app.router(({ history }) => <div />);
    app.start();

    app.store.dispatch({ type: 'count:add' });
    app.store.dispatch({ type: 'count:add' });
    expect(count).toEqual(2);
  });

  it('effects: type takeLatest', (done) => {
    let count = 0;
    const app = Fef();
    app.model({
      namespace: 'count',
      state: 0,
      effects: {
        add: [ function*() {
          yield call(delay, 1);
          count = count + 1;
        }, {
          type: 'takeLatest'
        } ]
      }
    });
    app.router(({ history }) => <div />);
    app.start();

    // Only catch the last one.
    app.store.dispatch({ type: 'count:add' });
    app.store.dispatch({ type: 'count:add' });

    setTimeout(() => {
      expect(count).toEqual(1);
      done();
    }, 100);
  });

  it('effects: onError', () => {
    const errors = [];
    const app = Fef({
      onError: (error) => {
        errors.push(error.message);
      }
    });

    app.model({
      namespace: 'count',
      state: 0,
      effects: {
        *add() {
          yield 1;
          throw new Error('effect error');
        }
      }
    });
    app.router(({ history }) => <div />);
    app.start();
    app.store.dispatch({ type: 'count:add' });

    expect(errors).toEqual([ 'effect error' ]);
  });

  it('subscriptions: onError', (done) => {
    const errors = [];
    const app = Fef({
      onError: (error) => {
        errors.push(error.message);
      }
    });

    app.model({
      namespace: 'count',
      state: 0,
      effects: {
        *add() {
          yield 1;
          throw new Error('effect error');
        }
      },
      subscriptions: [
        (send, done) => {
          send('count:add');
          setTimeout(() => {
            done(new Error('subscription error'));
          }, 100);
        }
      ]
    });
    app.router(({ history }) => <div />);
    app.start();

    setTimeout(() => {
      expect(errors).toEqual([ 'effect error', 'subscription error' ]);
      done();
    }, 500);
  });
});
