# StorySage Frontend

This is the web interface implementation of StorySage, an AI-powered framework for conversational autobiography writing. This project is based on the following research:

> **StorySage: Conversational Autobiography Writing Powered by a Multi-Agent Framework**  
> Shayan Talaei, Meijin Li, Kanu Grover, James Kent Hippler, Diyi Yang, Amin Saberi  
> arXiv:2506.14159 [cs.HC], 2025  
> [Paper](https://arxiv.org/abs/2506.14159)

For the core framework and backend implementation, visit: [StorySage](https://github.com/ShayanTalaei/StorySage)

## Key Features

- 🤝 Natural conversation flow
- 🧠 Intelligent memory management
- 📚 Structured biography creation
- 🔄 Continuous learning from interactions

## Getting Started

Follow these instructions to set up and run the project locally.

**Prerequisites:**

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

## Backend Integration

This frontend is designed to work with the StorySage backend. To set up the complete system, Check the "Usage > Web UI Interaction" section in [StorySage](https://github.com/ShayanTalaei/StorySage) following its installation instructions

## Acknowledgments

- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
- [StorySage](https://github.com/ShayanTalaei/StorySage)
