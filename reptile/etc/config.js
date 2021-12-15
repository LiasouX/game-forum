const axios = require('axios')
const logger = require('./log/log')
const HttpsProxyAgent = require("https-proxy-agent")
const proxyAxios = axios.create({
    httpsAgent: new HttpsProxyAgent("http://192.168.124.5:7081")
})

module.exports={
    dbUrl:'mongodb://localhost:27017',
    access:'F5XWi9Fh-XlQsVRaA2dW4ppVvowIL336dwB1gr61',
    secret: 'xJg67wnzJAMJTaGrXM8krEqJV1D2MxyunJb56MNW',
    proxyAxios,
    axios,
    logger
}