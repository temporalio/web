import { http } from '~helpers';

export default () => {
  return {
    getNamespaceSettings: namespaceName => {
      return http(window.fetch, `/api/namespaces/${namespaceName}`);
    },
  };
};
