const isWriteApiPermitted = () => {
  return ![false, 'false'].includes(process.env.TEMPORAL_PERMIT_WRITE_API);
};

module.exports = { isWriteApiPermitted };
