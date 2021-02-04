const securityHeaders = ({ ignorePaths }) => {
  return async (ctx, next) => {
    if (!['HEAD', 'GET'].includes(ctx.method)) {
      await next();
      return;
    }

    if (ignorePaths && ignorePaths instanceof Array) {
      if (ignorePaths.find((p) => ctx.path.startsWith(p))) {
        await next();
        return;
      }
    }

    ctx.set('X-Content-Type-Options', 'nosniff');
    ctx.set('X-Frame-Options', 'SAMEORIGIN');
    ctx.set('X-XSS-Protection', '1; mode=block');
    if (ctx.method === 'GET') {
      ctx.cookies.set('csrf-token', ctx.csrf, { httpOnly: false });
    }

    await next();
  };
};

module.exports = { securityHeaders };
