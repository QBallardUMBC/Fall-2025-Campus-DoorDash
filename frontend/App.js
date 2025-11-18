import { Platform } from "react-native";

if (Platform.OS === "web") {
  module.exports = require("./App.web").default;
} else {
  module.exports = require("./App.native").default;
}
