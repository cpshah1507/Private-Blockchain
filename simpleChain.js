/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');

const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);

/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block{
	constructor(data){
     this.hash = "",
     this.height = 0,
     this.body = data,
     this.time = 0,
     this.previousBlockHash = ""
    }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain{
  constructor(){
    this.getBlockHeight().then((height)=>{
      if(height == -1)
      {
        let genesis_block = new Block("First block in the chain - Genesis block");
        genesis_block.height = 0;
        genesis_block.time = new Date().getTime().toString().slice(0,-3);
        genesis_block.hash = SHA256(JSON.stringify(genesis_block)).toString();
        db.put(genesis_block.height,
        JSON.stringify(genesis_block).toString()).then(
        function(data){
          console.log("Block Added");
        },function(err){
          console.log(err);
        });
      }
    });
  }

  // Add new block
  addBlock(newBlock)
  {
    this.getBlockHeight().then((height)=>{
      // Add genesis block if it doesn't exist
      if(height == -1)
      {
        let genesis_block = new Block("First block in the chain - Genesis block");
        genesis_block.height = 0;
        genesis_block.time = new Date().getTime().toString().slice(0,-3);
        genesis_block.hash = SHA256(JSON.stringify(genesis_block)).toString();
        db.put(genesis_block.height,
          JSON.stringify(genesis_block).toString()).then(
          function(data){
            console.log("Genesis Block Added");
            height = 0;
            // Block height
            newBlock.height = height + 1;
            // UTC timestamp
            newBlock.time = new Date().getTime().toString().slice(0,-3);
            // previous block hash
            newBlock.previousBlockHash = genesis_block.hash;
            // Block hash with SHA256 using newBlock and converting to a string
            newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
            // Adding block object to chain
            db.put(newBlock.height,
              JSON.stringify(newBlock).toString()).then(
              function(data){
                console.log("Block Added");
              },function(err){
                console.log(err);
              });
          },function(err){
            console.log(err);
          });
      }
      else if(height>=0)
      {
        // Block height
        newBlock.height = height + 1;
        // UTC timestamp
        newBlock.time = new Date().getTime().toString().slice(0,-3);
        // previous block hash
        this.getBlock(height).then((prevBlock) => {
          newBlock.previousBlockHash = prevBlock.hash;
          // Block hash with SHA256 using newBlock and converting to a string
          newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
          // Adding block object to chain
          db.put(newBlock.height,
            JSON.stringify(newBlock).toString()).then(
            function(data){
              console.log("Block Added");
            },function(err){
              console.log(err);
          });
        });
      }
    });
  }

  // Get block height
  getBlockHeight(){
    return new Promise((resolve, reject) => {
      let blockHeight = 0;

      db.createReadStream()
      .on('data', function (data) {
        blockHeight++;
      })
      .on('error', function (err) {
        console.log('Error reading from DB', err);
        reject(err);
      })
      .on('close', function () {
          resolve(blockHeight-1);
      });
    });
  }

  // get block
  getBlock(blockHeight){
    return new Promise((resolve, reject) => {
        db.get(blockHeight, function(err, value) {
            if (err) return console.log('Not found!', err);
            resolve(JSON.parse(value));
        });
    });
  }

  // validate block
  validateBlock(blockHeight){
    return new Promise((resolve, reject) => {
      this.getBlock(blockHeight).then((block) => {
        // get block hash
        let blockHash = block.hash;
        // remove block hash to test block integrity
        block.hash = '';
        // generate block hash
        let validBlockHash = SHA256(JSON.stringify(block)).toString();
        // Compare
        if (blockHash===validBlockHash) {
          resolve(true);
        } else {
          console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
          resolve(false);
        }
      });
    });
  }

  // Validate blockchain
  validateChain(){

    // TODO Work in progress
    let errorLog = [];
    let promises = [];

    this.getBlockHeight().then((height) => {
      console.log(height);
      for (var ind = 0; ind < height; ind++) {
        // validate block
        let validateBlockPromise = this.validateBlock(ind).then((blockValid) => {
          if(!blockValid)
            errorLog.push(ind);
        });
        promises.push(validateBlockPromise);

        // compare blocks hash link
        let hashComparePromise = this.getBlock(ind).then((block)=> {
          console.log("ind is: " + ind);
          this.getBlock(ind+1).then((nextBlock) => {
            if(block.hash !== nextBlock.previousHash)
            {
              errorLog.push(ind);
            }
          });
        });
        
        promises.push(hashComparePromise);        
      }

      Promise.all(promises).then((results) => {
        if (errorLog.length>0) {
          console.log('Block errors = ' + errorLog.length);
          console.log('Blocks: '+errorLog);
        } else {
          console.log('No errors detected');
        }
      });
    });
  }
}