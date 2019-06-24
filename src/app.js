const Http = require('http')
const fs = require ('fs')
const path = require('path')
const Handlebars = require('handlebars')
const {createGzip,createDeflate} = require('zlib') 
const {exec} = require('child_process')

let defaultConfig = {
    host:'127.0.0.1',
    port:'8000'
}
class Server{
    constructor(config){
        console.log(config,1111)
        Object.assign(defaultConfig,config)
    }
    start() {
        func()
    }
}

module.exports = Server

function func () {
const templatePath = path.join(__dirname,'./template.tpl')
const source = fs.readFileSync(templatePath,'utf8')
const templates = Handlebars.compile(source)
const rootPath = process.cwd()

const server = Http.createServer((req,res) => {
    const filePath = path.join(rootPath,req.url)
    fs.stat(filePath,(err,stats) => {
        if(err) {
            res.statusCode = 400
            res.setHeader('Content-Type','text/plain')
            res.end('error!!!')
            return
        }
        if(stats.isFile()) {
            res.statusCode = 200
            res.setHeader('Content-Type','text/plain')
            fs.createReadStream(filePath).pipe(res)
            let rs = fs.createReadStream(filePath)
            // if(filePath.match(/\.(js|tpl|html)/)) {
            //     rs = compressEvent(rs,req,res)
            // }
            rs.pipe(res)
        } else if(stats.isDirectory()) {
            fs.readdir(filePath,(err,files) => {
                res.statusCode = 200
                res.setHeader('Content-Type','text/html')
                const dir = path.relative(rootPath,filePath)
                const data = {
                    attr:rootPath,
                    dir:dir ? `/${dir}` : '',
                    files
                }
                res.end(templates(data))
            })
        }
    })
    
})

server.listen(defaultConfig.port,defaultConfig.host,() => {
    console.log(`http://${defaultConfig.host}:${defaultConfig.port}`)
    let url = `http://${defaultConfig.host}:${defaultConfig.port}`
    autoOpen(url)
})

}
//压缩
function compressEvent(rs,req,res) {
    //获取浏览器允许的压缩方式并把当前需要加载的文件经行压缩
    const allowEncoding = req.headers['accept-encoding']
    if(!allowEncoding || !allowEncoding.match(/\b(gzip|deflate)\b/)) {
        return rs
    }else if (allowEncoding.match(/\bgzip\b/)){
        res.setHeader('Content-Encoding','gzip')
        return rs.pipe(createGzip())
    }else if (allowEncoding.match(/\bdeflate\b/)){
        res.setHeader('Content-Encoding','deflate')
        return rs.pipe(createDeflate())
    }

}

//自动打开网页
function autoOpen(url) {
    switch (process.platform) {
        case 'darwin':
            exec(`open ${url}`)
            break;
    
        case 'win32':
            exec(`start ${url}`)
            break;
    }
}