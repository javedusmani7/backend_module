import { scheduleJob, TimeForSchedule} from "../utils/scheduler.js";

// sync function one
export const syncFunctionOne = async function () {
    try {
      console.log("🔹🔹🔹 PROCESS 1 STARTED 🔹🔹🔹");  
      console.log("PROCESS 1 COMPLETED SUCCESSFULLY");
    } catch (error) {
      console.error("ERROR:", error);
    }
};


// sync function two
export const syncFunctionTwo = async function () {
    try {
      console.log("🔹🔹🔹 PROCESS 2 STARTED 🔹🔹🔹");  
      console.log("PROCESS 2 COMPLETED SUCCESSFULLY");
    } catch (error) {
      console.error("ERROR:", error);
    }
};





//schedule the automatic jobs
//please try to give unqie name or unique function name in last argument!
scheduleJob(syncFunctionOne, 1, TimeForSchedule.SECONDS, 'syncContestCompetition');
scheduleJob(syncFunctionTwo, 5, TimeForSchedule.MINUTES, 'syncContestInActive');
// scheduleJob(syncFunctionOne, 1, TimeForSchedule.HOURS, 'syncContestCompetition');
// scheduleJob(takeBackup, 5, TimeForSchedule.DAYS, 'takeBackup');


console.log('Automatic Process is Running!')