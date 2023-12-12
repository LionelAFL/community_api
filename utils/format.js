const moment = require("moment-timezone");
const TimeZoneList = require("../enum/TimeZoneList");
const { Parser } = require("json2csv");
const isEmpty = require("lodash/isEmpty");
const path = require("path");
const Excel = require("exceljs");
const { utc } = require("moment-timezone");

const workbook = new Excel.Workbook();

function convertToCertainTime(date, tz) {
  let res = moment();
  const timezone = TimeZoneList.find((item) => item.value === tz);
  if (timezone) {
    res = moment.utc(date).tz(timezone.utc[0]);
  } else {
    res = moment(date);
  }

  return res;
}

function convertToUserTimezone(date, tz) {
  let res = moment();

  const timezone = TimeZoneList.find((item) => item.utc.includes(tz));

  if (timezone) {
    res = moment(date).tz(timezone.utc[0]);
  } else {
    res = moment(date);
  }

  return res;
}

function convertToLocalTime(date, timezone, userTimezone) {
  let currentTimezone = TimeZoneList.find((item) => item.value === timezone);

  if (currentTimezone) {
    currentTimezone = currentTimezone.utc[0];
  } else {
    currentTimezone = timezone;
  }

  const dateFormatUtc = moment(date,'YYYY-MM-DDTHH:mm:ssZ').utc().format("YYYY-MM-DD HH:mm");

  const dateWithCurrentTimezone = moment.tz(dateFormatUtc, currentTimezone);
  const dateWithLocalTimezone = dateWithCurrentTimezone
    .clone()
    .tz(userTimezone);

  return dateWithLocalTimezone;
}

function convertToUTCTime(date, tz) {
  let res = moment(date).format("YYYY-MM-DD h:mm a");

  const timezone = TimeZoneList.find((item) => item.value === tz);

  if (timezone) {
    res = moment.tz(res, "YYYY-MM-DD h:mm a", timezone.utc[0]).utc().format();
  } else {
    const localTimezone = moment.tz.guess();
    res = moment.tz(res, "YYYY-MM-DD h:mm a", localTimezone).format();
  }

  return res;
}

function getEventPeriod(date, startAndEndTimes, timezone) {
  return startAndEndTimes.map((time, index) => {
    const day = moment(time.startTime).utc();
    const startTime = moment(time.startTime).utc();
    const endTime = moment(time.endTime).utc();

    return `
        <br> ${moment(day).format("LL")} | ${moment(startTime).format(
      "HH:mm"
    )} - ${moment(endTime).format("HH:mm")} ${timezone}
      `;
  });
}

function convertJSONToCSV(content) {
  if (content && !isEmpty(content)) {
    const fields = Object.keys(content[0]);

    return new Parser({ fields }).parse(content);
  }

  return null;
}

async function convertJSONToExcel(sheet, fields, content) {
  // Create page
  const ws1 = workbook.addWorksheet(sheet);
  ws1.addRow(fields.map((item) => item.label));
  fields.forEach((field, index) => {
    ws1.getColumn(index + 1).width = field.width;
  });

  content.forEach((item) => {
    const row = fields.map((field) => item[field.value]);
    ws1.addRow(row);
  });

  const buffer = await workbook.xlsx.writeBuffer();

  return buffer;
}

async function convertJSONToExcelBonfiresUsersParticipants(
  sheet,
  fields,
  content
) {
  // Create page
  const ws1 = workbook.addWorksheet(sheet);
  ws1.addRow(fields.map((item) => item.label));
  fields.forEach((field, index) => {
    ws1.getColumn(index + 1).width = field.width;
  });

  content.forEach((item) => {
    const row = fields.map((field) => item[field.value]);
    ws1.addRow(row);
  });

  await workbook.xlsx.writeFile(`./utils/${sheet}.xlsx`);

  const worksheet = workbook.getWorksheet(sheet);

  workbook.removeWorksheet(worksheet?.id);

  return;
}

async function convertJSONToExcelUsersSpeakers2023(sheet, fields, content) {
  // Create page

  const wb = workbook.addWorksheet(sheet);
  wb.addRow(fields.map((item) => item.label));
  fields.forEach((field, index) => {
    wb.getColumn(index + 1).width = field.width;
  });

  content.forEach((item) => {
    const row = fields.map((field) => item[field.value]);
    wb.addRow(row);
  });

  await workbook.xlsx.writeFile(`./utils/${sheet}.xlsx`);

  const worksheet = workbook.getWorksheet(sheet);
  workbook.removeWorksheet(worksheet.id);

  return;
}

