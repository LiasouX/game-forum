import axios from "axios";
import { describe, it } from "mocha";
// import { OPGGExtranct, OPGGInterface } from ".";
import { connecDB } from "../../util";
import fs, { stat } from 'fs'
import { buffer } from "stream/consumers";
import request from 'request'
import cheerioModule from "cheerio";
import { match } from "assert";
import { QiniuUpload } from "../../util/qiniu";
import { HttpsProxyAgent } from "https-proxy-agent";
const qiniu = require('node-qiniu')
qiniu.config({
    access_key: 'F5XWi9Fh-XlQsVRaA2dW4ppVvowIL336dwB1gr61',
    secret_key: 'xJg67wnzJAMJTaGrXM8krEqJV1D2MxyunJb56MNW'
})
const imgBucket = qiniu.bucket('opgg')

describe('ada', () => {



    it(`details`, async () => {
       while(true){
           const {status} = await axios.get(`https://www.hltv.org/stats/players/11893/zywoo?__cf_chl_jschl_tk__=5JGL0wvd1xZJmz.GNtU1zpws_SWiQB6_dMdumKJKGAg-1639601558-0-gaNycGzNDr0`,
           {httpsAgent:new HttpsProxyAgent('http://localhost:5081')})
           console.log(status)
       }
    })

})