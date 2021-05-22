# SSIN - Final Project

In order to install and run, follow the instructions

### Requirements

- [npm](https://www.npmjs.com/) 
- [node.js](https://nodejs.org/en/)

**Note:**  We developed this project using node.js version 16.1.0, so we recommend the use of this version or newer.



### Install requirements

**Linux** 

- Ubuntu / Debian

  ```bash
  sudo apt-get install npm nodejs
  ```

- Arch

  ```bash
  sudo pacman -S npm 		# already includes node.js
  ```

**Windows**

​	[Download node.js and npm](https://nodejs.org/en/) 

**Node.js version**

```bash
node -v
```

This command returns the version of node.js installed in the machine. 

**Note:** If this command doesn't return v16.1.0 or a newer version, we recommend updating node.js to the latest version. That can be achieved by entering:

```bash
sudo npm install -g n
sudo n latest
```

The n module allow for node.js version management. More info [here](https://www.npmjs.com/package/n). 

After this step, the node.js version should no longer be a problem. 

 

### Install project dependencies

**Client dependencies**

```bash
cd client/ 
npm install
```

**Server dependencies**

```bash
cd server/ 
npm install
```



### How to run

**Run a client instance**

```bash
cd client/ 
npm run start
```

**Run server**

```bash
cd server/ 
npm run start
```


# SSIN - Final Project

  

In order to install and run, follow the instructions

  

### Requirements

  

- [npm](https://www.npmjs.com/)

- [node.js](https://nodejs.org/en/)

  

**Note:** We developed this project using node.js version 16.1.0, so we recommend the use of this version or newer.

  
  
  

### Install requirements

  

**Linux**

  

- Ubuntu / Debian

  

```bash

sudo apt-get install npm nodejs

```

  

- Arch

  

```bash

sudo pacman -S npm # already includes node.js

```

  

**Windows**

  

​ [Download node.js and npm](https://nodejs.org/en/)

  

**Node.js version**

  

```bash

node -v

```

  

This command returns the version of node.js installed in the machine.

  

**Note:** If this command doesn't return v16.1.0 or a newer version, we recommend updating node.js to the latest version. That can be achieved by entering:

  

```bash

sudo npm install -g n

sudo n latest

```

  

The n module allow for node.js version management. More info [here](https://www.npmjs.com/package/n).

  

After this step, the node.js version should no longer be a problem.

  

  

### Install project dependencies

  

**Client dependencies**

  

```bash

cd client/

npm install

```

  

**Server dependencies**

  

```bash

cd server/

npm install

```

  
  
  

### How to run

  

**Run a client instance**

  

```bash

cd client/

npm run start

```

  

**Run server**

  

```bash

cd server/

npm run start

```

  

### Generate Certificate Authority and Server private key and certificate

This guide shows how to generate a new Certificate Authority and the Server private key and certificate if you wish to do so. 

## Guide

Generate a Certificate Authority:

```shell

openssl req -new -x509 -days 9999 -keyout ca-key.pem -out ca-crt.pem

```

- Insert a CA Password (this password should be added to server .env file in an environment variable named 'CA_KEY_PASSWORD').

- Specify a CA Common Name, like 'server.CA'. __This MUST be different from both server and clients CN__.

  

### Server certificate

  

Generate Server Key:

```shell

openssl genrsa -out server-key.pem 4096

```

Generate Server certificate signing request:

```shell

openssl req -new -key server-key.pem -out server-csr.pem

```

- Specify server Common Name, like 'server'.

- For this example, do not insert the challenge password.

  

Sign certificate using the CA:

```shell

openssl x509 -req -days 9999 -in server-csr.pem -CA ca-crt.pem -CAkey ca-key.pem -CAcreateserial -out server-crt.pem

```

- insert CA Password

  

Verify server certificate:

```shell

openssl verify -CAfile ca-crt.pem server-crt.pem

```

### Files folders

After following this guide you should have the following files and should move them to the following folders:
1. ca-crt.pem (move to folder server/data/CA)
2. ca-key.pem (move to folder server/data/CA)
3. server-cert.pem (move to folder server/data/keys)
4. server-key.pem (move to folder server/data/keys)
5. server-csr.pem

The server certificate signing request, 'server-csr.pem', is no longer needed so you can delete it.