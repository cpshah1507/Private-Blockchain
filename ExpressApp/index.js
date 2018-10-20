// Creating and adding blocks defined in Private Blockchain (From Project 2)
let Blockchain = require('./simpleChain.js');
let Block = require('./Block');
let myBlockChain = new Blockchain();

// Defining and starting Express Framework
const express = require('express');
var bodyParser = require("body-parser");
const app = express();
const port = 8000;

// Using body-parser for getting post request parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Default home page
app.get('/', (req, res) => res.send('Server for RESTful Web API!'));

// GET Request to get Block by Height
app.get('/block/:blockid', function (req, res) {

  var blockID = req.params["blockid"];

  myBlockChain.getBlock(blockID).then(function(data){
  	res.setHeader("Content-Type", "application/json");
  	res.send(data);
  },function(err){
  	res.send("Error in getting block data - block with that height does not exist");
  });
  
});

// POST Request to add block to blockchain
app.post('/', function (req, res) {

  if(req.body.body == null || req.body.body == "")
  {
  	console.log('block body param not found');
  	res.send('Block body parameter not valid in POST Request. Could not create block');
  }
  else
  {
	let blockToAdd = new Block(req.body.body);
	myBlockChain.addBlock(blockToAdd).then((result) =>
	{
	    console.log("Block added with height: " + result);
	    myBlockChain.getBlock(result).then(function(data)
	    {
		  	res.setHeader("Content-Type", "application/json");
		  	res.send(data);
		}, function(err)
		{
		  	res.send("Error in getting block data - block with that height does not exist");
		});
	}, (err) => {
		console.log(err);
	});
  }
})

// GET Request to get Block Form (used for testing POST request)
app.get('/blockForm', function (req, res) {
  	res.send(`
        <!doctype html>
        <html>
        <body>
            <form action="/" method="post">
                <input type="text" name="body" /><br />
                <button>Save</button>
            </form>
        </body>
        </html>
    `);
});

app.listen(port, () => console.log(`Express app listening on port ${port}!`));