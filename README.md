# friend.ly
A small social media platform that aims to connect people virtually, built using MongoDB, Express, React, and Node.js


## Installation
1. Install the dependencies in the ```/client``` **and** ```/server``` directories by running ```npm install``` in your terminal.
2. Navigate to the ```/client``` directory and run the command ```npm run build``` to have webpack serve static files. 
3. Install the dependencies in the **main** directory (```/```) by running ```npm install```.
4. Create a config.js file in the ```/server``` directory with the following content:
```js
module.exports = {
    'MONGO_URI': // YOUR MONGO_URI GOES HERE,
    'SECRET_KEY': // YOUR PRIVATE KEY GOES HERE
}
```
5. Run the command ```npm start``` and the server will 

## Built with
- [Node.js](https://nodejs.org/)
- [MongoDB](https://mongodb.com/)
- [React](https://reactjs.org/)
- [Express](https://expressjs.com//)

## Contributing

Feel free to open issues and pull requests :)

