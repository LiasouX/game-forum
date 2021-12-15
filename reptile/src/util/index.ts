import { rejects } from 'assert'
import { MongoClient } from 'mongodb'
import path from 'path'
import { resolve } from 'path/posix'

type colType = 'opgg' | 'opggDetail' | 'hltv' | 'urlQueue' | 'imgQueue'

export async function loadConfig<T>(filepath: string) {
	const fullpath = path.isAbsolute(filepath) ? filepath : path.join(process.cwd(), filepath)
	delete require.cache[require.resolve(fullpath)]
	const ret = await import(fullpath) as T
	return ret
}


export class connecDB{

	constructor(
		private dbUrl:string,
		private dbName:string
	){}

	async mongoCol<T>(colName:colType){
		return (await MongoClient.connect(this.dbUrl)).db(this.dbName).collection<T>(colName)
	}

}

export function sleep(time:number){
	return new Promise(resolve=>{
		setTimeout(resolve, time*1000);
	})
}