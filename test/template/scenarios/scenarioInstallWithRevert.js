var CodePushWrapper = require("../codePushWrapper.js");
import CodePush from "react-native-washington-push";

module.exports = {
  startTest: function (testApp) {
    CodePushWrapper.checkAndInstall(
      testApp,
      undefined,
      undefined,
      CodePush.InstallMode.IMMEDIATE
    );
  },

  getScenarioName: function () {
    return "Install with Revert";
  },
};
