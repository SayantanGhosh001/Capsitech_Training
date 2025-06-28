const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Drop the problematic index if it exists
    try {
      const Team = mongoose.model("Team");
      await Team.collection.dropIndex("members.email_1");
      console.log("Dropped the members.email index from teams collection");
    } catch (indexError) {
      // If the index doesn't exist or already dropped, that's fine
      console.log("Note:", indexError.message);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
