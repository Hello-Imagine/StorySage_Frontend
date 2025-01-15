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

Create a `.env` file in the root directory. Copy the `.env.example` file and fill in the values.

## Usage

Local Development:

- Without Docker: Run `npm run dev` (will run on port 5173)
- With Docker: Run `bash deploy.sh development` (will run on port 8080)

Production Deployment:

- Run `bash deploy.sh` or `bash deploy.sh production` (will run on port 80)

Additional Options:

- `--force-build`: Force rebuild the Docker image even if it exists

```bash
# Force rebuild for development
bash deploy.sh development --force-build

# Force rebuild for production
bash deploy.sh production --force-build
```

Notes:

- The script will reuse existing Docker images unless `--force-build` is specified
- Development mode uses the image tag `ai-friend-frontend-dev:latest`
- Production mode uses the image tag `ai-friend-frontend:latest`
- The script automatically creates and manages the Docker network `ai-friend-network`

## Scripts

Here are the commonly used scripts for this project:

- **`npm run dev`**: Starts the development server.
- **`npm run build`**: Builds the project for production.
- **`npm run preview`**: Previews the production build locally.

## Acknowledgments

- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
