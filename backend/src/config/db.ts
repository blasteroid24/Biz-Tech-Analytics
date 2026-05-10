import {drizzle} from 'drizzle-orm/node-postgres'
import pg from 'pg'
import {env} from './env.js'
import * as schema from '../models/schema.js'

export const pool = new pg.Pool({
    connectionString:env.DATABASE_URL,
    max:20
})

export const db = drizzle(pool,{schema})

pool.on('connect',()=>{
    console.log("Database connected")
})

pool.on('error',(err)=>{
    console.log("Error occured in eastablishing connection with the database", err)
    process.exit(-1)
})