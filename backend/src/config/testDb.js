const mongoose = require('mongoose');
const { connectDB } = require('./database');

const run = async () => {
  console.log('Testing MongoDB connection...');
  const success = await connectDB();
  if (success) {
    console.log('🎉 MongoDB configuration is valid and working!');
    await mongoose.connection.close();
    process.exit(0);
  } else {
    console.log('💡 Please check your MONGODB_URI in backend/.env');
    process.exit(1);
  }
};

run();
