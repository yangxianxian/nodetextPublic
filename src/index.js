const yargs = require('yargs')
const Server = require('./app')

const argv = yargs
    .usage('anywhere [options]')
    .option('p',{
        alias:'port',
        describe:'端口号',
        default:'8000'
    })
    .version()
    .alias('v','version')
    .help()
    .argv;
const sd = new Server(argv)
sd.start()