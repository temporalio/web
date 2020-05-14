export default input => {
  if (!input) {
    return input;
  }

  let parsed = {};

  if (input.jsonStringFull) {
    parsed = JSON.tryParse(input.jsonStringFull);
  } else if (input.payloads !== undefined) {
    parsed = input;
  } else {
    return input;
  }

  const args = parsed.payloads.map((p, i) => ({ [`arg[${i}]`]: p.data }));

  return args;
};
