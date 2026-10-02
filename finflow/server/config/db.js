const mongoose = require("mongoose");

module.exports = async () => {
  if (!process.env.MONGO_URI) {
    console.warn("MONGO_URI not set. Running without a database.");
    return;
  }
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (e) {
    console.error("DB error:", e.message);
  }
};
