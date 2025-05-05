
<a name="readme-top"></a>
# 🧋 Bubble Tea Shop

An interactive web application for online ordering of customizable Bubble Tea drinks, built as a single-page application (SPA) with modern e-commerce integration.
<a name="about-the-project"></a>
## 📌 Project Overview

**Bubble Tea Shop** is a non-commercial educational project that simulates an online storefront for crafting and ordering Bubble Tea. Users can build their drink by selecting tea types, milk, syrup, toppings, sweetness level, and temperature. The app features authentication, cart functionality, and order history.

This project showcases the use of **Commercetools**, a modern headless e-commerce platform, integrated into a performant frontend stack with strict type safety and linting.

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#technology-stack">Technology stack</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
       <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#contacts">Contributing</a></li>
  </ol>
</details>

## 🎯 Features

- 👤 User registration, login, and anonymous customer flow
- 🧋 Drink builder with full customization (tea, milk, syrup, toppings)
- 🛒 Shopping cart and checkout flow
- 🔐 Auth via Commercetools Customer Password & Anonymous Flow
- 📦 Order history for logged-in users
- 🧾 Checkout with order summary
- 🧪 Form validation using Zod
- ⚡ Fast development with Vite
- 🎨 UI styled with TailwindCSS
- 🔄 CI/CD support (optional via GitHub Actions)

<a name="technology-stack"></a>
<p align="right">(<a href="#readme-top">back to top</a>)</p>
## 🛠️ Technology Stack

