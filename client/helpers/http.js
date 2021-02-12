const PUBLIC_PATH = process.env.TEMPORAL_WEB_ROOT_PATH || '/';
const CSRF_HEADER_NAME = "x-csrf-token"

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

const addCsrf = (opts) => {
  const cookieName = 'csrf-token';
  const cookies = document.cookie.split(';');
  let csrf = cookies.find((c) => c.includes(cookieName));
  if (csrf && !opts.headers[CSRF_HEADER_NAME]) {
    csrf = csrf.slice(cookieName.length + 1);
    opts.headers[CSRF_HEADER_NAME] = csrf;
  }
  return opts;
};

http.global = http.bind(null, window.fetch);
http.global.post = http.post.bind(null, window.fetch);
