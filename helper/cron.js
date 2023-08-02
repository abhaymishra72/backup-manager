const cron = require("node-cron");

function registerDynamicCronJob(schedule, taskName) {
  try {
    cron.schedule(schedule, () => myCronJob(taskName));
    console.log(
      `Cron job "${taskName}" scheduled with schedule: "${schedule}"`
    );
  } catch (error) {
    console.error(`Error scheduling cron job "${taskName}":`, error.message);
  }
}

module.exports = registerDynamicCronJob;