| Category         | Technologies                              |
|------------------|--------------------------------------------|
| Frontend         | [TypeScript](https://www.typescriptlang.org), [Vite](https://vitejs.dev/), [TailwindCSS]             |
| Validation       | [Zod](https://zod.dev/)                    |
| State Management | [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)         |
| API              | [Commercetools SDK](https://docs.commercetools.com/) |
| Auth             | Customer Password and Anonymous Flow       |
| Code Quality     | [ESLint](https://eslint.org/), [Prettier](https://prettier.io/)                           |
| Testing          | Jest, Testing Library (optional)           |
| DevOps           | GitHub Actions / Netlify                   |


### 📁 Project Boards

- GitHub Kanban Board: [🧃 Bubble Tea Kanban](https://github.com/users/grenst/projects/3)
- Jira Workspace: [Jira Link](https://besttorezss.atlassian.net/jira/software/projects/TRIK/boards/2)

<a name="getting-started"></a>
<p align="right">(<a href="#readme-top">back to top</a>)</p>
## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/grenst/bts-e-commerce.git
cd bts-e-commerce
```

<a name="installation"></a>
<p align="right">(<a href="#readme-top">back to top</a>)</p>
### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory with the following contents:

```env
VITE_CTP_PROJECT_KEY=your_project_key
VITE_CTP_CLIENT_ID=your_client_id
VITE_CTP_CLIENT_SECRET=your_client_secret
VITE_CTP_AUTH_URL=https://auth.europe-west1.gcp.commercetools.com
VITE_CTP_API_URL=https://api.europe-west1.gcp.commercetools.com
```

> 🔐 Do not commit this file to version control!

<a name="usage"></a>
<p align="right">(<a href="#readme-top">back to top</a>)</p>
### 4. Run the app

```bash
npm run dev
```

Open your browser at [http://localhost:5173](http://localhost:5173)

## 📜 Available Scripts

| Script           | Purpose                                     |
|------------------|---------------------------------------------|
| `dev`            | Starts the development server (Vite)        |
| `build`          | Builds the app for production               |
| `preview`        | Preview the built project locally           |
| `lint`           | Runs ESLint for code quality checks         |
| `format`         | Formats the code using Prettier             |
| `test`           | Runs tests                                  |
| `type-check`     | Type validation via TypeScript              |

```bash
npm run dev         # start dev server
npm run lint        # run ESLint checks
npm run format      # format with Prettier
npm run build       # production build
```

## 📦 Project Structure

```
bubble-tea-shop/
├── .husky
│   ├── ...
│   └── pre-push
├── src
│   ├── __tests__
│   │   └── ...
│   ├── api
│   │   ├── auth
│   │   ├── orders
│   │   └── products
│   │   │   └── auth.ts
│   │   ├── orders
│   │   │   └── orders.ts
│   │   └── products
│   │       └── products.ts
│   ├── components
│   │   ├── features
│   │   │   └── product-card.ts
│   │   ├── layout
│   │   │   └── footer
│   │   │       ├── footer.scss
│   │   │       └── footer.ts
│   │   ├── test
│   │   │   └── CommerceTest.ts
│   │   └── ui
│   │       └── button
│   │           ├── button.scss
│   │           └── button.ts
│   ├── pages
│   │   ├── auth
│   │   ├── cart
│   │   ├── catalog
│   │   ├── checkout
│   │   ├── home
│   │   └── product
│   ├── router
│   ├── sources
│   │   └── svg-sprite.ts
│   ├── store
│   │   │   └── auth-page.ts
│   │   ├── cart
│   │   │   └── cart.ts
│   │   ├── catalog
│   │   │   └── сatalog.ts
│   │   ├── checkout
│   │   │   └── checkout.ts
│   │   ├── home
│   │   │   └── home.ts
│   │   └── product
│   │       └── product.ts
│   ├── router
│   │   └── router.ts
│   ├── sources
│   │   └── svg-sprite.ts
│   ├── store
│   │   └── store.ts
│   ├── styles
│   │   ├── _fonts.scss
│   │   ├── _mixins.scss
│   │   ├── _variables.scss
│   │   ├── global.scss
│   │   └── tailwind.css
│   ├── types
│   │   └── commercetools.d.ts
│   ├── utils
│   │   ├── apiCommerse.ts
│   │   └── elementUtils.ts
│   ├── index.ts
│   └── vite-env.d.ts
├── .eslintrc.cjs
├── .gitignore
├── .prettierrc.json
├── eslint.config.js
├── index.html
├── jest.config.cjs
├── package.json
├── postcss.config.cjs
├── README.md
├── tailwind.config.cjs
├── tsconfig.json
└── vite.config.ts
```

## 💡 Future Plans

- [ ] Integrate Stripe / PayPal for real checkout
- [ ] Save favorite drinks per user
- [ ] Admin dashboard for managing drinks and pricing
- [ ] Implement starship travel to Mars

<a name="contacts"></a>
<p align="right">(<a href="#readme-top">back to top</a>)</p>
## 📧 Contact

Developer: **Andrii Mansorov**  
[@grenst](https://github.com/grenst)
[VitaliMay](https://github.com/VitaliMay)
[SeregaSimba](https://github.com/SeregaSimba)


**Enjoy your tea time! 🧋**


## 🔧 Technologies Used
<div>
 <img src="https://github.com/devicons/devicon/blob/master/icons/html5/html5-plain-wordmark.svg" title="HTML5" alt="HTML" width="40" height="40"/>&nbsp;

  <img src="https://github.com/devicons/devicon/blob/master/icons/css3/css3-plain-wordmark.svg"  title="CSS3" alt="CSS" width="40" height="40"/>&nbsp;
  
  <img src="https://github.com/devicons/devicon/blob/master/icons/sass/sass-original.svg"  title="SCSS" alt="SCSS" width="40" height="40"/>&nbsp;
  
  <img src="https://github.com/devicons/devicon/blob/master/icons/typescript/typescript-original.svg" title="typescript" alt="typescript" width="40" height="40"/>&nbsp;
  
  <img src="https://github.com/devicons/devicon/blob/master/icons/git/git-original-wordmark.svg" title="Git" alt="Git" width="40" height="40"/>&nbsp;
  
  <img src="https://github.com/devicons/devicon/blob/master/icons/github/github-original.svg" title="Github" alt="Github" width="40" height="40"/>&nbsp;
  
  <img src="https://github.com/devicons/devicon/blob/master/icons/vite/vite-original.svg" title="Vite" alt="Vite" width="40" height="40"/>&nbsp;
  
  <img src="https://github.com/devicons/devicon/blob/master/icons/eslint/eslint-original.svg" title="eslint" alt="eslint" width="40" height="40"/>&nbsp;
  
  <img src="https://github.com/devicons/devicon/blob/master/icons/npm/npm-original-wordmark.svg" title="npm" alt="npm" width="40" height="40"/>&nbsp;
  
  <img src="https://github.com/devicons/devicon/blob/master/icons/markdown/markdown-original.svg" title="markdown" alt="markdown" width="40" height="40"/>&nbsp;
    
  <img src="https://github.com/devicons/devicon/blob/master/icons/tailwindcss/tailwindcss-original.svg" title="Tailwindcss" alt="Tailwindcss" width="40" height="40"/>&nbsp;
  
  
  <img src="https://github.com/devicons/devicon/blob/master/icons/jest/jest-plain.svg" title="Jest" alt="Jest" width="40" height="40"/>&nbsp;
  
  <img src="https://github.com/devicons/devicon/blob/master/icons/netlify/netlify-original.svg" title="Netlify" alt="Netlify" width="40" height="40"/>&nbsp;
  
  <img src="https://github.com/devicons/devicon/blob/master/icons/jira/jira-original.svg" title="Jira" alt="Jira" width="40" height="40"/>&nbsp;
  
  


</div>
