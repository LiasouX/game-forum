

export interface Extract<T>{

    extract():AsyncGenerator<T,void,any>
}


export interface Transform{
    transform():Promise<any>
}


export interface Load{
    load:Promise<void>
}
