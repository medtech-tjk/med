# Isolated verification

These scripts exercise local services and a disposable real MongoDB. They do not
read admin_token.txt or application .env files. Test startup must set APP_ENV=test,
an ephemeral ADMIN_TOKEN, MONGO_URL from mongo-runtime.json and
DB_NAME=medtech_audit_isolated. Notification credentials must be empty. Never point
the harness at an existing database or a remote service.

Tool dependencies are isolated in evidence-tools/package.json; they are not
application dependencies. Playwright uses the bundled runtime and installed Edge.
`node mongo.cjs` starts MongoDB Community 8.0.16 through mongodb-memory-server.
Its first start downloads the official MongoDB binary.

Lighthouse results are local lab observations with synthetic fixture data. They
are not field Core Web Vitals, production performance, or an accessibility
certification. Axe results describe only the exercised pages and states.
