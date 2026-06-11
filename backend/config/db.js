
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const dbURI = process.env.MONGO_URI;
    const conn = await mongoose.connect(dbURI);
    console.log(` Secure Pipeline Linked to MongoDB Host: ${conn.connection.host}`);
  } catch (error) {
    console.error(` Database Initialization Drop Anomaly: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;