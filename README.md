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

