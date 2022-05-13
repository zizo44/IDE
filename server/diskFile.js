const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");

const dirCodes = path.join(__dirname, "codeFiles");
if (!fs.existsSync(dirCodes)) fs.mkdirSync(dirCodes, { recursive: true });
const dirOutputs = path.join(__dirname, "outputs");
if (!fs.existsSync(dirOutputs)) fs.mkdirSync(dirOutputs, { recursive: true });

const codePath2ObjPath = (Codefilepath) => {
  const fileName = path.basename(Codefilepath).split(".")[0];
  const objFilePath = path.join(dirOutputs, `${fileName}.out`);
  return objFilePath;
};

const path2FileName = (filepath) => {
  const fileName = path.basename(filepath).split(".")[0];
  return fileName;
};

const getDirOutputs = () => {
  return dirOutputs;
};

const createFile = async (format, content) => {
  const jobId = uuid();
  const filename = `${jobId}.${format}`;
  const filepath = path.join(dirCodes, filename);
  await fs.writeFileSync(filepath, content);
  return filepath;
};

const deleteFile = async (filepath) => {
  if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
};

module.exports = {codePath2ObjPath, path2FileName, getDirOutputs, createFile, deleteFile};
