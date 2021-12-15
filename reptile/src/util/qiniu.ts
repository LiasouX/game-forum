const qiniu = require('node-qiniu')
import { getLogger, Logger } from "log4js"
import request from "request"

const logger = getLogger('QiniuLoad')
export class QiniuUpload {

    private bucket: any

    constructor(
        private access: string,
        private secret: string,
        private bucketName: string
    ) {
        qiniu.config({
            access_key: 'F5XWi9Fh-XlQsVRaA2dW4ppVvowIL336dwB1gr61',
            secret_key: 'xJg67wnzJAMJTaGrXM8krEqJV1D2MxyunJb56MNW'
        })
        this.bucket = qiniu.bucket(bucketName);
    }

    uploadStream(url: string, key: string) {
        const puttingStream = this.bucket.createPutStream(key);
        try {
            request.get(url).pipe(puttingStream)
        } catch (error: any) {
            logger.error(`uploadStream ${error.message}`)
        }
    }



}