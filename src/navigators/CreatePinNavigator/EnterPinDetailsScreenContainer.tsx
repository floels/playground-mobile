import { NavigationProp, RouteProp } from "@react-navigation/native";
import * as MediaLibrary from "expo-media-library";
import mime from "mime";
import { useEffect, useState } from "react";
import { Image } from "react-native";

import { CreatePinNavigatorParamList } from "./CreatePinNavigator";
import EnterPinDetailsScreen from "./EnterPinDetailsScreen";

import { API_BASE_URL, API_ENDPOINT_CREATE_PIN } from "@/src/lib/constants";
import { fetchWithAuthentication } from "@/src/lib/utils/fetch";

type EnterPinDetailsScreenContainerProps = {
  navigation: NavigationProp<CreatePinNavigatorParamList>;
  route: RouteProp<CreatePinNavigatorParamList, "EnterPinDetails">;
  handleCreateSuccess: () => void;
};

const EnterPinDetailsScreenContainer = ({
  navigation,
  route,
  handleCreateSuccess,
}: EnterPinDetailsScreenContainerProps) => {
  const { selectedImageURI, providedImageAspectRatio } = route.params;

  const [imageAspectRatio, setImageAspectRatio] = useState(
    providedImageAspectRatio,
  );

  const [pinTitle, setPinTitle] = useState("");
  const [pinDescription, setPinDescription] = useState("");

  // Fetch the image's aspect ratio in case it wasn't provided by the
  // previous screen (can happen if user clicks 'Next' really quickly
  // after selecting the image):
  useEffect(() => {
    if (providedImageAspectRatio === null) {
      Image.getSize(selectedImageURI, (width, height) => {
        setImageAspectRatio(width / height);
      });
    }
  }, [providedImageAspectRatio]);

  const handleSubmit = async () => {
    if (!selectedImageURI) {
      console.warn("No selected image URI!"); // TODO: display error toast
      return;
    }

    const formData = new FormData();

    // The "selectedImageURI" has format: "ph://...-...-...-..."
    // For some reason, passing this URI to 'formData.append(...)'
    // triggers an error: "No suitable URL request handler found for ph-upload."
    // We circumvent it by passing the URI returned by 'MediaLibrary.getAssetInfoAsync'
    // instead, as suggested in the following GitHub issue message:
    // https://github.com/react-native-cameraroll/react-native-cameraroll/issues/52#issuecomment-564641652
    const imageMediaLibraryURI = await getImageMediaLibraryURI();

    const imageMIMEType =
      mime.getType(imageMediaLibraryURI || "") || "image/jpeg";

    formData.append("image_file", {
      uri: imageMediaLibraryURI,
      name: "image_file",
      type: imageMIMEType,
    } as any); // We need to disable type-checking here to avoid
    // an unjustified TypeScript error.
    formData.append("title", pinTitle);
    formData.append("description", pinDescription);

    postFormData(formData);
  };

  const getImageMediaLibraryURI = async () => {
    const imageURIWithoutPrefix = selectedImageURI.slice(5); // the part after "ph://"

    const mediaLibraryAssetInfo = await MediaLibrary.getAssetInfoAsync(
      imageURIWithoutPrefix,
    );

    return mediaLibraryAssetInfo.localUri;
  };

  const postFormData = async (formData: FormData) => {
    let response;

    try {
      response = await fetchWithAuthentication(
        `${API_BASE_URL}/${API_ENDPOINT_CREATE_PIN}/`,
        {
          method: "POST",
          body: formData,
        },
      );
    } catch {
      console.warn("You seem to be offline!"); // TODO: replace with toast message
      return;
    }

    if (!response.ok) {
      console.warn("Pin creation failed!"); // TODO: replace with toast message
      return;
    }

    console.warn("Pin creation succeeded!");

    handleCreateSuccess();
  };

  return (
    <EnterPinDetailsScreen
      selectedImageURI={selectedImageURI}
      imageAspectRatio={imageAspectRatio}
      pinTitle={pinTitle}
      pinDescription={pinDescription}
      handlePressBack={navigation.goBack}
      handleChangePinTitle={setPinTitle}
      handleChangePinDescription={setPinDescription}
      handleSubmit={handleSubmit}
    />
  );
};

export default EnterPinDetailsScreenContainer;