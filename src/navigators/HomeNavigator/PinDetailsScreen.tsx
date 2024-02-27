import { NavigationProp, RouteProp } from "@react-navigation/native";
import { TouchableOpacity, View } from "react-native";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";

import styles from "./PinDetailsScreen.styles";

import PinDetails from "@/src/components/PinDetails/PinDetails";
import { useAccountDetailsQuery } from "@/src/hooks/useAccountDetails";
import { HomeNavigatorParamList } from "@/src/navigators/HomeNavigator/HomeNavigator";

type PinDetailsScreenProps = {
  route: RouteProp<HomeNavigatorParamList, "PinDetails">;
  navigation: NavigationProp<HomeNavigatorParamList>;
};

const PinDetailsScreen = ({ route, navigation }: PinDetailsScreenProps) => {
  const { pin, pinImageAspectRatio } = route.params;

  // Pre-fetch pin author information, so the account details
  // screen renders immediately if the user taps the author's name:
  const accountDetailsQuery = useAccountDetailsQuery({
    username: pin.authorUsername,
  });

  const handlePressAuthor = () => {
    navigation.navigate("AuthorAccountDetails", {
      accountDetailsQuery,
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={navigation.goBack}>
        <FontAwesome5Icon
          name="chevron-left"
          size={20}
          style={styles.backButtonIcon}
        />
      </TouchableOpacity>
      <PinDetails
        pin={pin}
        pinImageAspectRatio={pinImageAspectRatio}
        handlePressAuthor={handlePressAuthor}
      />
    </View>
  );
};

export default PinDetailsScreen;
