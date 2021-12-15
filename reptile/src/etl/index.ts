

export interface Extract<T>{

    extract():Promise<T>
}


export interface Transform{
    transform():Promise<any>
}


export interface Load<T>{
    load(data:T):Promise<void>
}
