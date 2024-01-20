import { FlatList, View, Text, TouchableOpacity } from "react-native";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

import styles from "./SearchSuggestionsList.styles";

type SearchSuggestionsListProps = {
  suggestions: string[];
  getSuggestionItemPressHandler: ({
    suggestion,
  }: {
    suggestion: string;
  }) => () => void;
};

const INITAL_NUMBER_ITEMS_TO_RENDER = 12;

const SearchSuggestionsList = ({
  suggestions,
  getSuggestionItemPressHandler,
}: SearchSuggestionsListProps) => {
  const renderSuggestionItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.suggestionContainer}
      testID="search-suggestion-item"
      onPress={getSuggestionItemPressHandler({ suggestion: item })}
    >
      <FontAwesome5 name="search" size={16} style={styles.suggestionIcon} />
      <Text style={styles.suggestionText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={suggestions}
        renderItem={renderSuggestionItem}
        keyExtractor={(_, index) => `search-suggestion-item-${index + 1}`}
        initialNumToRender={INITAL_NUMBER_ITEMS_TO_RENDER}
      />
    </View>
  );
};

export default SearchSuggestionsList;
