const moment = require("moment-timezone");
const smtpService = require("../services/smtp.service");
const { convertToLocalTime } = require("./format");

const googleCalendar = (item, tz, userTimezone) => {
  const convertedStartTime = convertToLocalTime(
    item.startTime,
    tz,
    userTimezone
  ).format("YYYYMMDDTHHmmss");

  const convertedEndTime = convertToLocalTime(
    item.endTime,
    tz,
    userTimezone
  ).format("YYYYMMDDTHHmmss");

  let googleCalendarUrl = `http://www.google.com/calendar/event?action=TEMPLATE&text=${encodeURIComponent(
    item.title
  )}&dates=${convertedStartTime}/${convertedEndTime}&details=${encodeURIComponent(
    item.description
  )}&location=${
    item.link
  }&trp=false&sprop=https://www.hackinghrlab.io/&sprop=name:`;
  return googleCalendarUrl;
};
const yahooCalendar = (item, tz, userTimezone) => {
  const convertedStartTime = convertToLocalTime(
    item.startTime,
    tz,
    userTimezone
  ).format("YYYYMMDDTHHmmss");

  const convertedEndTime = convertToLocalTime(
    item.endTime,
    tz,
    userTimezone
  ).format("YYYYMMDDTHHmmss");

  let yahooCalendarUrl = `https://calendar.yahoo.com/?v=60&st=${convertedStartTime}&et=${convertedEndTime}&title=${encodeURIComponent(
    item.title
  )}&desc=${encodeURIComponent(
    item.description
  )}&in_loc=https://www.hackinghrlab.io/global-conference`;
  return yahooCalendarUrl;
};

const generateIcsCalendar = (item, tz) => {
  const convertedStartTime = moment.utc(item.startTime).tz(tz);

  const convertedEndTime = moment.utc(item.endTime).tz(tz);

  return smtpService().generateCalendarInvite(
    convertedStartTime.format("YYYY-MM-DD h:mm a"),
    convertedEndTime.format("YYYY-MM-DD h:mm a"),
    item.title,
    item.description,
    "https://www.hackinghrlab.io/global-conference",
    `${process.env.DOMAIN_URL}${item.id}`,
    "hacking Lab HR",
    process.env.FEEDBACK_EMAIL_CONFIG_SENDER,
    tz
  );
};

module.exports = {
  googleCalendar,
  yahooCalendar,
  generateIcsCalendar,
};
