import expect from 'expect';
import { is } from '../src/utils';

describe('utils', () => {
  it('utils', () => {
    let foo = { bar: 1 };
    expect(is.undef(foo.bar)).toEqual(false);
    expect(is.undef(foo.foo)).toEqual(true);
    expect(is.notUndef(foo.foo)).toEqual(false);
    expect(is.string('foo')).toEqual(true);
    expect(is.func(() => {})).toEqual(true);
    expect(is.number(1)).toEqual(true);
    expect(is.element(foo)).toEqual(false);
    expect(is.array([ 1, 2 ])).toEqual(true);
    expect(is.object({})).toEqual(true);
    expect(is.jsx(foo)).toEqual(false);
    expect(is.sagaType('takeEvery')).toEqual(true);
    expect(is.sagaType('takeLatest')).toEqual(true);
  });
});
