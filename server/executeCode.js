const { exec } = require("child_process");
const { codePath2ObjPath, path2FileName, getDirOutputs } = require("./diskFile");

const execute = function(command) {
  return new Promise((resolve, reject) => {
    exec(
      command,
      (error, stdout, stderr) => {
        error && reject({ error, stderr });
        stderr && reject(stderr);
        resolve(stdout);
      }
    );
  });
};

const handleCommand = function(user, filepath, runCommand) {
  filepath = filepath.replace(/\\/g, "/");
  filepath = filepath.substring(filepath.indexOf('codeFiles/'), filepath.length);
  var command = `.\\scripts_bat\\wsl_user_file_copy ${user} ${filepath}`;
  execute(command);
  command = `.\\scripts_bat\\wsl_user_run ${user} ${runCommand}`;
  return execute(command);
};

const executeC = (filepath) => {
  const jobId = path2FileName(filepath);
  const user = `a`;
  const runCommand = `"gcc ${jobId}.c -o ${jobId}.out && ./${jobId}.out;rm ${jobId}.c;rm ${jobId}.out"`;
  return handleCommand(user, filepath, runCommand);
};

const executeCpp = (filepath) => {
  const jobId = path2FileName(filepath);
  const user = `a`;
  const runCommand = `"g++ ${jobId}.cpp -o ${jobId}.out && ./${jobId}.out;rm ${jobId}.cpp;rm ${jobId}.out"`;
  return handleCommand(user, filepath, runCommand);
};

const executePy = (filepath) => {
  const jobId = path2FileName(filepath);
  const user = `a`;
  const runCommand = `"python ${jobId}.py;rm ${jobId}.py"`;
  return handleCommand(user, filepath, runCommand);
};

const executeJs = (filepath) => {
  const jobId = path2FileName(filepath);
  const user = `a`;
  const runCommand = `"node ${jobId}.js;rm ${jobId}.js"`;
  return handleCommand(user, filepath, runCommand);
};

const executePhp = (filepath) => {
  const jobId = path2FileName(filepath);
  const user = `a`;
  const runCommand = `"php ${jobId}.php;rm ${jobId}.php"`;
  return handleCommand(user, filepath, runCommand);
};

module.exports = {executeC, executeCpp, executePy, executeJs, executePhp};
