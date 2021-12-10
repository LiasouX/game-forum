import axios, { AxiosInstance } from "axios";
import cheerioModule from "cheerio";
import { getLogger, Logger } from "log4js";
import { Extract } from "..";
import { OPGGInterface } from "../../pojo";

const logger = getLogger('OPGGExtranct')
export class OPGGExtranct implements Extract<OPGGInterface> {

    constructor(
        private axios: AxiosInstance
    ) { }
    private url = 'https://www.op.gg/champion/statistics';

    async *extract(): AsyncGenerator<OPGGInterface, void, any> {
        
        const { data } = await axios.get(this.url)
        const position = ['上单', '打野', '中单', 'ADC', '辅助']
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
                    const opgg: OPGGInterface = {
                        _id: `${position[0]}_${name}`,
                        name: name,
                        pick: pick,
                        winner: winner,
                        level: level,
                        position: position[0]
                    }
                    logger.info(opgg)
                    yield opgg
                } catch (error:any) {
                    logger.error(`${error.message}`)
                }
            }
            position.shift()
        }
    }

}