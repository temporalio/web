var { Issuer, Strategy } = require('openid-client');

async function getClient(issuerUrl, clientId, clientSecret, callbackUriBase) {
  const issuer = await Issuer.discover(issuerUrl);
  return new issuer.Client({
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uris: [`${callbackUriBase}/auth/sso_callback`],
    post_logout_redirect_uris: [`${callbackUriBase}/auth/logout_callback`],
    token_endpoint_auth_method: 'client_secret_post',
  });
}

const verify = (tokenSet, userinfo, done) => {
  return done(null, userinfo);
};

const getStrategy = async (
  issuerUrl,
  clientId,
  clientSecret,
  callbackUriBase
) => {
  const client = await getClient(
    issuerUrl,
    clientId,
    clientSecret,
    callbackUriBase
  );
  return new Strategy({ client }, verify);
};

module.exports = { getStrategy };
