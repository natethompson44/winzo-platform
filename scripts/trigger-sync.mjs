import { syncOdds } from '../server/oddsSync.ts';

console.log('Manually triggering odds sync...\n');

syncOdds()
  .then(results => {
    console.log('\n✅ Sync completed!');
    console.log(`   Games created: ${results.gamesCreated}`);
    console.log(`   Games updated: ${results.gamesUpdated}`);
    console.log(`   Errors: ${results.errors.length}`);
    
    if (results.errors.length > 0) {
      console.log('\nErrors:');
      results.errors.forEach(err => console.log(`   - ${err}`));
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Sync failed:', err);
    process.exit(1);
  });
