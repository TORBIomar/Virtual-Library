# Zen Shelf Hub / Virtual Library

A stunning, AI-powered digital library reading platform. This project provides a distraction-free environment to read books, write reviews, and maintain a wishlist, while integrating an intelligent AI companion powered by Gemini to help you analyze and understand the books as you read.

![Zen Shelf Hub](https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800)

## Features

- **Beautiful Reading Experience**: Clean, customizable reading interface with page persistence, adjustable font sizes, and Zen mode.
- **AI Reading Companion**: Select text or ask questions directly to an AI chat bot that uses RAG (Retrieval-Augmented Generation) to ground its answers exclusively in the context of the book you are reading.
- **Book Uploading & Parsing**: Admin panel to upload EPUBs and PDFs. The backend automatically extracts the text using Apache Tika and generates vector embeddings for semantic search.
- **Reviews & Ratings**: Share your thoughts on books and view aggregated ratings from other readers.
- **Dynamic Administration**: Manage users, moderate reviews, and dynamically configure the AI model and API keys directly from the UI.

## Technology Stack

- **Frontend**: React, Vite, TypeScript, Tailwind CSS, TanStack Router
- **Backend**: Java 17, Spring Boot 3, Spring Security, Spring AI, Hibernate
- **Database**: MySQL 8
- **Vector Database**: ChromaDB
- **Infrastructure**: Docker & Docker Compose, Nginx

## Getting Started (Docker)

The absolute easiest way to run the entire stack is using Docker Compose.

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) installed and running.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/TORBIomar/Virtual-Library.git
   cd Virtual-Library
   ```

2. Start the stack:
   ```bash
   docker-compose up --build -d
   ```

3. Access the application:
   - Open your browser and navigate to `http://localhost:3000`
   - Register a new account.
   - Go to the Admin dashboard to configure your Gemini API Key and upload your first book!

## Local Development Setup

If you wish to develop locally without Dockerizing the frontend/backend:

1. **Start Infrastructure**:
   Spin up MySQL and ChromaDB:
   ```bash
   docker-compose up mysql chromadb -d
   ```

2. **Backend**:
   Navigate to the `Backend` directory and run:
   ```bash
   ./mvnw spring-boot:run
   ```

3. **Frontend**:
   Navigate to the `Frontend` directory, install dependencies, and start the dev server:
   ```bash
   npm install
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`.

## Environment Variables
If running locally (not via docker-compose), ensure your backend `application.properties` has your Gemini API key configured, or provide it via the Admin UI.

## License
MIT License
