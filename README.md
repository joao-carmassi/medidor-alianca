# Medidor de Aliança

Find your ring size in three steps, using only a credit card and a ring that already fits you

![Medidor de Aliança screenshot](docs/screenshot.png)

**Live:** <https://joao-carmassi.github.io/medidor-alianca/>

## Features

- Calibrates the screen to real size by matching a credit card (85.6 mm wide) to a slider.
- Measures the inside diameter of a ring you already wear, by sliding a circle to match it.
- Converts the measured diameter into a Brazilian ring size (aro) and shows it in millimetres.
- Remembers your calibration on the device, so you can measure again without repeating the first step.
- Opens a prefilled WhatsApp message with your size and diameter, ready to send.

## Tech stack

- [Astro](https://astro.build) 7 (static site generation) with TypeScript
- [Tailwind CSS](https://tailwindcss.com) 4 via the Vite plugin
- ESLint 10 with the Astro plugin for linting
- GitHub Pages, deployed by GitHub Actions on every push to `main`

## Getting started

### Prerequisites

- Node.js 22.12.0 or newer

### Install

```sh
git clone https://github.com/joao-carmassi/medidor-alianca.git
cd medidor-alianca
npm install
```

## Usage

Start the dev server and open the printed address:

```sh
npm run dev
# open http://localhost:4321/medidor-alianca/
```

Other scripts:

- `npm run build` runs ESLint and then builds the site into `dist/`.
- `npm run preview` serves the production build locally.
- `npm run lint` runs ESLint only.

## Configuration

Build-time settings live in `.env.production`:

| Variable | Purpose |
| :--- | :--- |
| `ASTRO_SITE` | Public origin of the site (used for absolute URLs). |
| `ASTRO_BASE` | Base path the site is served from (`/medidor-alianca` on GitHub Pages). |
| `PUBLIC_WHATSAPP_PHONE` | Phone number, digits only with country code, that receives the WhatsApp message. If empty, the link opens WhatsApp without a recipient. |

Create a local `.env` file to override these values for development. It is ignored by Git.

## Deployment

Pushing to `main` runs `.github/workflows/static.yml`, which builds the site with `withastro/action` and publishes it to GitHub Pages. The Pages source is set to GitHub Actions.

## License

No license specified.

---
Made by [João Carmassi](https://github.com/joao-carmassi)