async function convertJSONToExcelPanelsConference2023(
  sheet,
  fields1,
  fields2,
  content
) {
  const wb = workbook.addWorksheet(sheet);

  let number = 2;
  let number2 = 0;
  const cell1 = wb.getCell(`A1`);
  cell1.value = "Sessions";

  fields2.forEach((field, index) => {
    wb.getColumn(index + 1).width = field.width;
  });

  content.forEach((item) => {
    const cell2 = wb.getCell(`A${number}`);
    cell2.value = "";
    wb.getRow(`${number}`).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "c0c0c0" },
    };

    const row1 = fields1.map((item) => item.label);
    wb.addRow(row1, `${number + 1}`);
    wb.getRow(`${number + 1}`).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "c6e9e8" },
    };
    wb.getRow(`${number + 1}`).border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };

    const row2 = fields1.map((field) => item[field.value]);
    wb.addRow(row2, `${number + 2}`);
    wb.getRow(`${number + 2}`).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "c6e9e8" },
    };
    wb.getRow(`${number + 2}`).border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };

    wb.addRow(
      fields2.map((item) => item.label),
      `${number + 3}`
    );
    item.SpeakerMemberPanels.forEach((item, index) => {
      const row = fields2.map((field) => item.User[field.value]);
      wb.addRow(row, `${number + 4 + index}`);
    });

    number2 =
      Number(item.SpeakerMemberPanels.length) !== 0
        ? Number(item.SpeakerMemberPanels.length)
        : 1;

    number = number + 4 + number2;
  });

  await workbook.xlsx.writeFile(`./utils/${sheet}.xlsx`);

  const worksheet = workbook.getWorksheet(sheet);
  workbook.removeWorksheet(worksheet.id);

  return;
}

async function convertJSONToExcelPanelsCouncil(
  sheet,
  fields1,
  fields2,
  content
) {
  const wb = workbook.addWorksheet(sheet);

  let number = 2;
  let number2 = 0;
  const cell1 = wb.getCell(`A1`);
  cell1.value = "Council Event";

  fields2.forEach((field, index) => {
    wb.getColumn(index + 1).width = field.width;
  });

  content.forEach((item) => {
    const cell2 = wb.getCell(`A${number}`);
    cell2.value = "";
    wb.getRow(`${number}`).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "c0c0c0" },
    };

    const row1 = fields1.map((item) => item.label);
    wb.addRow(row1, `${number + 1}`);
    wb.getRow(`${number + 1}`).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "c6e9e8" },
    };
    wb.getRow(`${number + 1}`).border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };

    const row2 = fields1.map((field) => item[field.value]);
    wb.addRow(row2, `${number + 2}`);
    wb.getRow(`${number + 2}`).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "c6e9e8" },
    };
    wb.getRow(`${number + 2}`).border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };

    wb.addRow(
      fields2.map((item) => item.label),
      `${number + 3}`
    );

    item.CouncilEventPanelists.forEach((item, index) => {
      const row = fields2.map((field) => {
        if(field.value === "personalLinks"){
          const caseLink = (item.User[field.value]?.linkedin?.substring(0, 7) !== "http://" && item.User[field.value]?.linkedin?.substring(0, 8) !== "https://")
            ? `https://${item.User[field.value]?.linkedin}`
            : item.User[field.value]?.linkedin

          return caseLink
        }else{
          return item.User[field.value]
        }
      });
      wb.addRow(row, `${number + 4 + index}`);
    });

    number2 =
      Number(item.CouncilEventPanelists.length) !== 0
        ? Number(item.CouncilEventPanelists.length)
        : 1;

    number = number + 4 + number2;
  });

  await workbook.xlsx.writeFile(`./utils/${sheet}.xlsx`);

  const worksheet = workbook.getWorksheet(sheet);
  workbook.removeWorksheet(worksheet.id);

  return;
}

async function convertJSONToExcelFollowersChannels(
  sheet,
  fields1,
  content
) {

  const wb = workbook.addWorksheet(sheet);
  const words = ['A','B','C','D','E','F','G']

  wb.addRow(fields1.map((item) => item?.label));
  fields1.forEach((field, index) => {
    wb.getColumn(index + 1).width = field?.width;
    wb.getCell(`${words[index]}1`).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "ffbba6" },
    };
    wb.getCell(`${words[index]}1`).border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
    wb.getCell(`${words[index]}1`).alignment = { 
      vertical: 'middle', 
      horizontal: 'center' 
    };
  });

  wb.getRow(1).height = 30;

  content.forEach((item) => {
    const row = fields1.map((field) => {
      if(field?.value === 'personalLinks'){
        return item[field?.value]?.linkedin
      }else{
        return item[field?.value]
      }
      
    });
    wb.addRow(row);
  });
  
  await workbook.xlsx.writeFile(`./utils/${sheet}.xlsx`);

  const worksheet = workbook.getWorksheet(sheet);
  workbook.removeWorksheet(worksheet.id);

  return;
}

