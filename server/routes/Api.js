const apiRouter = require("express").Router();

apiRouter.use("/auth", require("./Auth"));
apiRouter.use("/user", require("./user"));
apiRouter.use("/discover", require("./Discover"));
apiRouter.use("/post", require("./Post"));
apiRouter.use("/comment", require("./Comment"));
apiRouter.use("/notifications", require("./Notification"));

module.exports = apiRouter;
