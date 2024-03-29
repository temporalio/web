import WebSocketAsPromised from 'websocket-as-promised';

export const convertEventPayloadsWithCodec = async (namespace, events, endpointTemplate, accessToken) => {
  let headers = {
    'Content-Type': 'application/json',
    'X-Namespace': namespace,
  };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  const requests = [];
  const endpoint = endpointTemplate.replaceAll('{namespace}', namespace);

  events.forEach(event => {
    let payloadsPBs = [];

    if (event.details.input) {
      payloadsPBs.push(event.details.input);
    }

    if (event.details.result) {
      payloadsPBs.push(event.details.result);
    }

    if (event.details.details) {
      Object.values(event.details.details).forEach(field => {
        payloadsPBs.push(field)
      })
    }

    payloadsPBs.forEach(payloadsPB => {
      requests.push(
        fetch(`${endpoint}/decode`, { method: 'POST', headers: headers, body: JSON.stringify(payloadsPB) })
          .then((response) => response.json())
          .then((decodedPayloadsPB) => decodedPayloadsPB.payloads)
          .then((decodedPayloads) => {
            decodedPayloads.forEach((payload, i) => {
              let data = window.atob(payload.data);
              try {
                decodedPayloads[i] = JSON.parse(data);
              } catch {
                decodedPayloads[i] = data;
              }  
            });
  
            payloadsPB.payloads = decodedPayloads
          })
          .catch(() => {
            payloadsPB.payloads.forEach((payload) => {
              payload.error = "Could not decode payload, remote decoder returned an error."
            })
          })
      );
    })
  })

  // We catch and handle errors above so no error handling needed here.
  await Promise.all(requests);

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
