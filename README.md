# Private-Blockchain Notary Service

A Star Registry Service that allows users to claim ownership of their favorite star in the night sky with RESTful Web API.  
Project uses a Prototype of Private Blockchain using LevelDB.  
A mempool component of project will store validation requests from user to register a star.

## Node.js Framework

This project uses express.js framework for servicing endpoints.

## Project Details

- API allows users to request for validation which stays in mempool for 5 minutes
- User can then submit a validation to verify the signature which stays in mempool for 30 minutes.
- The authorized user can then register star in the blockchain.
- API allows client to look up Stars by hash, wallet address and height.

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
