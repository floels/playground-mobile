import { render, screen, userEvent } from "@testing-library/react-native";
import enTranslations from "@/translations/en.json";

import LandingScreen from "./LandingScreen";

const mockNavigation = {
  navigate: jest.fn(),
} as any;

const renderComponent = () => {
  render(<LandingScreen navigation={mockNavigation} />);
};

it("should navigate to login screen when pressing 'Log in' button", async () => {
  jest.useFakeTimers();

  renderComponent();

  const logInButton = screen.getByText(enTranslations.LandingScreen.LOG_IN);
  await userEvent.press(logInButton);

  expect(mockNavigation.navigate).toHaveBeenCalledWith("LoginScreen");

  jest.useRealTimers();
});
