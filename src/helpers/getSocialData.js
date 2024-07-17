"use strict";

module.exports = {
  getName: function (fullName) {
    const nameParts = fullName.trim().split(" ");

    const lastName = nameParts.pop();
    const firstName = nameParts.join(" ");

    return { firstName, lastName };
  },
};
