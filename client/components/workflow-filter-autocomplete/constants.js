export const OPERATORS_RELATIONAL = {
  equal: '=',
  notEqual: '<>',
  bigger: '>',
  biggerOrEqual: '>=',
  smaller: '<',
  smallerOrEqual: '<=',
};

export const OPERATORS_RELATIONAL_LIST = Object.entries(
  OPERATORS_RELATIONAL
).map(([key, value]) => value);

export const OPERATORS_LOGICAL = {
  and: 'and',
  or: 'or',
  parenthesisOpen: '(',
  parenthesisClose: ')',
};

export const OPERATORS_LOGICAL_LIST = Object.entries(OPERATORS_LOGICAL).map(
  ([key, value]) => value
);

export const SUGGESTION_STATES = {
  selectSearchAttribute: 0,
  selectOperatorRelational: 1,
  selectValue: 2,
  selectOperatorLogical: 3,
};
