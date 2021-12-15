import axios from "axios";
import { describe, it } from "mocha";
// import { OPGGExtranct, OPGGInterface } from ".";
import { connecDB } from "../../util";
import fs from 'fs'
import { buffer } from "stream/consumers";
import request from 'request'
import cheerioModule from "cheerio";
import { match } from "assert";
import { QiniuUpload } from "../../util/qiniu";
const qiniu = require('node-qiniu')
qiniu.config({
    access_key: 'F5XWi9Fh-XlQsVRaA2dW4ppVvowIL336dwB1gr61',
    secret_key: 'xJg67wnzJAMJTaGrXM8krEqJV1D2MxyunJb56MNW'
})
const imgBucket = qiniu.bucket('opgg')

describe('ada', () => {



    it(`details`, async () => {
        const qiniu = new QiniuUpload(`F5XWi9Fh-XlQsVRaA2dW4ppVvowIL336dwB1gr61`, `xJg67wnzJAMJTaGrXM8krEqJV1D2MxyunJb56MNW`, 'opgg')
        // qiniu.uploadStream(`https://opgg-static.akamaized.net/images/lol/spell/ViktorPowerTransfer.png?image=c_scale,q_auto,w_42&v=1637122822`,'xxxxxxxxxxxxxxxxxxxx.png')
    })

})