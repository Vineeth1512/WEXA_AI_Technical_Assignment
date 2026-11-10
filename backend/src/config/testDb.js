const { sequelize, testConnection } = require('./database');

const run = async () => {
  console.log('Testing PostgreSQL connection...');
  const success = await testConnection();
  if (success) {
    console.log('🎉 Database configuration is valid and working!');
  } else {
    console.log('💡 Please check your DATABASE_URL in backend/.env');
  }
  await sequelize.close();
  process.exit(success ? 0 : 1);
};

run();
