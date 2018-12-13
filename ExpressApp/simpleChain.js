/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');
const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);
const Block = require('./Block');

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
    return new Promise((resolve, reject) => {

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
                  resolve(newBlock.height);
                },function(err){
                  console.log(err);
                  reject(err);
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
                resolve(newBlock.height);
              },function(err){
                console.log(err);
                reject(err);
            });
          });
        }
      });
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
            if (err) {
              console.log('Not found!', err);
              reject(err);
            }
            else
            {
              resolve(JSON.parse(value));
            }
        });
    });
  }

  // get block by hash
  getBlockByHash(hash) {    
    let block = null;
    return new Promise(function(resolve, reject){
        db.createReadStream()
        .on('data', function (data) {
            var blockData = JSON.parse(data.value);
            if(blockData.hash == hash){
                block = blockData;
            }
        })
        .on('error', function (err) {
            reject(err)
        })
        .on('close', function () {
            resolve(block);
        });
    });
  }

  // get block by wallet address
  getBlockByWalletAddress(walletAddress) {
    let blocks = [];
    return new Promise(function(resolve, reject){
        db.createReadStream()
        .on('data', function (data) {
            var blockData = JSON.parse(data.value);
            if(blockData.body.address == walletAddress){
              blocks.push(blockData);
            }
        })
        .on('error', function (err) {
            reject(err)
        })
        .on('close', function () {
            resolve(blocks);
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
    let validatePromises = [];
    let blockPromises = [];
    this.getBlockHeight().then((height) => {

      for (var ind = 0; ind <= height; ind++) {
        validatePromises.push(this.validateBlock(ind));
        blockPromises.push(this.getBlock(ind));
      }

      Promise.all(validatePromises).then((results) => {
        for(var i = 0; i < results.length;i++)
        {
          if(!results[i])
            errorLog.push(i);
        }

        Promise.all(blockPromises).then((blocks) => {
          // compare blocks hash link
          for(var j = 0;j < blocks.length-1;j++)
          {
            if(blocks[j].hash !== blocks[j+1].previousBlockHash)
            {
              errorLog.push(j);
            }
          }

          if (errorLog.length>0) {
            console.log('Block errors = ' + errorLog.length);
            console.log('Blocks: '+errorLog);
          } else {
            console.log('No errors detected');
          }
        });
      });
    });
  }
}

module.exports = Blockchain;
