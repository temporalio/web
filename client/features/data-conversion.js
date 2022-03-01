import WebSocketAsPromised from 'websocket-as-promised';

export const convertEventPayloadsWithRemoteEncoder = async (events, endpoint) => {
  const headers = { 'Content-Type': 'application/json' };
  const requests = [];

  events.forEach(event => {
    let payloadsWrapper;

    if (event.details.input) {
      payloadsWrapper = event.details.input;
    } else if (event.details.result) {
      payloadsWrapper = event.details.result;
    }

    if (!payloadsWrapper) {
      return;
    }

    requests.push(
      fetch(`${endpoint}/decode`, { method: 'POST', headers: headers, body: JSON.stringify(payloadsWrapper) })
        .then((response) => response.json())
        .then((decodedPayloadsWrapper) => decodedPayloadsWrapper.payloads)
        .then((decodedPayloads) => {
          decodedPayloads.forEach((payload, i) => {
            let data = window.atob(payload.data);
            try {
              payloadsWrapper.payloads[i] = JSON.parse(data);
            } catch {
              payloadsWrapper.payloads[i] = data;
            }  
          });
        })
        .catch(() => {
          payloadsWrapper.payloads.forEach((payload) => {
            payload.error = "Could not decode payload, remote decoder returned an error."
          })
        })
    )
  })

  await Promise.allSettled(requests);

  return events;
};

export const convertEventPayloadsWithWebsocket = async (events, port) => {
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
        requests.push(
          sock
            .sendRequest({ payload: JSON.stringify(payload) })
            .then(response => {
              try {
                payloads[i] = JSON.parse(response.content);
              } catch {
                payloads[i] = response.content;
              }
            })
        );
      });
    });
    await Promise.all(requests);
  } catch (err) {
    const message = `Unable to convert event payload: ${err}`;

    return Promise.reject({ message });
  } finally {
    if (sock.isOpened) {
      await sock.close();
    }
  }

  return events;
};
