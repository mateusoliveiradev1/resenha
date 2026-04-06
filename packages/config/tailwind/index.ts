import type { Config } from "tailwindcss";

export const themeConfig: Pick<Config, "theme"> = {
    theme: {
        extend: {
            colors: {
                navy: {
                    950: "#060E1A",
                    900: "#0A1628",
                    800: "#0F1F38",
                    700: "#162D4D",
                },
                blue: {
                    600: "#1E4D8C",
                    500: "#2563EB",
                    400: "#3B82F6",
                },
                cream: {
                    100: "#F5F0E1",
                    300: "#D4C9AD",
                },
                gold: {
                    400: "#D4A843",
                },
                primary: "#1E4D8C",
                secondary: "#0A1628",
                accent: "#D4A843",
            },
            fontFamily: {
                sans: ["var(--font-inter)", "sans-serif"],
                display: ["var(--font-outfit)", "sans-serif"],
            },
        },
    },
};
