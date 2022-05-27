var CodePushWrapper = require("../codePushWrapper.js");
import CodePush from "react-native-washington-push";

module.exports = {
  startTest: function (testApp) {
    testApp.readyAfterUpdate();
    CodePush.notifyAppReady();
  },

  getScenarioName: function () {
    return "Good Update";
  },
};
