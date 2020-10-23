import { TextInput, DateRangePicker } from '~components';
import { OPERATORS_RELATIONAL } from './constants';

export const attributeTypeToRule = (indexType) => {
  const mapping = {
    string: {
      type: 'text',
      operators: [OPERATORS_RELATIONAL.equal, OPERATORS_RELATIONAL.notEqual],
      defaultSuggestions: [],
    },
    keyword: {
      type: 'text',
      operators: [OPERATORS_RELATIONAL.equal, OPERATORS_RELATIONAL.notEqual],
      defaultSuggestions: [],
    },
    int: {
      type: 'numeric',
      operators: [OPERATORS_RELATIONAL.equal, OPERATORS_RELATIONAL.notEqual],
      defaultSuggestions: [0, 1],
    },
    double: {
      type: 'numeric',
      operators: [
        OPERATORS_RELATIONAL.equal,
        OPERATORS_RELATIONAL.notEqual,
        OPERATORS_RELATIONAL.bigger,
        OPERATORS_RELATIONAL.smaller,
        OPERATORS_RELATIONAL.biggerOrEqual,
        OPERATORS_RELATIONAL.smallerOrEqual,
      ],
      defaultSuggestions: [0, 1],
    },
    bool: {
      type: 'radio',
      operators: [OPERATORS_RELATIONAL.equal, OPERATORS_RELATIONAL.notEqual],
      defaultSuggestions: [1, 0],
    },
    datetime: {
      type: 'datetime',
      operators: [
        OPERATORS_RELATIONAL.equal,
        OPERATORS_RELATIONAL.notEqual,
        OPERATORS_RELATIONAL.bigger,
        OPERATORS_RELATIONAL.biggerOrEqual,
        OPERATORS_RELATIONAL.smaller,
        OPERATORS_RELATIONAL.smallerOrEqual,
      ],
      defaultSuggestions: [`"${new Date().toISOString()}"`],
    },
  };

  indexType = indexType.toLowerCase();
  const builderType = mapping[indexType.toLowerCase()];
  return builderType;
};
