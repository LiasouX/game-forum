import path from 'path'


export async function loadConfig<T>(filepath: string) {
	const fullpath = path.isAbsolute(filepath) ? filepath : path.join(process.cwd(), filepath)
	delete require.cache[require.resolve(fullpath)]
	const ret = await import(fullpath) as T
	return ret
}