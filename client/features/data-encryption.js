import WebSocketAsPromised from 'websocket-as-promised';

const payloadAsBase64 = payload => {
  payload.data = Buffer.from(JSON.stringify(payload.data)).toString('base64');
  payload.metadata.encoding = Buffer.from(payload.metadata.encoding).toString(
    'base64'
  );

  return payload;
};

export const decryptEventPayloads = async (events, port) => {
  const sock = new WebSocketAsPromised(`ws://localhost:${port}/`, {
    packMessage: data => JSON.stringify(data),
    unpackMessage: data => JSON.parse(data),
    attachRequestId: (data, requestId) =>
      Object.assign({ requestId: requestId }, data),
    extractRequestId: data => data && data.requestId,
  });

  try {
    await sock.open();
    const requests = [];

    events.forEach(event => {
      let payloads = [];

      if (event.details.input) {
        payloads = event.details.input.payloads;
      } else if (event.details.result) {
        payloads = event.details.result.payloads;
      }

      payloads.forEach((payload, i) => {
        if (payload.metadata.encoding === 'json/plain') {
          payload = payloadAsBase64(payload);
        }

        requests.push(
          sock
            .sendRequest({ payload: JSON.stringify(payload) })
            .then(response => {
              payloads[i] = JSON.parse(response.content);
            })
        );
      });
    });
    await Promise.all(requests);
  } catch (err) {
    const message = `Unable to decrypt event payload: ${err}`;

    return Promise.reject({ message });
  } finally {
    if (sock.isOpened) {
      await sock.close();
    }
  }

  return events;
};
