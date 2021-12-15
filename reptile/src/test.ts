import cheerioModule from "cheerio"
import fs from 'fs'
function main(){
    const data = fs.readFileSync('./trend.html')
    const $ = cheerioModule.load(data)
    const script = $('script')
    // console.log(script.eq(55).contents().eq(0).text())
    console.log(script.eq(55).html())




    //=========================首页===========================
    // const position = ['上单','打野','中单','ADC','辅助']
    // const $ = cheerioModule.load(data)
    // const rankingWrapper = $('.detail-ranking__wrapper--ranking')
    // const detail = $('.detail-ranking__wrapper--content',rankingWrapper).eq(0)
    // const list = $('.detail-ranking__content--champ-list',detail).toArray()
    // for (const item of list) {
    //     const aList = $('a',item).toArray()
    //     for (const a of aList) {
    //         const image = $('.champion-ratio__tier',a).children().attr('src')
    //         if(!image){
    //            return
    //         }
    //         const img = image.split('icon-champtier-')[1].split('.')[0]
    //         const percent = $('.champion-ratio__percent',a).toArray()
    //         const winner = $('div',percent[0]).text()
    //         const pick = $('div',percent[1]).text()
    //         const name = $('.champion-ratio__name',a).text()
            
    //     }
    // }
    
}

main()