// Initialize MongoDB with a user for the application
const rootUsername = process.env.MONGO_ROOT_USERNAME;
const rootPassword = process.env.MONGO_ROOT_PASSWORD;
const database = process.env.MONGO_INITDB_DATABASE;
const appUsername = process.env.MONGO_USERNAME;
const appPassword = process.env.MONGO_PASSWORD;

// Connect to admin database to create app user
const adminDb = db.getSiblingDB('admin');

// Create application user
adminDb.createUser({
  user: appUsername,
  pwd: appPassword,
  roles: [
    {
      role: 'readWrite',
      db: database,
    },
  ],
});

console.log(`User '${appUsername}' created successfully for database '${database}'`);
