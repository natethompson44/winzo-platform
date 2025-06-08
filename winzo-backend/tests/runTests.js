const run = async () => {
  await require('./apiSportsService.test')();
};

run()
  .then(() => {
    console.log('🎯 All WINZO tests passed with Big Win Energy!');
  })
  .catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
  });
