module.exports = {
  purge: [`./src/**/*.{js,jsx,ts,tsx}`, `./public/index.html`],
  darkMode: false, // or 'media' or 'class'
  theme: {
    container: {
      padding: `2rem`,
    },
    extend: {
      backgroundImage: (theme) => {return {
        "dirt-pattern": `url('./img/dirt.jpg')`,
        "stone-pattern": `url('./img/stone.jpg')`,
      }},
      animation: {
        bounce200: `bounce 1s infinite 200ms`,
        bounce400: `bounce 1s infinite 400ms`,
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
