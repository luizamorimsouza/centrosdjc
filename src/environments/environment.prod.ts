import env from './../env.prod.json';

export const environment = {
  production: true,
  firebaseConfig: env.firebaseConfig,
  firebaseAuth:  env.firebaseAuth,
  secret: env.secret
};
