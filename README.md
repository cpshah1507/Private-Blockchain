# Private-Blockchain


# Private-Blockchain

RESTful Web API with Simple Prototype of Private Blockchain using LevelDB

## Node.js Framework

This project uses express.js framework for servicing endpoints.


### Endopoints

- Get a block by block-height

Example:

URL: http://localhost:8000/block/0

This URL would give back response of block with block height 0.

{
"hash":"49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3",
"height":0,
"body":"First block in the chain - Genesis block",
"time":"1530311457",
"previousBlockHash":""
}


- Add a new block with POST request

URL: http://localhost:8000/block

{
      "body": "Testing block with test string data"
}

This URL will add a block with body given as parameter and respond with the block in JSON format.