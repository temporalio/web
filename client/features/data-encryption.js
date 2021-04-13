import WebSocketAsPromised from 'websocket-as-promised';

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
      }

      if (event.details.result) {
        payloads = event.details.result.payloads;
      }

      payloads.forEach((payload, i) => {
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
  } catch (error) {
    console.log(error);

    return Promise.reject(error);
  } finally {
    if (sock.isOpened) {
      await sock.close();
    }
  }

  return events;
};
