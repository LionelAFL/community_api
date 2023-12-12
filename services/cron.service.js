const CronJobManager = require("cron-job-manager");

const cronJobManager = new CronJobManager();

const cronService = () => {
  const addTask = (name, interval, once, callback) => {
    if (!cronJobManager.exists(name)) {
      cronJobManager.add(name, interval, () => {
        callback();
        if (once) {
          cronJobManager.stop(name);
          cronJobManager.deleteJob(name);
        }
      });
      cronJobManager.start(name);
    } else {
      console.log("****** already that task is running.");
    }
  };

  const updateTask = (name, interval, once, callback) => {
    if (cronJobManager.exists(name)) {
      cronJobManager.update(name, interval, () => {
        callback();
        if (once) {
          cronJobManager.stop(name);
          cronJobManager.deleteJob(name);
        }
      });
    }
  };

  const stopTask = (name) => {
    if (cronJobManager.exists(name)) {
      cronJobManager.stop(name);
      cronJobManager.deleteJob(name);
    }
  };

  const stopAllTasks = () => {
    cronJobManager.stopAll();
  };

  const listCrons = () => {
    return cronJobManager.listCrons();
  };

  return {
    addTask,
    updateTask,
    stopTask,
    stopAllTasks,
    listCrons,
  };
};

module.exports = cronService;
