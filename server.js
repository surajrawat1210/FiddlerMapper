// index.js

// Import required modules
import express from 'express';
import cors from 'cors';
import path from 'path';
import bodyParser from 'body-parser';
import fs from 'fs';
import { processNetworkData } from './views/helper.js';
// Create an Express application
const app = express();
app.use(cors());
app.set('view engine', 'ejs');
const port = 3000; // Port number
// app.set('views', __dirname + '/views');
// const viewsPath = new URL('./views', import.meta.url).pathname;
app.set('views', "./views");
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));
app.use(express.static('views'));

app.get("/",(req,res)=>{
    res.render("searchData");
})

// Define a route to serve index.html
app.get('/add', (req, res) => {
  // Read the JSON data from the file
  var response = processNetworkData(data);
   
    // Parse the JSON data
    // const jsonData = JSON.parse(response);
   
    // Send the JSON data as response
    res.status(200).json(response);
  });
app.post("/add",(req,res)=>{

  var data = req.body.data;
  var response = processNetworkData(data);
  res.render("index",{data:response});


});
app.post("/graph",(req,res)=>{
  var response = req.body;
  res.render("graph",{data:response.data});

})
// Start the server
app.listen(port, (err) => {
    if(err)
    {
        console.log("error");
    }
  console.log(`Server is running on http://localhost:${port}`);
});


