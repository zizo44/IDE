const Queue = require("bull");
const Job = require("./models/Job");
const { executeC, executeCpp, executePy, executeJs, executePhp } = require("./executeCode");
const mqtt = require('mqtt');

const jobQueue = new Queue("job-runner-queue");
const NUM_WORKERS = 5;
const { codePath2ObjPath, deleteFile } = require("./diskFile");

jobQueue.process(NUM_WORKERS, async ({ data }) => {
  const jobId = data.id;
  const job = await Job.findById(jobId);
  if (job === undefined) throw Error(`serverWorker: cannot find Job with id ${jobId}`);
  try {
    let output;
    job["startedAt"] = new Date();
    switch(job.language) {
      case "c":
        output = await executeC(job.filepath);
        break;
      case "cpp":
        output = await executeCpp(job.filepath);
        break;
      case "py":
        output = await executePy(job.filepath);
        break;
      case "js":
        output = await executeJs(job.filepath);
        break;
      case "php":
        output = await executePhp(job.filepath);
        break;
    }
    output = output.substring(output.indexOf('\n'), output.length);
    output = output.substring(output.indexOf('\r'), output.length);
    output = output.substring(output.indexOf('\n'), output.length);

    job["completedAt"] = new Date();
    job["output"] = output;
    job["status"] = "success";
    await job.save();
  } catch (err) {
    job["completedAt"] = new Date();
    job["output"] = JSON.stringify(err);
    job["status"] = "error";
    await job.save();
  }
  const objFilePath = codePath2ObjPath(job.filepath);
  deleteFile(job.filepath);
  deleteFile(objFilePath);

  var client  = mqtt.connect('mqtt://test.mosquitto.org');
  var jobIdString = jobId.toString();
  var mqttTopic = 'ide_46182735_'+jobIdString;
  var mqttMessage = JSON.stringify({"status": job["status"], "output": job["output"]});
  client.on('connect', ()=>{
    client.publish(mqttTopic, mqttMessage)
    console.log('serverWorker: Mqtt message sent, topic: ', mqttTopic)
    client.end();
  })

  return true;
});

jobQueue.on("failed", (error) => {
  console.error("serverWorker: ", error.data.id, error.failedReason);
});

const addJobToQueue = async (jobId) => {
  jobQueue.add({
    id: jobId,
  });
};

module.exports = {addJobToQueue};
