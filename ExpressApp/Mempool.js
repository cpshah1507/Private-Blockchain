const bitcoinMessage = require('bitcoinjs-message'); 

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

       if(walletAddress in this.mempool)
       {
            requestObject = this.mempool[walletAddress];
            let timeElapse = (new Date().getTime().toString().slice(0,-3)) - requestObject.requestTimeStamp;
            let timeLeft = (TimeoutRequestsWindowTime/1000) - timeElapse;
            requestObject.validationWindow = timeLeft;
       }
       else
       {
            var self = this;
            this.timeoutRequests[requestObject.walletAddress] = 
                setTimeout(function(){ self.removeValidationRequest(requestObject.walletAddress) }, TimeoutRequestsWindowTime );
            
            requestObject['requestTimeStamp'] = (new Date().getTime().toString().slice(0,-3));
            let timeLeft = (TimeoutRequestsWindowTime/1000);
            requestObject['validationWindow'] = timeLeft;
            requestObject['message'] = requestObject.walletAddress + ":" + requestObject.requestTimeStamp + ":starRegistry";
            this.mempool[walletAddress] = requestObject;
       }
       return requestObject;
   }

   validateRequestByWallet(walletAddress, signature)
   {
        let validRequestObject = {};
        const TimeoutRequestsWindowTime = 5*60*1000;
        if(walletAddress in this.mempool)
        {
            let requestObject = this.mempool[walletAddress];

            // Verify window time
            let timeElapse = (new Date().getTime().toString().slice(0,-3)) - requestObject.requestTimeStamp;
            let timeLeft = (TimeoutRequestsWindowTime/1000) - timeElapse;
            if(timeLeft > 0)
            {
                // Verify the signature
                let isValid = bitcoinMessage.verify(requestObject.message, walletAddress, signature);
                isValid = true;
                if(isValid)
                {
                    const TimeoutMempoolValidWindowTime = 30*60*1000;
                    if(walletAddress in this.mempoolValid)
                    {
                        validRequestObject = this.mempoolValid[walletAddress];
                        let timeElapse = (new Date().getTime().toString().slice(0,-3)) - validRequestObject.status.requestTimeStamp;
                        let timeLeft = (TimeoutMempoolValidWindowTime/1000) - timeElapse;
                        validRequestObject.status.validationWindow = timeLeft;
                    }
                    else
                    {
                        var self = this;
                        this.timeoutMempoolValid[walletAddress] = 
                            setTimeout(function(){ self.removeVerifiedRequest(walletAddress) }, TimeoutMempoolValidWindowTime );

                        let reqTimeStamp = (new Date().getTime().toString().slice(0,-3));
                        let timeLeft = (TimeoutMempoolValidWindowTime/1000);

                        validRequestObject['registerStar'] = true;
                        validRequestObject['status'] = {
                            address: walletAddress,
                            requestTimeStamp: reqTimeStamp,
                            message: requestObject.message,
                            validationWindow: timeLeft,
                            messageSignature: isValid
                        };
                        
                        this.mempoolValid[walletAddress] = validRequestObject;

                        // Clean up timeout array
                        if(walletAddress in this.timeoutRequests)
                            delete this.timeoutRequests[walletAddress];
                    }
                }
            }
        }
        return validRequestObject;
   }

   removeValidationRequest(address)
   {
        if(address in this.mempool)
            delete this.mempool[address];
        if(address in this.timeoutRequests)
            delete this.timeoutRequests[address];
   }   

   removeVerifiedRequest(address)
   {
        if(address in this.timeoutMempoolValid)
            delete this.timeoutMempoolValid[address];
   }

   verifyAddressRequest(address)
   {
       if(address in this.mempoolValid && this.mempoolValid[address].status.messageSignature)
       {
           return true;
       }
       else
       {
           return false;
       }
   }
}


module.exports = Mempool;