var CodePushWrapper = require("../codePushWrapper.js");
import CodePush from "react-native-washington-push";

module.exports = {
  startTest: function (testApp) {
    CodePushWrapper.sync(testApp, undefined, undefined, {
      installMode: CodePush.InstallMode.ON_NEXT_SUSPEND,
    });
  },

  getScenarioName: function () {
    return "Sync Suspend";
  },
};
