var CodePushWrapper = require("../codePushWrapper.js");
import CodePush from "react-native-washington-push";

module.exports = {
  startTest: function (testApp) {
    CodePushWrapper.checkAndInstall(
      testApp,
      undefined,
      undefined,
      CodePush.InstallMode.ON_NEXT_RESUME
    );
  },

  getScenarioName: function () {
    return "Install on Resume with Revert";
  },
};
