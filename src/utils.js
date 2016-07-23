export function check(value, predicate, error) {
  if(!predicate(value)) {
    throw new Error(error);
  }
}

export const is = {
  undef     : v => v === null || v === undefined,
  notUndef  : v => v !== null && v !== undefined,
  string    : f => typeof f === 'string',
  func      : f => typeof f === 'function',
  number    : n => typeof n === 'number',
  element   : n => typeof n === 'object' && !!n && !!n.nodeType && !!n.nodeName,
  array     : Array.isArray,
  object    : n => typeof n === 'object',
  jsx       : v => v && !!v.$$typeof && v.$$typeof.toString() === 'Symbol(react.element)',
  sagaType  : v => v === 'takeEvery' || v === 'takeLatest'
};

export function log(level, message, error) {
  /*eslint-disable no-console*/
  console[level](`fef ${level}: ${message}\n${(error && error.stack) || error}`);
}
