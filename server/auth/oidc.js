var { Issuer, Strategy } = require('openid-client');

async function getClient(issuerUrl, clientId, clientSecret, callbackUriBase) {
  const issuer = await Issuer.discover(issuerUrl);
  return new issuer.Client({
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uris: [`${callbackUriBase}/auth/sso_callback`],
    post_logout_redirect_uris: [`${callbackUriBase}/auth/logout_callback`],
    token_endpoint_auth_method: 'client_secret_post',
    response_types: ['code'],
  });
}

const verify = ({ passIdToken }) => {
  return (tokenSet, userinfo, done) => {
    const { access_token: accessToken, id_token: idToken } = tokenSet;
    const { email, name, picture } = userinfo;

    const user = { email, name, picture, accessToken };

    if (passIdToken) {
      user.idToken = idToken;
    }

    return done(null, user);
  };
};

const getStrategy = async ({
  issuer,
  clientId,
  clientSecret,
  scope,
  audience,
  callbackUriBase,
  passIdToken,
}) => {
  const client = await getClient(
    issuer,
    clientId,
    clientSecret,
    callbackUriBase
  );
  const params = {
    scope,
    audience,
    response: ['userinfo'],
  };

  return new Strategy({ client, params }, verify({ passIdToken }));
};

module.exports = { getStrategy };
