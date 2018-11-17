class Mempool {
    constructor(){
       this.mempool = {};
       this.timeoutRequests = {};
       this.mempoolValid = {};
       this.timeoutMempoolValid = {};
   }

   addRequestValidation(walletAddress)
   {
       let requestObject = {};
       requestObject['walletAddress'] = walletAddress;
       const TimeoutRequestsWindowTime = 5*60*1000;
       const TimeoutMempoolValidWindowTime = 30*60*1000;

       if(walletAddress in this.mempool)
       {
            requestObject = this.mempool[walletAddress];
            let timeElapse = (new Date().getTime().toString().slice(0,-3)) - request.requestTimeStamp;
            let timeLeft = (TimeoutRequestsWindowTime/1000) - timeElapse;
            requestObject.validationWindow = timeLeft;
       }
       else
       {
            this.timeoutRequests[requestObject.walletAddress] = 
                setTimeout(function(){ this.removeValidationRequest(requestObject.walletAddress) }, TimeoutRequestsWindowTime );
            
            requestObject['requestTimeStamp'] = (new Date().getTime().toString().slice(0,-3));
            let timeLeft = (TimeoutRequestsWindowTime/1000);
            requestObject['validationWindow'] = timeLeft;
            requestObject['message'] = requestObject.walletAddress + ":" + requestObject.requestTimeStamp + ":starRegistry";
            this.mempool[walletAddress] = requestObject;
       }
       return requestObject;
   }

   removeValidationRequest(address)
   {
        // TODO
   }   
}


module.exports = Mempool;