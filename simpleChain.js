/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');

const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);

// Add data to levelDB with key/value pair
function addLevelDBData(key,value){
  return new Promise(function(resolve,reject){
    db.put(key, value,function(err){
      if(err)
      {
        console.log('Block ' + key + ' submission failed', err);
        reject(err);
      }
      resolve();
    });
  });
}

// Get data from levelDB with key
function getLevelDBData(key){
  return new Promise(function(resolve,reject){
    db.get(key,function(err,value){
      if (err)
      {
        console.log('Key Not found!');
        reject(err);
      }
      resolve(value);
    });
  });
}

// Add data to levelDB with value
function addDataToLevelDB(value) {
    return new Promise(function(resolve, reject){
        let dataArray = [];
        let i = 0;
        db.createReadStream()
        .on('data', function (data) {
            i++;
            dataArray.push(data);
        })
        .on('error', function (err) {
            reject(err);
        })
        .on('close', function () {
            console.log('Block #' + i);
            addLevelDBData(i, value)
            .then(function(){console.log("Block Added");},
              function(err){console.log("error: " + err);});
            resolve(dataArray);
        });
    });
}


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
    this.chainLength = 0;
    let genesis_block = new Block("First block in the chain - Genesis block");
    genesis_block.height = this.chainLength;
    genesis_block.time = new Date().getTime().toString().slice(0,-3);
    genesis_block.hash = SHA256(JSON.stringify(genesis_block)).toString();
    db.put(genesis_block.height,
      JSON.stringify(genesis_block).toString()).then(
      function(data){
        this.chainLength++;
      },function(err){
        console.log(err);
      });
  }

  // Add new block
  addBlock(newBlock)
  {
    // Add genesis block if it doesn't exist
    if(this.chainLength == 0)
    {
      let genesis_block = new Block("First block in the chain - Genesis block");
      genesis_block.height = this.chainLength;
      genesis_block.time = new Date().getTime().toString().slice(0,-3);
      genesis_block.hash = SHA256(JSON.stringify(genesis_block)).toString();
      db.put(genesis_block.height,
        JSON.stringify(genesis_block).toString()).then(
        function(){
          db.put(newBlock.height,
            JSON.stringify(newBlock).toString()).then(
            function(){
              this.chainLength++;
            },function(err){
              console.log(err);
            });
        },function(err){
          console.log(err);
        });
    }
    else if(this.chainLength>0)
    {
      // Block height
      let currentBlockHeight = this.getBlockHeight();
      newBlock.Height = currentBlockHeight + 1;
      // UTC timestamp
      newBlock.time = new Date().getTime().toString().slice(0,-3);
      // previous block hash
      this.getBlock(this.chainLength-1).then((prevBlock) => {
        newBlock.previousBlockHash = prevBlock.hash;
        // Block hash with SHA256 using newBlock and converting to a string
        newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
        // Adding block object to chain
        db.put(newBlock.height,
          JSON.stringify(newBlock).toString()).then(
          function(){
            this.chainLength++;
          },function(err){
            console.log(err);
        });
      });
    }
  }

  // Get block height
  getBlockHeight(){
    return this.chainLength-1;
  }

  // get block
  getBlock(blockHeight){
    return new Promise((resolve, reject) => {
        db.get(blockHeight, function(err, value) {
            if (err) return console.log('Not found!', err);
            resolve(value);
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
    let errorLog = [];
    let promises = [];

    this.getBlockHeight().then((height) => {
      for (var i = 0; i < height; i++) {
        // validate block
        let validateBlockPromise = this.validateBlock(i).then((blockValid) => {
          if(!blockValid)
            errorLog.push(i);
        });
        promises.push(validateBlockPromise);

        // compare blocks hash link
        //let blockHash = this.chain[i].hash;
        //let previousHash = this.chain[i+1].previousBlockHash;
        if (blockHash!==previousHash) {
          errorLog.push(i);
        }

        let hashComparePromise = this.getBlock(i).then((block)=> {
          this.getBlock(i+1).then((nextBlock) => {
            if(block.hash !== nextBlock.previousHash)
            {
              errorLog.push(i);
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
