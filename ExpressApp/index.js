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

// Custom error handler
function handleError(errMsg, res)
{
  var errorResponse = {"status":400, "message": errMsg}
  res.setHeader("Content-Type", "application/json");
  res.status(400).send(errorResponse);
}

// Helper function to check if element is undefined or empty
function isEmpty(v) {
  if (v == null || v == undefined || v == "") {
    return true;
  }
  return false;
}

// GET Request to get Block by Height
app.get('/block/:blockid', function (req, res) {
  var blockID = req.params["blockid"];

  myBlockChain.getBlock(blockID).then(function(data){
    // validation for genesis block
    if(isEmpty(data.body.star))
      data.body.star['storyDecoded'] = hex2ascii(data.body.star.story);
    res.setHeader("Content-Type", "application/json");
  	res.send(data);
  },function(err){
    handleError("Block with that height does not exist",res);
  });  
});

// GET Request to get star Block by Height
app.get('/stars/hash::blockhash', function (req, res) {
  var blockhash = req.params["blockhash"];

  myBlockChain.getBlockByHash(blockhash).then(function(data)
  {
    if(isEmpty(data))
    {
      handleError("Error in getting block data - block with that hash does not exist",res);
    }
    else
    {
      data.body.star['storyDecoded'] = hex2ascii(data.body.star.story);
      res.setHeader("Content-Type", "application/json");
      res.send(data);
    }
  },function(err){
    handleError("Error in getting block data - block with that hash does not exist",res);
  });  
});

// GET Request to get star Block by Address
app.get('/stars/address::blockaddress', function (req, res) {
  var blockaddress = req.params["blockaddress"];

  myBlockChain.getBlockByWalletAddress(blockaddress).then(function(data)
  {
    if(data.length == 0)
    {
      handleError("Error in getting block data - block with that address does not exist",res);
    }
    for(var i = 0; i < data.length;i++)
    {
      data[i].body.star['storyDecoded'] = hex2ascii(data[i].body.star.story);
    }    
  	res.setHeader("Content-Type", "application/json");
  	res.send(data);
  },function(err){
  	handleError("Error in getting block data - block with that address does not exist",res);
  });
});

// POST Request to add block to blockchain
app.post('/block', function (req, res) {

  if(isEmpty(req.body) ||  isEmpty(req.body.star) || isEmpty(req.body.ra) || isEmpty(req.body.dec))
  {
    console.log('block body params not valid');
    handleError("Invalid message format for add star request",res);
  }
  else
  {
    let starStory = req.body.star.story;

    // validation for story of star
    if(isEmpty(starStory) || starStory.split(" ").length > 250)
    {
      console.log('Star story undefined or too long.');
      handleError("Star story invalid or exceeds 250 words in POST Request. Could not create block",res);
    }

    // validation to make sure only one star story is there per request
    if(Array.isArray(req.body.star))
    {
      console.log('Star param is an array.');
      handleError("Star param is an array in POST Request. Could not create block",res);
    }

    // verify that request validation exists and is verified
    let verified = myMempool.verifyAddressRequest(req.body.address);
    if(!verified)
    {
      console.log('Request validation does not exist or is not verified.');
      handleError("Request validation does not exist or is not verified. Could not create block",res);
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
        handleError("Error in getting block data - block with that height does not exist",res);
      });
    }, (err) => {
      console.log(err);
      handleError("Error in adding block data",res);
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
  if(isEmpty(req.body.address))
  {
    console.log('address param not found');
    handleError("Address parameter not valid in POST Request.",res);
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
  if(isEmpty(req.body.address))
  {
    console.log('Address param not found');
    handleError("Address parameter not valid in POST Request.",res);
  }
  else if(isEmpty(req.body.signature))
  {
    console.log('Signature param not found');
    handleError("Signature parameter not valid in POST Request.",res);
  }
  else
  {
    let validRequestObject = myMempool.validateRequestByWallet(req.body.address,req.body.signature);
    res.setHeader("Content-Type", "application/json");
		res.send(validRequestObject);
  }
});


app.listen(port, () => console.log(`Express app listening on port ${port}!`));