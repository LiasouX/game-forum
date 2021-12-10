import { configure } from "log4js"
import fs from 'fs'
import { OPGGExtranct } from "./etl/extract/opggExtract"
import { AxiosInstance } from "axios"
import { Collection } from "mongodb"
import { OPGGInterface } from "./pojo"

export async function serve(config: any) {
    const { mongodbClient, logger, axios, proxyAxios, opggClient } = config
    if (mongodbClient) mongodbClient.connect()
    if (logger) configure(logger)
    const { data } = await proxyAxios.get(`https://www.op.gg/champion/viktor/statistics/top/trend`)

    fs.writeFileSync('./trend.html', data)
    // opgg(proxyAxios, opggClient)
}


async function opgg(axios: AxiosInstance, db: Collection<OPGGInterface>) {
    const opggExtract = new OPGGExtranct(axios)
    const extractData = opggExtract.extract()
    for await (const item of extractData) {
        await db.updateOne({ _id: item._id }, { $set: item }, { upsert: true })
    }
}