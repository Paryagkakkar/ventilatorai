const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

console.log("🔄 Testing MongoDB Connection...");

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ SUCCESS: Connected to MongoDB Atlas!');
    console.log('Database Name:', mongoose.connection.name);
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ FAILED to connect to MongoDB');
    console.error('Error:', err.message);
    process.exit(1);
  });