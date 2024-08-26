//Imports
const express = require('express')
const axios = require('axios')

//Express Definition/Variables
const app = express()
const port = 3000
//const apiKey = "4bb4629b19c8d2e1fd3dd512"
app.use(express.json());



app.listen(port, () => console.log(`Exchange app listening on port ${port}!`))