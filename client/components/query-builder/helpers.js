export const indexTypeToRule = (indexType) => {
  const mapping = {
    string: { type: 'text', operators: ['=', '<>'] },
    keyword: { type: 'text', operators: ['=', '<>'] },
    int: { type: 'numeric', operators: ['=', '<>'] },
    double: { type: 'numeric', operators: ['=', '<>', '>', '<'] },
    bool: { type: 'radio', operators: ['=', '<>', '>', '<'] },
    datetime: {
      type: 'custom-component',
      operators: ['=', '<>', '>', '<'],
      component: TextInput,
    },
  };

  indexType = indexType.toLowerCase();
  const builderType = mapping[indexType.toLowerCase()];
  return builderType;
};
