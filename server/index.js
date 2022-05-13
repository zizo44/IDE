const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
mongoose.connect(
  "mongodb://localhost/compilerdb",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    err && console.error(err);
    console.log("server: successfully connected to MongoDB: compilerdb");
  }
);
const Job = require("./models/Job");
const { addJobToQueue } = require("./jobQueue");
const { createFile } = require("./diskFile");

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post("/run", async (req, res) => {
  const { language = "cpp", code } = req.body;
  console.log("server (/run): language: ", language, " ,code length: ", code.length);
  if (code === undefined) return res.status(400).json({ success: false, error: "code is empty.." });
  
  const filepath = await createFile(language, code);
  const job = await new Job({ language, filepath }).save();
  const jobId = job["_id"];
  addJobToQueue(jobId);
  res.status(201).json({ jobId });
});

// app.get("/result", async (req, res) => {
//   const jobId = req.query.id;
//   const job = await Job.findById(jobId);
//   return res.status(200).json({ job });
// });

app.listen(5000, () => {
  console.log(`server: listening on port 5000`);
});
