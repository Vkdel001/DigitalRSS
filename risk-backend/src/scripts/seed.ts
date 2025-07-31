// src/scripts/seed.ts
import { seedAllMasterData } from '../services/masterData.service';

// Run the seeding
seedAllMasterData()
  .then(() => {
    console.log('Seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });