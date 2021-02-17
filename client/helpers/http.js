const PUBLIC_PATH = process.env.TEMPORAL_WEB_ROOT_PATH || '/';
export default function http(fetch, url, o) {
  const opts = {
    credentials: 'same-origin',
    headers: {
      Accepts: 'application/json',
    },
    ...o,
  };
  let fetchUrl = url;

  if (opts.query) {
    const qs = Object.keys(opts.query)
      .filter(k => opts.query[k] != null)
      .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(opts.query[k])}`)
      .join('&');

    if (qs) {
      fetchUrl = `${url}?${qs}`;
    }
  }

  let path = PUBLIC_PATH.slice(0, -1);
  fetchUrl = `${path}${fetchUrl}`

  return fetch(fetchUrl, opts).then(r =>
    r.status >= 200 && r.status < 300
      ? r.json().catch(() => {})
      : r.json().then(
          json => Promise.reject(Object.assign(r, { json })),
          () => Promise.reject(r)
        )
  );
}

http.post = function post(fetch, url, body) {
  let opts = {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  };
  opts = addCsrf(opts);
  return http(fetch, url, opts);
};

export const addCsrf = (opts) => {
  const csrfCookie = 'csrf-token=';
  const csrfHeader = 'X-CSRF-TOKEN';
  const cookies = document.cookie.split(';');
  let csrf = cookies.find((c) => c.includes(csrfCookie));
  if (csrf && !opts.headers[csrfHeader]) {
    csrf = csrf.trim().slice(csrfCookie.length);
    opts.headers[csrfHeader] = csrf;
  }
  return opts;
};

http.global = http.bind(null, window.fetch);
http.global.post = http.post.bind(null, window.fetch);
