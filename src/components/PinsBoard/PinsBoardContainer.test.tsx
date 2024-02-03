import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { FetchMock } from "jest-fetch-mock";
import { Image } from "react-native";

import PinsBoardContainer, {
  DEBOUNCE_TIME_SCROLL_DOWN_TO_FETCH_MORE_PINS_MS,
} from "./PinsBoardContainer";

import {
  API_BASE_URL,
  API_ENDPOINT_PIN_SUGGESTIONS,
} from "@/src/lib/constants";
import enTranslations from "@/translations/en.json";

const MOCKED_PIN_THUMBNAIL_HEIGHT = 500;
const NUMBER_PIN_SUGGESTIONS_PER_PAGE = 12;
const SCROLL_VIEW_HEIGHT =
  MOCKED_PIN_THUMBNAIL_HEIGHT * NUMBER_PIN_SUGGESTIONS_PER_PAGE;

jest.mock("expo-secure-store", () => ({
  getItemAsync: () => "access_token",
}));

jest.mock("@/src/components/PinsBoard/PinThumbnail", () => {
  const View = jest.requireActual(
    "react-native/Libraries/Components/View/View",
  );

  const MockedPinThumbnail = () => (
    <View
      style={{ height: MOCKED_PIN_THUMBNAIL_HEIGHT }}
      testID="mocked-pin-thumbnail"
    />
  );

  return MockedPinThumbnail;
});

// Mock Image.getSize()
Image.getSize = jest.fn((uri, success) => {
  process.nextTick(() => {
    success(100, MOCKED_PIN_THUMBNAIL_HEIGHT);
  });
});

const mockPinSuggestionsPage = Array.from(
  { length: NUMBER_PIN_SUGGESTIONS_PER_PAGE },
  (_, index) => ({
    id: `01234567890123${index}`,
    title: "Pin title",
    image_url: "https://some.url.com",
    author: { username: "johndoe", display_name: "John Doe" },
  }),
);

const endpointWithBaseURL = `${API_BASE_URL}/${API_ENDPOINT_PIN_SUGGESTIONS}/`;

const renderComponent = () => {
  render(
    <PinsBoardContainer
      fetchEndpoint={`${API_ENDPOINT_PIN_SUGGESTIONS}/`}
      shouldAuthenticate
    />,
  );
};

beforeEach(() => {
  fetchMock.resetMocks();
});

it(`should fetch and render first page of pin suggestions upon initial render,
and fetch second page upon scroll`, async () => {
  jest.useFakeTimers();

  fetchMock.doMockOnceIf(
    `${endpointWithBaseURL}?page=1`,
    JSON.stringify({
      results: mockPinSuggestionsPage,
    }),
  );

  renderComponent();

  await waitFor(() => {
    const pinThumbnails = screen.queryAllByTestId("mocked-pin-thumbnail");
    expect(pinThumbnails.length).toEqual(NUMBER_PIN_SUGGESTIONS_PER_PAGE);
  });

  act(() => {
    jest.advanceTimersByTime(
      2 * DEBOUNCE_TIME_SCROLL_DOWN_TO_FETCH_MORE_PINS_MS,
    );
  });

  const scrollView = screen.getByTestId("pins-board-scroll-view");
  fireEvent.scroll(scrollView, {
    nativeEvent: {
      contentOffset: {
        y: 2000,
      },
      contentSize: {
        height: SCROLL_VIEW_HEIGHT,
      },
    },
  });

  await waitFor(() => {
    expect(fetch as FetchMock).toHaveBeenLastCalledWith(
      `${endpointWithBaseURL}?page=2`,
      expect.anything(),
    );
  });

  jest.clearAllTimers();
  jest.useRealTimers();
});

it("should display spinner while fetching initial pins", async () => {
  const eternalPromise = new Promise<Response>(() => {});
  fetchMock.mockImplementationOnce(() => eternalPromise);

  renderComponent();

  screen.getByTestId("pins-board-fetch-more-pins-spinner");
});

it("should display error message upon fetch error when fetching initial pins", async () => {
  fetchMock.mockRejectOnce(new Error());

  renderComponent();

  await waitFor(() => {
    screen.getByText(enTranslations.Common.CONNECTION_ERROR);
  });
});

it("should display error message upon KO response when fetching initial pins", async () => {
  fetchMock.doMockOnceIf(`${endpointWithBaseURL}?page=1`, JSON.stringify({}), {
    status: 400,
  });

  renderComponent();

  await waitFor(() => {
    screen.getByText(enTranslations.Common.ERROR_FETCH_MORE_PINS);
  });
});

it("should fetch initial pins again when pulling down", async () => {
  fetchMock.doMockIf(
    `${endpointWithBaseURL}?page=1`,
    JSON.stringify({
      results: mockPinSuggestionsPage,
    }),
  );

  renderComponent();

  const scrollView = screen.getByTestId("pins-board-scroll-view");
  fireEvent.scroll(scrollView, {
    nativeEvent: {
      contentOffset: {
        y: -200,
      },
      contentSize: {
        height: SCROLL_VIEW_HEIGHT,
      },
    },
  });

  await waitFor(() => {
    expect(fetch as FetchMock).toHaveBeenCalledTimes(2);
  });
});
