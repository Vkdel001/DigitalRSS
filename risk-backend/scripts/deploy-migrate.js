// risk-backend/scripts/deploy-migrate.js
const { execSync } = require('child_process');

async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    
    console.log('🌱 Seeding database...');
    execSync('npx ts-node src/scripts/seed.ts', { stdio: 'inherit' });
    
    console.log('✅ Database setup complete!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();