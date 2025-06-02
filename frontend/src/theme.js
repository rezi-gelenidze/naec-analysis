import { extendTheme } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

const theme = extendTheme({
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  },
  styles: {
    global: (props) => ({
      body: {
        bg: mode("white", "gray.800")(props),
        color: mode("gray.800", "whiteAlpha.900")(props),
      },
    }),
  },
  fonts: {
    body: "'Noto Serif Georgian', serif",
    heading: "'Noto Serif Georgian', serif",
  },
});

export default theme;
