# Serverless Node.js Based App to Read Documents

A Serverless starter that adds ES7 syntax, serverless-offline, linting, environment variables, and unit test support. Part of the [Serverless Stack](http://serverless-stack.com) guide.

[Serverless Node.js Starter](https://github.com/AnomalyInnovations/serverless-nodejs-starter) uses the [serverless-bundle](https://github.com/AnomalyInnovations/serverless-bundle) plugin (an extension of the [serverless-webpack](https://github.com/serverless-heaven/serverless-webpack) plugin) and the [serverless-offline](https://github.com/dherault/serverless-offline) plugin. It supports:

- **Generating optimized Lambda packages with Webpack**
- **Use ES7 syntax in your handler functions**
  - Use `import` and `export`
- **Run API Gateway locally**
  - Use `serverless offline start`
- **Support for unit tests**
  - Run `npm test` to run your tests
- **Sourcemaps for proper error messages**
  - Error message show the correct line numbers
  - Works in production with CloudWatch
- **Lint your code with ESLint**
- **Add environment variables for your stages**
- **No need to manage Webpack or Babel configs**

---

### Demo

A demo version of this service is hosted on AWS - [`https://mrspeaker.jack-roberts.com`](https://mrspeaker.jack-roberts.com)

https://github.com/jroberts64/mrspeaker-api
https://github.com/jroberts64/mrspeaker-client
