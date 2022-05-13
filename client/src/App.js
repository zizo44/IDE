import "./App.css";
import React, { useState, useEffect } from "react";
import codeTemplates from "./codeTemplates";
import axios from "axios";
const mqtt = require('mqtt');
var client = mqtt.connect('wss://test.mosquitto.org:8081/mqtt');
var jobIdPending;

function App() {
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("run code for output");
  const [outputStatusError, setoutputStatusError] = useState("");

  client.setMaxListeners(0);
  
  useEffect(() => {
    const defaultLang = localStorage.getItem("ide_default_language") || "cpp";
    setLanguage(defaultLang);
  }, []);

  useEffect(() => {
    setCode(codeTemplates[language]);
  }, [language]);
  
  const confirmSetLanguage = (e) => {
    var shouldSwitch = true;
    if(code !== codeTemplates[language]) {
      shouldSwitch = window.confirm("are you sure you want to change language?\n(your current code will be lost)");
    }
    if (shouldSwitch) {
      setLanguage(e.target.value);
      localStorage.setItem("ide_default_language", e.target.value);
    }
  };

  const runCode = async () => {
    setoutputStatusError("");
    const payload = {language, code};
    try {
      setOutput("");
      const { data: returned } = await axios.post("http://localhost:5000/run", payload);
      if (returned.jobId) {
        if(!client.connected) client = mqtt.connect('mqtts://test.mosquitto.org:8081');
        jobIdPending = returned.jobId.toString();
        var mqttTopic = 'ide_46182735_'+jobIdPending;
        client.subscribe(mqttTopic);
        setOutput("code is running, please wait..");
      } else {
        setOutput("please retry running code again..");
      }
    } catch ({response}) {
      if (response) {
        const errorMessage = response.data.err.stderr;
        setOutput(errorMessage);
      } else {
        setOutput("please retry running code again....");
      }
    }
  };

  client.on('message', async function (topic, message) {
    const job = JSON.parse(message.toString());
    console.log("mqtt result returned");
    // const payload = {params: {id: jobIdPending,},};
    // const { data: returned } = await axios.get(`http://localhost:5000/result`, payload);
    // const { job } = returned;
    const { status: jobStatus, output: jobOutput } = job;
    if (jobStatus === "error") setoutputStatusError("error");
    else setoutputStatusError("");
    setOutput(jobOutput);
    var mqttTopic = 'ide_46182735_'+jobIdPending;
    // client.unsubscribe(mqttTopic);
    client.end();
  });

  client.on('connect', function() {
    console.log("mqtt is connected = " + client.connected);
  });

  return (
    <div className="App">
      <h1>compiler</h1>
      <div>
        <label>language:</label>
        &nbsp;
        <select className="button" value={language} onChange={(e) => {confirmSetLanguage(e)}}>
          <option value="c">c</option>
          <option value="cpp">c++</option>
          <option value="py">python</option>
          <option value="js">js</option>
          <option value="php">php</option>
        </select>
        &nbsp;
        <button className="button" onClick={runCode}>run</button>
      </div>
      <br />
      <textarea className="textArea" rows="20" cols="75" value={code} onChange={(e) => {setCode(e.target.value);}}></textarea>
      <br />
      <br />
      <label>Output: {outputStatusError}</label>
      <p>{output}</p>
    </div>
  );
}

export default App;
