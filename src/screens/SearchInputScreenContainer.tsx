import { NavigationProp, RouteProp } from "@react-navigation/native";
import debounce from "lodash/debounce";
import { useEffect, useState } from "react";

import SearchInputScreen from "./SearchInputScreen";
import {
  API_BASE_URL,
  API_ENDPOINT_SEARCH_SUGGESTIONS,
} from "../lib/constants";
import { SearchNavigatorParamList } from "../navigators/SearchNavigator";

type SearchInputScreenProps = {
  route: RouteProp<SearchNavigatorParamList, "SearchInput">;
  navigation: NavigationProp<SearchNavigatorParamList>;
};

const AUTOCOMPLETE_DEBOUNCE_TIME_MS = 300;

const getSuggestionsWithSearchTermAtTop = ({
  searchTerm,
  originalSuggestions,
}: {
  searchTerm: string;
  originalSuggestions: string[];
}) => {
  const MAX_SUGGESTIONS = 12;

  const isSearchTermIncludedInSuggestions =
    originalSuggestions.includes(searchTerm);

  if (isSearchTermIncludedInSuggestions) {
    // NB: normally the API returns 12 suggestions at most
    // so this `slice` is just for precaution.
    return originalSuggestions.slice(0, MAX_SUGGESTIONS);
  }

  // If search term is not present, add searchTerm as the first suggestion
  // (and drop the last suggestion received from the API):
  const remainingSuggestions = originalSuggestions.slice(
    0,
    MAX_SUGGESTIONS - 1,
  );

  return [searchTerm, ...remainingSuggestions];
};

const SearchInputScreenContainer = ({
  route,
  navigation,
}: SearchInputScreenProps) => {
  const [inputValue, setInputValue] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);

  const handlePressClear = () => {
    setInputValue("");
  };

  const handleSearchInputSubmit = () => {
    navigation.navigate("SearchResults", { searchTerm: inputValue });
  };

  const fetchSearchSuggestions = async () => {
    let response;

    try {
      response = await fetch(
        `${API_BASE_URL}/${API_ENDPOINT_SEARCH_SUGGESTIONS}/?search=${inputValue.toLowerCase()}`,
      );
    } catch {
      setSearchSuggestions([]);
      return;
    }

    if (!response.ok) {
      setSearchSuggestions([]);
      return;
    }

    let responseData;

    try {
      responseData = await response.json();
    } catch {
      setSearchSuggestions([]);
      return;
    }

    const suggestionsWithSearchTermAtTop = getSuggestionsWithSearchTermAtTop({
      searchTerm: inputValue,
      originalSuggestions: responseData.results,
    });

    setSearchSuggestions(suggestionsWithSearchTermAtTop);
  };

  const debouncedFetchSearchSuggestions = debounce(
    fetchSearchSuggestions,
    AUTOCOMPLETE_DEBOUNCE_TIME_MS,
  );

  useEffect(() => {
    const { initialSearchTerm } = route.params;

    if (initialSearchTerm) {
      setInputValue(initialSearchTerm);
    }
  }, []);

  useEffect(() => {
    if (!inputValue) {
      setSearchSuggestions([]);
      return;
    }

    debouncedFetchSearchSuggestions();

    return () => {
      debouncedFetchSearchSuggestions.cancel();
    };
  }, [inputValue]);

  useEffect(() => {
    if (!inputValue) {
      setSearchSuggestions([]);
    }
  }, [inputValue]);

  return (
    <SearchInputScreen
      inputValue={inputValue}
      onInputChange={setInputValue}
      searchSuggestions={searchSuggestions}
      onPressClear={handlePressClear}
      onSearchInputSubmit={handleSearchInputSubmit}
      onPressCancel={navigation.goBack}
    />
  );
};

export default SearchInputScreenContainer;