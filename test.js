let myBlockChain = new Blockchain();

function theLoop (i) {
  setTimeout(function () {
      let blockTest = new Block("Test Block - " + (i + 1));
      console.log(myBlockChain);
      myBlockChain.addBlock(blockTest).then((result) => {
          console.log(result);
          i++;
          if (i < 10) theLoop(i);
      });
  }, 2000);
}

theLoop(0); 