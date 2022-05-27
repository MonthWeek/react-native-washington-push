var CodePushWrapper = require("../codePushWrapper.js");
import CodePush from "react-native-washington-push";

module.exports = {
  startTest: function (testApp) {
    CodePushWrapper.sync(testApp, undefined, undefined, {
      installMode: CodePush.InstallMode.IMMEDIATE,
    });
    CodePushWrapper.sync(testApp, undefined, undefined, {
      installMode: CodePush.InstallMode.IMMEDIATE,
    });
  },

  getScenarioName: function () {
    return "Sync 2x";
  },
};
