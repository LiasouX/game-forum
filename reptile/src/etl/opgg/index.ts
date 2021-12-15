import { throws } from "assert";
import axios, { AxiosInstance } from "axios";
import cheerioModule from "cheerio";
import { val } from "cheerio/lib/api/attributes";
import { getLogger, Logger } from "log4js";
import { Collection } from "mongodb";
import { Extract, Load } from "..";
import { connecDB, sleep } from "../../util";
import { QiniuUpload } from "../../util/qiniu";

export interface OPGGDataModule {
    _id: string
    name: string
    pick: string
    winner: string
    level: string
    position_zh: string
    position_en: string
}

export interface OPGGDetailModule {
    _id: string
    pick: string
    use: number
    winner: string
    spells: string[]
    cost: string[]
    skillName: string[]
    skillUrl: string[]
}


const logger = getLogger('OPGGExtranct')
export class OPGGExtranct implements Extract<OPGGDataModule[]> {
    private url = 'https://www.op.gg/champion/statistics';
    async extract(): Promise<OPGGDataModule[]> {
        const opggArr: OPGGDataModule[] = []
        const { data } = await axios.get(this.url)
        const position = ['上单:top', '打野:jungle', '中单:mid', 'ADC:adc', '辅助:support']
        const $ = cheerioModule.load(data)
        let list: cheerio.Element[] = []
        try {
            const rankingWrapper = $('.detail-ranking__wrapper--ranking')
            const detail = $('.detail-ranking__wrapper--content', rankingWrapper).eq(0)
            list = $('.detail-ranking__content--champ-list', detail).toArray()
        } catch (error) {
            logger.error(`OPGGExtranct extract cheerioModule error`)
        }
        for (const item of list) {
            const aList = $('a', item).toArray()
            for (const a of aList) {
                try {
                    const percent = $('.champion-ratio__percent', a).toArray()
                    const winner = $('div', percent[0]).text()
                    const pick = $('div', percent[1]).text()
                    const name = $('.champion-ratio__name', a).text()
                    const image = $('.champion-ratio__tier', a).children().attr('src') || ''
                    const level = image.split('icon-champtier-')[1].split('.')[0]
                    const opgg: OPGGDataModule = {
                        _id: `${position[0].split(':')[1]}_${name}`,
                        name: name,
                        pick: pick,
                        winner: winner,
                        level: level,
                        position_en: position[0].split(':')[1],
                        position_zh: position[0].split(':')[0]
                    }
                    logger.debug(opgg)
                    opggArr.push(opgg)
                } catch (error: any) {
                    logger.error(`${error.message}`)
                }
            }
            position.shift()
        }
        return opggArr
    }

}


export class OPGGLoad implements Load<OPGGDataModule>{

    constructor(
        private db: Collection<OPGGDataModule>
    ) { }

    async load(data: OPGGDataModule): Promise<void> {
        try {

            await this.db.update({ _id: data._id }, { $set: data }, { upsert: true })
        } catch (error) {
            logger.error(`OPGGLoad updateOne is error`)
        }
    }

}

export class OPGGDetailExtract implements Extract<void>{
    constructor(
        private urlQueue: Collection<{ _id: string, url: string }>,
        private detailCol: Collection<OPGGDetailModule>
    ) { }
    async extract(): Promise<void> {

        try {
            while (true) {
                const { value } = await this.urlQueue.findOneAndDelete({})
                if (!value) throw new Error("queue is null");
                logger.debug(value.url)
                const { data } = await axios.get(value.url)
                const $ = cheerioModule.load(data)
                const { spells, pick, use, winner } = this.spell($)
                logger.debug(`spell is success`)
                const cost = this.getCost($)
                logger.debug(`getCost is success`)
                const { skillName, skillUrl } = this.getSkill($)
                logger.debug(`getSkill is success`)
                logger.debug(`${JSON.stringify({ spells, pick, use, winner, cost, skillName, skillUrl })}`)
                this.detailCol.updateOne({ _id: value._id }, { $set: { _id: value._id, spells, pick, use, winner, cost, skillName, skillUrl } }, { upsert: true })
            }
        } catch (error: any) {
            logger.error(`OPGGDetailExtract is ${error.message}`)
        }
    }

