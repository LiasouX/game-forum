const {MongoClient} = require('mongodb')

const url = `mongodb://localhost:27017`
const db = `opgg`

const mongodbClient = new MongoClient(url)
const mongodb = mongodbClient.db(db)
const opggClient = mongodb.collection("opgg")

module.exports={
    mongodbClient,
    opggClient
}