async function convertJSONToExcelRegisterConference2023(
  sheet,
  fields1,
  content
) {
  const wb = workbook.addWorksheet(sheet);

  let number = 2;
  const cell1 = wb.getCell(`A1`);
  cell1.value = "Conference2023";

  content.forEach((item) => {
    const cell2 = wb.getCell(`A${number}`);
    cell2.value = "";

    if (item.panel !== undefined) {
      item.panel.forEach((itemsPanel) => {
        wb.getRow(`${number}`).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "c0c0c0" },
        };
        const row1 = ["firstName", item.firstName];
        wb.addRow(row1, `${number + 1}`);
        const row2 = ["lastName", item.lastName];
        wb.addRow(row2, `${number + 2}`);
        const row3 = ["email", item.email];
        wb.addRow(row3, `${number + 3}`);

        const row5 = fields1.map((field) => itemsPanel[field.value]);
        wb.addRow(row5, `${number + 4}`);
        wb.getRow(`${number + 4}`).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "c6e9e8" },
        };
        wb.getRow(`${number + 4}`).border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };

        number = number + 5;
      });
    } else {
      wb.getRow(`${number}`).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "c0c0c0" },
      };
      const row1 = ["firstName", item.firstName];
      wb.addRow(row1, `${number + 1}`);
      const row2 = ["lastName", item.lastName];
      wb.addRow(row2, `${number + 2}`);
      const row3 = ["email", item.email];
      wb.addRow(row3, `${number + 3}`);
      number = number + 4;
    }
  });

  await workbook.xlsx.writeFile(`./utils/${sheet}.xlsx`);

  const worksheet = workbook.getWorksheet(sheet);
  workbook.removeWorksheet(worksheet.id);

  return;
}

async function convertJSONToExcelChallenge(
  sheet,
  fields1,
  fields2,
  content
) {
  const wb = workbook.addWorksheet(sheet);

  let number = 2;
  let number2 = 0;
  const cell1 = wb.getCell(`A1`);
  cell1.value = "Challenges";

  fields2.forEach((field, index) => {
    wb.getColumn(index + 1).width = field.width;
  });

  content.forEach((item) => {
    const cell2 = wb.getCell(`A${number}`);
    cell2.value = "";
    wb.getRow(`${number}`).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "c0c0c0" },
    };

    const row1 = fields1.map((item) => item.label);
    wb.addRow(row1, `${number + 1}`);
    wb.getRow(`${number + 1}`).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "c6e9e8" },
    };
    wb.getRow(`${number + 1}`).border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };

    const row2 = fields1.map((field) => item[field.value]);
    wb.addRow(row2, `${number + 2}`);
    wb.getRow(`${number + 2}`).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "c6e9e8" },
    };
    wb.getRow(`${number + 2}`).border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };

    wb.addRow(
      fields2.map((item) => item.label),
      `${number + 3}`
    );

    console.log(item)
    if(item.dataValues){
      (item.dataValues.Users || []).forEach((item, index) => {
        const row = fields2.map((field) => {
          item.User.dataValues[field.value]
        });
        wb.addRow(row, `${number + 4 + index}`);
      });
  
      number2 =
        Number(item.dataValues.Users.length) !== 0
          ? Number(item.dataValues.Users.length)
          : 1;
    }else{
      (item.Users || []).forEach((item, index) => {
        const row = fields2.map((field) => {
          if(item.User !== undefined){
            return item.User.dataValues[field.value]
          }else{
            return item.dataValues[field.value]
          }
          
        });
        wb.addRow(row, `${number + 4 + index}`);
      })

      number2 =
        Number((item.Users || []).length) !== 0
          ? Number((item.Users || []).length)
          : 1;
    }

    number = number + 4 + number2;
  });

  await workbook.xlsx.writeFile(`./utils/${sheet}.xlsx`);

  const worksheet = workbook.getWorksheet(sheet);
  workbook.removeWorksheet(worksheet.id);

  return;
}

module.exports = {
  getEventPeriod,
  convertToCertainTime,
  convertToLocalTime,
  convertToUTCTime,
  convertJSONToCSV,
  convertJSONToExcel,
  convertToUserTimezone,
  convertJSONToExcelUsersSpeakers2023,
  convertJSONToExcelPanelsConference2023,
  convertJSONToExcelPanelsCouncil,
  convertJSONToExcelRegisterConference2023,
  convertJSONToExcelChallenge,
  convertJSONToExcelFollowersChannels,
  convertJSONToExcelBonfiresUsersParticipants,
};