    getSkill($: cheerio.Root) {
        const wrapper = $('.overview__wrapper--comp').eq(1)
        const imgs = $('.overview__item--table', wrapper)
        const skillUrl: string[] = []
        const skillName: string[] = []
        for (const item of imgs) {
            const img = $(item).children().attr('src')
            if (!img) throw Error(`img is null`)
            const imgName = img.split('/lol/spell/')[1].split('.')[0]
            skillUrl.push(`https:${img}`)
            skillName.push(imgName)
        }
        return { skillUrl, skillName }
    }

    getCost($: cheerio.Root) {
        const matchup = $('.matchup-summary')
        const tables = $('.matchup-summary__content', matchup)
        const trList = $('tr', tables)
        const cost: string[] = []
        for (const item of trList) {
            const name = $('.matchup-summary__name', item).text()
            const winner = $('.matchup-summary__win-rate', item).children().eq(1).text()
            cost.push(`${name}:${winner}`)
        }
        return cost
    }

    spell($: cheerio.Root) {
        const table = $(`.overview__table--stat`).eq(1)
        const tr = $('tbody', table).children()
        const imgs = $('img', tr.eq(0))
        const spells: string[] = []
        for (const img of imgs) {
            const imgUrl = $(img).attr('src')
            if (!imgUrl) throw Error('')
            const imgName = imgUrl.split('/spell/Summoner')[1].split('.')[0]
            spells.push(imgName)
        }
        const picks = tr.children().eq(1).text().replace(/\s/g, '').split('%')
        const pick = `${picks[0]}%`
        const use = Number(picks[1].replace(',', ''))
        const winner = tr.children().eq(2).text().trim()
        return { spells, pick, use, winner }
    }

}

export class OPGGDetailsArr {
    constructor(
        private exarr: OPGGDetailExtract[]
    ) { }

    async extract() {
        for (const item of this.exarr) {
            item.extract()
        }
    }
}


async function urlQueueInsert(urlQueue: Collection<{ _id: string, url: string }>, opggCol: Collection<OPGGDataModule>) {
    const data = await opggCol.find().toArray()
    for (const item of data) {
        const value = `https://www.op.gg/champion/${item.name}/statistics/${item.position_en}/`
        logger.debug(value)
        try {
            await urlQueue.updateOne({ _id: item._id }, { $set: { _id: item._id, url: value } }, { upsert: true })
        } catch (error) {
            logger.error(`urlQueueInsert is error`)
        }
    }

}

async function detail(urlQueue: Collection<{ _id: string, url: string }>, opggCol: Collection<OPGGDataModule>, detailCol: Collection<OPGGDetailModule>) {
    const arr: OPGGDetailExtract[] = []
    await urlQueueInsert(urlQueue, opggCol)
    for (let i = 0; i < 10; i++) {
        arr.push(new OPGGDetailExtract(urlQueue, detailCol))
    }
    const arrs = new OPGGDetailsArr(arr)
    await arrs.extract()
}

async function basicOPGG(col: Collection<OPGGDataModule>) {
    const extract = new OPGGExtranct()
    const data = await extract.extract()
    const load = new OPGGLoad(col)
    for (const item of data) {
        await load.load(item)
    }

}

async function uploadImg(detailCol: Collection<OPGGDetailModule>, qiniu: QiniuUpload) {

    try {
        while (true) {
            const data = await detailCol.find().toArray()
            for (const item of data) {
                const urls = item.skillUrl
                for (const url of urls) {
                    logger.debug(url)
                    try {
                        await sleep(5)
                        qiniu.uploadStream(url, item.skillName.shift() || '')
                    } catch (error) {
                        console.log(error)
                    }
                }
            }
        }
    } catch (error: any) {
        logger.error(`uploadImg is ${error.message}`)
    }
}

export async function opgg(db: connecDB, qiniu: QiniuUpload) {
    const urlQueue = await db.mongoCol<{ _id: string, url: string }>('urlQueue')
    const opggCol = await db.mongoCol<OPGGDataModule>('opgg')
    const detailCol = await db.mongoCol<OPGGDetailModule>('opggDetail')
    // await basicOPGG(opggCol)
    // await detail(urlQueue, opggCol, detailCol)
    uploadImg(detailCol, qiniu)
}
