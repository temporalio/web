const isWriteApiPermitted = () => {
  return ![false, 'false'].includes(process.env.TEMPORAL_PERMIT_WRITE_API);
};

function compareCaseInsensitive(a, b) {
  return typeof a === 'string' && typeof b === 'string'
    ? a.localeCompare(b, undefined, { sensitivity: 'accent' }) === 0
    : a === b;
}

module.exports = { isWriteApiPermitted, compareCaseInsensitive };
