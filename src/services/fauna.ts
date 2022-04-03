import {Client} from 'faunadb'

//configure faunaDB Client with our secret
export const fauna = new Client({
  secret: process.env.FAUNADB_SECRET
})