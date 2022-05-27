var CodePushWrapper = require("../codePushWrapper.js");
import CodePush from "react-native-washington-push";

module.exports = {
  startTest: function (testApp) {
    CodePush.disallowRestart();
    CodePushWrapper.checkAndInstall(
      testApp,
      () => {
        CodePush.allowRestart();
      },
      undefined,
      CodePush.InstallMode.IMMEDIATE,
      undefined,
      true
    );
  },

  getScenarioName: function () {
    return "disallowRestart";
  },
};
