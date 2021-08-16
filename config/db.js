const mongoose = require("mongoose");

const { MONOGO_USER_NAME, MONGO_PASSWORD, MONGO_DB_NAME } = process.env;

const connectDB = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${MONOGO_USER_NAME}:${MONGO_PASSWORD}@cluster0.bq8qx.mongodb.net/${MONGO_DB_NAME}?retryWrites=true&w=majority`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
      }
    );
    console.log(
      "\u001b[" +
        34 +
        "m" +
        `Server started on port: ${process.env.PORT} and Connected to Database` +
        "\u001b[0m"
    );
  } catch (error) {
    console.error(error.message);
    // exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
