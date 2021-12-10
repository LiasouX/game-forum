const axios = require('axios')
const {mongodbClient,opggClient} = require('./db/db')
const logger = require('./log/log')
const HttpsProxyAgent = require("https-proxy-agent")
const proxyAxios = axios.create({
    httpsAgent: new HttpsProxyAgent("http://192.168.124.5:7081")
})


module.exports={
    mongodbClient,
    opggClient,
    proxyAxios,
    axios,
    logger
}