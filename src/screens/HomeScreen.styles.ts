import { StyleSheet } from "react-native";

import { Colors, Fonts } from "../global.styles";

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  tab: {
    paddingBottom: 6,
    borderBottomColor: Colors.colorBlack,
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: Fonts.fontSize200,
    fontWeight: Fonts.fontWeightSemiBold,
  },
});

export default styles;
