const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error.message);
    
    // If authentication fails, provide helpful message
    if (error.message.includes('authentication failed')) {
      console.log('\n💡 MongoDB Authentication Failed!');
      console.log('Please check your MONGODB_URI in .env file');
      console.log('For local MongoDB: mongodb://localhost:27017/userdb');
      console.log('For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/dbname');
    }
    
    process.exit(1);
  }
};

module.exports = connectDB;
