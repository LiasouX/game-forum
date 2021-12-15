import { configure } from "log4js"
import { opgg } from "./etl/opgg"
import { connecDB } from "./util"
import { QiniuUpload } from "./util/qiniu"

export async function serve(config: any) {
    const {logger, axios, proxyAxios, dbUrl,access,secret } = config
    if (logger) configure(logger)

    const opggQiniu = new QiniuUpload(access,secret,'opgg')
    const db = new connecDB(dbUrl,'game-forum')
    await opgg(db,opggQiniu)
}

