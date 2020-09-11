# friend.ly
A small social media platform that aims to connect people virtually, built using MongoDB, Express, React, and Node.js


## Installation
1. Install the dependencies in the main directory by running ```npm install``` in the terminal.
2. Create a config.js file in the ```/server``` directory with the following content:
```js
module.exports = {
    'MONGO_URI': // YOUR MONGO URI GOES HERE,
    'SECRET_KEY': // YOUR PRIVATE KEY GOES HERE,
    'CLOUD_NAME': // YOUR CLOUD NAME GOES HERE,
    'CLOUD_API_KEY': // YOUR CLOUD API KEY GOES HERE,
    'CLOUD_API_SECRET': // YOUR CLOUD API SECRET GOES HERE
}
```
:warning: **Note:** If you are not using the cloudinary API, please refer to the [multer documentation](https://github.com/expressjs/multer) to store file uploads locally. In this case, your ```config.js``` file should look like this:
```js
module.exports = {
    'MONGO_URI': // YOUR MONGO URI GOES HERE,
    'SECRET_KEY': // YOUR PRIVATE KEY GOES HERE
}
```

3. Run the command ```npm start``` and the server will automatically install subdirectory dependencies & start the servers.

## Demo
![friend.ly demo](https://res.cloudinary.com/friendly-social/image/upload/v1599828700/github/demo_pekg8c.gif)

## Built with
- [Node.js](https://nodejs.org/)
- [MongoDB](https://mongodb.com/)
- [React](https://reactjs.org/)
- [Express](https://expressjs.com//)

## Contributing

Feel free to open issues and pull requests :)

