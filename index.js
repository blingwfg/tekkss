import { configDotenv } from "dotenv"
configDotenv()

import express from "express"
import cors from 'cors'

import { dirname, join } from 'path'

import ip  from "ip"
import multer, { memoryStorage } from "multer"
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { nanoid } from "nanoid"


import { client, dbInitialize } from "./libs/db.js"
import { s3 } from "./libs/S3.js"


// define express
const app = express()

// define Multer
const upload = multer( {storage: memoryStorage()})

// use CORS
app.use(cors())

// set Views Engine
app.set('views', join(dirname(import.meta.filename), 'views'));
app.set('view engine', 'ejs');

app.get('/' , async (req, res) =>{
  try {
        const results = await client.query(`SELECT * FROM profiles`)
        res.render('index', {data: results.rows, ip: ip.address()})
  } catch (error) {
        console.error(error)
        res.send('terjadi kesalahan').status(500)
  }
})

app.get('/create' , async (req, res) =>{
    res.render('create', {ip:ip.address()})
})

app.post('/create-data' , upload.single('gambar'), async (req, res) =>{
    try {
        const id = nanoid(8);
        const params = {
            Body:req.file.buffer,
            Bucket: process.env.AWS_BUCKET,
            ContentType: req.file.mimetype,
            Key: req.file.originalname,
            ACL: 'public-read'

        }

        const imageUrl = `${process.env.AWS_ENDPOINT}/${process.env.AWS_BUCKET}/${req.file.originalname}`
        await s3.send(new PutObjectCommand(params))

          const query = {
            text: 'INSERT INTO profiles(id,  name, gambar) VALUES($1, $2, $3) RETURNING *',
            values: [id, req.body.name, imageUrl]
        }
       const result = await client.query(query);

       if(!result.rows) {
        throw new Error('terjadi kesalahan')
       }
       res.status(201).json({data: result.rows[0]})
    

    } catch (error) {
        res.status(500)
        console.error(error)
    }
})


try {
     await dbInitialize(client)
    app.listen(3000, async () =>{
    console.log('Server Up')}
)
} catch (error) {
   console.log(error) 
}