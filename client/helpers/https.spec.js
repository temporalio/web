/**
 * @jest-environment jsdom
 */

import { addCsrf } from './http';

describe('cross site request forgery (CSRF)', () => {
  let opts;

  beforeEach(() => {
    opts = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
  });

  describe('When no csrf cookie is set', () => {
    it('should not set CSRF header', () => {
      document.cookie =
        'sample-token=xxxxx; sample-token.sig=yyyyy';
      opts = addCsrf(opts);

      expect(opts.headers['X-CSRF-TOKEN']).toEqual(undefined);
    });
  });

  describe('When single cookie is present and is csrf', () => {
    it('should set CSRF header', () => {
      document.cookie =
        'csrf-token=xxxxx; sample-token.sig=yyyyy';
      opts = addCsrf(opts);

      expect(opts.headers['X-CSRF-TOKEN']).toEqual('xxxxx');
    });
  });

  describe('When csrf cookie is present and is not first', () => {
    it('should set CSRF header', () => {
      document.cookie =
        'sample-token=zzzzzz; csrf-token=xxxxx; sample-token.sig=yyyyy';
      opts = addCsrf(opts);

      expect(opts.headers['X-CSRF-TOKEN']).toEqual('xxxxx');
    });
  });

  describe('When csrf cookie is pre-fixed with a space', () => {
    it('should trim spaces and set CSRF header', () => {
      document.cookie =
        ' csrf-token=xxxxx ;';
      opts = addCsrf(opts);

      expect(opts.headers['X-CSRF-TOKEN']).toEqual('xxxxx');
    });
  });
  
  describe('When csrf cookie is pre-fixed with a space', () => {
    it('should trim spaces and set CSRF header', () => {
      document.cookie =
        ' csrf-token=xxxxx ;';
      opts = addCsrf(opts);

      expect(opts.headers['X-CSRF-TOKEN']).toEqual('xxxxx');
    });
  });

  describe('When csrf cookie has spaces', () => {
    it('should trim spaces and set CSRF header', () => {
      document.cookie =
        ' csrf-token=xxxxx ;';
      opts = addCsrf(opts);

      expect(opts.headers['X-CSRF-TOKEN']).toEqual('xxxxx');
    });
  });

  describe('When csrf cookie is preceded by csrf signature', () => {
    it('should trim spaces and set CSRF header', () => {
      document.cookie =
        'sample-token.sig=yyyyy; csrf-token=xxxxx;';
      opts = addCsrf(opts);

      expect(opts.headers['X-CSRF-TOKEN']).toEqual('xxxxx');
    });
  });
});
