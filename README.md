# AI Friend Frontend

This is the frontend for the AI Friend project built with React.

## Frameworks

The project is built with the following frameworks and libraries:

- 🚀 **React**: Frontend framework for building user interfaces.
- 🐜 **Ant Design**: UI framework for React.
- 🎨 **Tailwind CSS**: CSS framework for rapid UI development.
- ⚡ **Vite**: Superfast build tool for modern web projects.

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

Ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## Setup

Install dependencies:

```bash
npm install
```

Create a `.env` file in the root directory with the following content:

```plaintext
VITE_OPENAI_API_KEY=[your openai api key]
VITE_API_BASE_URL=[your api base url] (http://localhost:8000 for local development)
```

## Usage

Local Development:

- Without Docker: Run `npm run dev` (will run on port 5173)
- With Docker: Run `bash deploy.sh local` (will run on port 8080)

Production Deployment:

- Run `bash deploy.sh production`

## Scripts

Here are the commonly used scripts for this project:

- **`npm run dev`**: Starts the development server.
- **`npm run build`**: Builds the project for production.
- **`npm run preview`**: Previews the production build locally.

## Acknowledgments

- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
