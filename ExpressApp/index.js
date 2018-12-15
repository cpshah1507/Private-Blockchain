// Creating and adding blocks defined in Private Blockchain (From Project 2)
let Blockchain = require('./simpleChain.js');
let Block = require('./Block');
let Mempool = require('./Mempool.js');

let myBlockChain = new Blockchain();
let myMempool = new Mempool();

// Defining and starting Express Framework
const express = require('express');
const hex2ascii = require('hex2ascii');
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

// GET Request to get star Block by Height
app.get('/stars/hash::blockhash', function (req, res) {
  var blockhash = req.params["blockhash"];

  myBlockChain.getBlockByHash(blockhash).then(function(data)
  {
    data.body.star['storyDecoded'] = hex2ascii(data.body.star.story);
  	res.setHeader("Content-Type", "application/json");
  	res.send(data);
  },function(err){
  	res.send("Error in getting block data - block with that height does not exist");
  });  
});

// GET Request to get star Block by Address
app.get('/stars/address::blockaddress', function (req, res) {
  var blockaddress = req.params["blockaddress"];

  myBlockChain.getBlockByWalletAddress(blockaddress).then(function(data)
  {
    for(var i = 0; i < data.length;i++)
    {
      data[i].body.star['storyDecoded'] = hex2ascii(data[i].body.star.story);
    }    
  	res.setHeader("Content-Type", "application/json");
  	res.send(data);
  },function(err){
  	res.send("Error in getting block data - block with that height does not exist");
  });
});

// GET Request to get star block by Height
app.get('/stars/height::height', function (req, res) {
  var blockheight = req.params["height"];

  myBlockChain.getBlockByHeight(blockheight).then(function(data)
  {
    data.body.star['storyDecoded'] = hex2ascii(data.body.star.story);
  	res.setHeader("Content-Type", "application/json");
  	res.send(data);
  },function(err){
  	res.send("Error in getting block data - block with that height does not exist");
  });
});

// POST Request to add block to blockchain
app.post('/block', function (req, res) {

  if(req.body == null || req.body == "" || req.body.star == null)
  {
  	console.log('block body params not found');
  	res.send('Block body parameters not valid in POST Request. Could not create block');
  }
  else
  {
    let starStory = req.body.star.story;

    // validation for story of star
    if(starStory === undefined || starStory.split(" ").length > 250)
    {
      console.log('Star story undefined or too long.');
  	  res.send('Star story invalid or exceeds 250 words in POST Request. Could not create block');
    }

    // validation to make sure only one star story is there per request
    if(Array.isArray(req.body.star))
    {
      console.log('Star param is an array.');
  	  res.send('Star param is an array in POST Request. Could not create block');
    }

    // verify that request validation exists and is verified
    let verified = myMempool.verifyAddressRequest(req.body.address);
    if(!verified)
    {
      console.log('Request validation does not exist or is not verified.');
  	  res.send('Request validation does not exist or is not verified. Could not create block');
    }

    if(typeof req.body.star.mag == "undefined")
      req.body.star['mag'] = "";

    if(typeof req.body.star.cen == "undefined")
      req.body.star['cen'] = "";

    let BodyForBlockToAdd = {
      address: req.body.address,
      star: {
        ra: req.body.star.ra,
        dec: req.body.star.dec,
        mag: req.body.star.mag,
        cen: req.body.star.cen,
        story: Buffer(starStory).toString('hex')
      }
    };

    let blockToAdd = new Block(BodyForBlockToAdd);
    myBlockChain.addBlock(blockToAdd).then((result) =>
    {
        // Remove verified request from mempool
        myMempool.removeVerifiedRequest(req.body.address);
        
        console.log("Block added with height: " + result);
        myBlockChain.getBlock(result).then(function(data)
        {
          data.body.star['storyDecoded'] = hex2ascii(data.body.star.story);
          res.setHeader("Content-Type", "application/json");
          res.send(data);
      }, function(err)
      {
          res.send("Error in getting block data - block with that height does not exist");
      });
    }, (err) => {
      console.log(err);
      res.send("Error in adding block data");
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

// POST Request to validate user
app.post('/requestValidation', function (req, res)
{
  if(req.body.address == null || req.body.address == "")
  {
    console.log('address param not found');
    res.send('Address parameter not valid in POST Request.');
  }
  else
  {
    let requestObject = myMempool.addRequestValidation(req.body.address);
    res.setHeader("Content-Type", "application/json");
		res.send(requestObject);
  }
});

// POST request to validate message signature
app.post('/message-signature/validate', function (req, res)
{
  if(req.body.address == null || req.body.address == "")
  {
    console.log('Address param not found');
    res.send('Address parameter not valid in POST Request.');
  }
  else if(req.body.signature == null || req.body.signature == "")
  {
    console.log('Signature param not found');
    res.send('Signature parameter not valid in POST Request.');
  }
  else
  {
    let validRequestObject = myMempool.validateRequestByWallet(req.body.address,req.body.signature);
    res.setHeader("Content-Type", "application/json");
		res.send(validRequestObject);
  }
});


app.listen(port, () => console.log(`Express app listening on port ${port}!`));