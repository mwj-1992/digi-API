const app = require('./app');
const config = require('./configs/config');


const server = app.listen(config.port, () => console.log(`Listening on port ${config.port}...`));

module.exports = { server };
