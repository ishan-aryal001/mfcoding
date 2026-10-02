const r = require("express").Router();
const c = require("../controllers/notificationController");
const protect = require("../middleware/authMiddleware");
r.use(protect);
r.get("/", c.getAll);
r.put("/read-all", c.markAllRead);
r.put("/:id/read", c.markRead);
module.exports = r;
