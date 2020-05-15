export default input => {
  if (!input || !input.payloads) {
    return input;
  }

  const args = input.payloads.map((p, i) => ({ [`arg[${i}]`]: p.data }));

  return args;
};
