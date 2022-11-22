# Next Template

This is a [Next.js](https://nextjs.org/) template that is pre setup with mobile using capacitor.js, Tailwind CSS and MobX.

It also comes pre set-up to deploy static websites to github pages.

This template is the predecessor to my previous react template which you can find here [Rocket Template 🚀](https://github.com/AndreCox/Rocket-Template). This new template contains many of the same features however improves it in a couple of key areas.

## About

### Key Features

1. 🗳️ MobX State Management
2. 📱 Fully cross platform, you can create your web app, then deploy to both IOS and Android
3. 🪶 Comes with Tailwindcss by default; no more thinking up css class names while still being lightweight
4. 📄 Github Pages support, simply push your code and your website will be automatically deployed.
5. ⏭️ NEW! Next Js seriously makes development way easier. The major update from previous template.
6. 🖥️ NEW! Tauri Support Build for Windows Mac and Linux

## Getting Started

### The new method
I recommend installing my [nextgen CLI tool](https://github.com/AndreCox/next-gen/releases/latest).
Once this is installed and added to your path all you need to do is type `nextgen`. This tool will guide you through the setup process. 
The following steps are uneccesary.

### Old method


First, install dependencies:

```bash
yarn install
```

Next, run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Building for mobile

```bash
yarn build:mobile
```

You can open in your ide of choice with

```bash
yarn android
```

or

```bash
yarn  ios
```

## Deploy to Github-Pages

To deploy your site to github pages, simply update the `.github\workflows\gh-pages.deploy.yml` file to set the `NEXT_PUBLIC_BASE_PATH:` to the name of your repository. For instance this repository would be `\next-template`

You can also update this file to only deploy when you push to a specific branch. For instance `release`

## Build for Desktop

To develop for desktop (Windows, MacOS, Linux). Simply run

```bash
yarn dev:desktop
```

Once you are happy with your project you can build a production release with

```bash
yarn build:desktop
```

This will output your compiled app to the `src-tauri/target/release` directory. Bundled releases can be found in `src-tauri/target/release/bundle`

In the future this template will come with a github action you can configure to build for Mac Windows and Linux and publish it to github releases.

## All commands

### This lists all commands avalable and their functions

starts dev server and opens browser

```bash
yarn dev
```

starts dev server doesn't open browser

```bash
yarn dev:no-open
```

starts dev server and opens desktop app

```bash
yarn dev:desktop
```

next build generates an optimized version of your application for production

```bash
yarn build
```

builds your app for mobile Android or IOS

```bash
yarn build:mobile
```

builds your app for desktop MacOS, Windows, or Linux

```bash
yarn build:desktop
```

starts the application in production mode

```bash
yarn start
```

exports site to static version in `/out` folder

```bash
yarn export
```

runs code linting using eslint

```bash
yarn lint
```

builds and runs project on Android device

```bash
yarn android
```

builds and runs project on IOS device

```bash
yarn ios
```

opens the browser on default development port

```bash
yarn open-browser
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!
