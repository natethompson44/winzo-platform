const run = async () => {
  await require('./apiSportsService.test')();
  if (require('../src/services/oddsApiService')) {
    await require('./oddsApiService.test').testOddsApiService();
  }
};

run()
  .then(() => {
    console.log('🎯 All WINZO tests passed with Big Win Energy!');
  })
  .catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
  });
