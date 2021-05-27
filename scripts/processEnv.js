const { config } = require('dotenv');
const dotenvExpand = require('dotenv-expand');

let env;
if (process.env.ENVIRONMENT) {
  env = config({ path: `.env.${process.env.BUILD_ENV}` });
} else {
  env = config({ path: `.env.development` });
}
dotenvExpand(env);
// console.log(`projectEnv`);
// console.log(env);
module.exports = {
  projectEnv: env.parsed,
};
