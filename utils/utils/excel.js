const XLSX = require("xlsx");
const path = require("path");

const readExcelFile = (fileName) => {
  const filepath = path.resolve(__dirname, `docs/${fileName}`);

  const workbook = XLSX.readFile(filepath);
  const sheetNameList = workbook.SheetNames;
  const xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNameList[0]]);

  console.log(xlData);
  return xlData;
};

const progressLog = (msg) => {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(msg);
}

module.exports = {
  readExcelFile,
  progressLog,
};
