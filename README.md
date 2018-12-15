# Private-Blockchain Notary Service

A Star Registry Service that allows users to claim ownership of their favorite star in the night sky with RESTful Web API.  
Project uses a Prototype of Private Blockchain using LevelDB.  
A mempool component of project will store validation requests from user to register a star.

## Getting Started

This project uses node js server and express.js framework for servicing endpoints.

### Prerequisites

- Node js server
- Node package manager
- Express js

### Installing

Install latest node js server along with npm (https://nodejs.org/en/download/)
Clone repository and go to the ExpressApp directory to run following command from terminal:

```
npm install -d
```

To start server, run following command from terminal:
```
npm start
```

Server will be running by default on http://localhost:8000
If server has started successfully, you can go to that URL in a browser and it should return:

```
Server for RESTful Web API!
```

## Project Details
### Endpoints

- Request validation  
Example:  
POST URL: http://localhost:8000/requestValidation  
This URL will return validation request object with validation time window.  
POST request body:
```json
{
      "address": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL"
}
```

- Validate message signature  
Example:  
POST URL: http://localhost:8000/message-signature/validate  
Server will verify the signature sent by the user and authorize user to register a star.  
POST request body:
```json
{
	"address":"19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
	"signature":"H8K4+1MvyJo9tcr2YN2KejwvX1oqneyCH+fsUL1z1WBdWmswB9bijeFfOfMqK68kQ5RO6ZxhomoXQG3fkLaBl+Q="
}
```

- Add star to Star Notary Blockchain  
Example:  
POST URL: http://localhost:8000/block  
Server will add registered star block to private blockchain after encoding star story.  
POST request body:
```json
{
"address": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
    "star": {
            "dec": "68° 52' 56.9",
            "ra": "16h 29m 1.0s",
            "story": "Found star using https://www.google.com/sky/"
        }
}
```

- Get a star by hash  
Example:  
URL: http://localhost:8000/stars/hash:3b74de04ed5ea0f9614096d571a809e54de1aa526610577429eab65642711234

- Get star(s) by wallet address  
Example:  
URL: http://localhost:8000/stars/address:19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL

- Get a star by block-height  
Example:  
URL: http://localhost:8000/block/1

### How to use endpoints

- API allows users to request for validation which stays in mempool for 5 minutes
- User can then submit a validation to verify the signature which stays in mempool for 30 minutes.
- The authorized user can then register star in the blockchain.
- API allows client to look up Stars by hash, wallet address and height.

### Example

- If client wants to add a star data to block-chain, client can start by sending a request to get validation from server by using the endpoint of requestValidation (http://localhost:8000/requestValidation)
- After successful request, client would receive a validation request object in JSON format from server which would look like:

```
{
  "walletAddress": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
  "requestTimeStamp": "1544914075",
  "validationWindow": 300,
  "message": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL:1544914075:starRegistry"
}
```
- Client can use his wallet to sign this message and send a request to server to validate the signature using the endpoint: http://localhost:8000/message-signature/validate
- After successful verification from server, client would receive a validRequestObject in JSON format which would look like:

```
{
  "registerStar": true,
  "status": {
    "address": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
    "requestTimeStamp": "1544914080",
    "message": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL:1544914075:starRegistry",
    "validationWindow": 1800,
    "messageSignature": true
  }
}
```
- This would give client authorization to add one star data block to the block chain on server if the request is sent within the validation window (30 minutes)
- Client would then send star data using the endpoint: http://localhost:8000/block
- If client is authorized, server will add the star block data in block chain and return block details in JSON format which would look like:

```
{
  "hash": "fb9d67979489bcc36394ca3d6cea8d2d158e86278ac9720eeefd54ef5c0197c0",
  "height": 1,
  "body": {
    "address": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
    "star": {
      "ra": "16h 29m 1.0s",
      "dec": "68° 52' 56.9",
      "mag": "",
      "cen": "",
      "story": "466f756e642073746172207573696e672074657374",
      "storyDecoded": "Sample Star Story"
    }
  },
  "time": "1544914087",
  "previousBlockHash": "f9ecfbde2700a2d6315a4abe088bc1e79e6adfc31ea7312ce465443a8edd6b65"
}
```
- Apart from adding star data, client can use other 3 endpoints to browse star block data by hash, block-height or wallet address.

## Authors

* **Chitrang Shah**

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
