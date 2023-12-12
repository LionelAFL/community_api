const isEmpty = require("lodash").isEmpty;

const getProfileCompletion = (user) => {
  const fields = [
    "firstName",
    "lastName",
    "company",
    "location",
    "city",
    "img",
    "about",
    "titleProfessions",
    "topicsOfInterest",
    "personalLinks",
    "languages",
    "timezone",
    "isOpenReceivingEmail",
    "recentJobLevel",
    "recentWorkArea",
    "sizeOfOrganization",
  ];
  const length = fields.length;
  let countOfCompleted = fields.reduce((res, item) => {
    if (item === "personalLinks") {
      return isEmptyPersonalLinks(user.personalLinks) ? res : res + 1;
    }
    if (item === "isOpenReceivingEmail") {
      return [0, 1].includes(user.isOpenReceivingEmail) ? res + 1 : res;
    }
    return isEmpty(user[item]) ? res : res + 1;
  }, 0);

  return Math.floor((countOfCompleted / length) * 100);
};

const isEmptyPersonalLinks = (personalLinks) => {
  let empty = true;
  if (personalLinks) {
    Object.keys(personalLinks).forEach((contact) => {
      if (personalLinks[contact]) {
        empty = false;
      }
    });
  }

  return empty;
};

function isValidURL(string) {
  var res = string.match(
    /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
  );
  return res !== null;
}

module.exports = { getProfileCompletion, isValidURL };
