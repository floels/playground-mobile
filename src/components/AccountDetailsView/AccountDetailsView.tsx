import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";

import styles from "./AccountDetailsView.styles";
import AccountPictures from "./AccountPictures";
import Spinner from "../Spinner/Spinner";

import { Colors } from "@/src/global.styles";
import { Account } from "@/src/lib/types";

type AccountDetailsViewProps = {
  account: Account | undefined;
  isError: boolean;
  isLoading: boolean;
  onPressBack: () => void;
};

const Logo = (props: any) => (
  <Svg height="16" width="16" viewBox="0 0 24 24" {...props}>
    <Path
      fill={Colors.fontSecondary}
      d="M0 12c0 5.123 3.211 9.497 7.73 11.218-.11-.937-.227-2.482.025-3.566.217-.932 1.401-5.938 1.401-5.938s-.357-.715-.357-1.774c0-1.66.962-2.9 2.161-2.9 1.02 0 1.512.765 1.512 1.682 0 1.025-.653 2.557-.99 3.978-.281 1.189.597 2.159 1.769 2.159 2.123 0 3.756-2.239 3.756-5.471 0-2.861-2.056-4.86-4.991-4.86-3.398 0-5.393 2.549-5.393 5.184 0 1.027.395 2.127.889 2.726a.36.36 0 0 1 .083.343c-.091.378-.293 1.189-.332 1.355-.053.218-.173.265-.4.159-1.492-.694-2.424-2.875-2.424-4.627 0-3.769 2.737-7.229 7.892-7.229 4.144 0 7.365 2.953 7.365 6.899 0 4.117-2.595 7.431-6.199 7.431-1.211 0-2.348-.63-2.738-1.373 0 0-.599 2.282-.744 2.84-.282 1.084-1.064 2.456-1.549 3.235C9.584 23.815 10.77 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12"
    />
  </Svg>
);

const AccountDetailsView = ({
  account,
  isLoading,
  isError,
  onPressBack,
}: AccountDetailsViewProps) => {
  const { t } = useTranslation();

  const hasBackgroundPicture = !!account?.backgroundPictureURL;

  const backButtonIconStyle = hasBackgroundPicture
    ? styles.backButtonIconWithBackgroundPicture
    : null;

  const BackButton = () => (
    <TouchableOpacity
      onPress={onPressBack}
      style={styles.backButton}
      testID="account-details-back-button"
    >
      <FontAwesome5Icon
        name="chevron-left"
        size={20}
        style={backButtonIconStyle}
      />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <BackButton />
        <View style={styles.loadingOrErrorStateContainer}>
          <Spinner>
            <FontAwesome5Icon
              name="spinner"
              size={40}
              style={styles.spinnerIcon}
              testID="account-details-loading-spinner"
            />
          </Spinner>
        </View>
      </View>
    );
  }

  if (isError || !account) {
    return (
      <View style={styles.container}>
        <BackButton />
        <View style={styles.loadingOrErrorStateContainer}>
          <FontAwesome5Icon
            name="exclamation-circle"
            size={40}
            style={styles.errorIcon}
          />
          <Text style={styles.errorText}>
            {t("AccountDetails.ERROR_FETCH_ACCOUNT_DETAILS")}
          </Text>
        </View>
      </View>
    );
  }

  const { displayName, description, username } = account;

  return (
    <View style={styles.container}>
      <BackButton />
      <AccountPictures account={account} />
      <View style={styles.accountData}>
        <Text style={styles.displayName}>{displayName}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
        <View style={styles.logoAndUsername}>
          <Logo style={styles.logo} />
          <Text style={styles.username}>{username}</Text>
        </View>
      </View>
    </View>
  );
};

export default AccountDetailsView;
