import { extendTheme, StyleFunctionProps } from "@chakra-ui/react";
import { Lato } from "next/font/google";
import stores from "../store/stores";

const lato = Lato({
  variable: "--font-lato",
  weight: ["400", "700"],
  subsets: ["latin"]
});


const breakpoints = {
  sm: "30em",
  md: "48em",
  lg: "62em",
  xl: "80em",
};

const components = {
  Button: {
    baseStyle: {
      fontWeight: "bold",
    },
    sizes: {
      xl: {
        h: "56px",
        fontSize: "lg",
        px: "32px",
      },
    },
    variants: {
      solid: (props: StyleFunctionProps) => {
        const colorScheme = props.colorScheme || "brand";

        return {
          bg: `${colorScheme}.500`,
          color: "white",
          _hover: {
            bg: `${colorScheme}.600`,
            _disabled: {
              bg: `${colorScheme}.500`,
            },
          },
          _active: {
            bg: `${colorScheme}.700`,
          },
        };
      },
    },
  },
  Text: {
    baseStyle: {
      fontWeight: "300",
    },
  },
};

const styles = {
  global: (props: StyleFunctionProps) => ({
    body: {
      bg: props.colorMode === "dark" ? "gray.900" : "#FFFFFA",
      fontFamily: "var(--font-lato), sans-serif", // Apply Lato globally
      color: props.colorMode === "dark" ? "white" : "brand.900", // Dynamic text color
    },
  }),
};

const colors = {
  brand: {
    50: "#f5f7ff",
    100: "#045B64",
    200: "#c5c9ff",
    300: "#a4a9ff",
    400: "#8389ff",
    500: "#6269ff",
    600: "#4a51cc",
    700: "#333999",
    800: "#1b2166",
    900: "#040933",
    1000: "#475467",
    1100:"#434343"
  },
  darkBrand: {
    50: "#1b1f2d",
    100: "#2f3342",
    200: "#4a5066",
    300: "#5e6882",
    400: "#78829c",
    500: "#92a1b3",
    600: "#b1b8ca",
    700: "#c4ccd9",
    800: "#d7e1e8",
    900: "#eaf3f9",
  },
}


const config = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

const fonts = {
  heading: "Montserrat, sans-serif",
  body: "var(--font-lato), sans-serif", // Set Lato as body font globally
};



const {
  themeStore: { themeConfig },
} = stores;

const theme = extendTheme({
  config,
  colors,
  fonts,
  breakpoints,
  components,
  styles,
  ...themeConfig // Spread themeConfig last to allow overrides
});
export { theme, lato };
export default theme;
