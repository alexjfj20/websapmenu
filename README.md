# WebSap Vue.js Application

## Descripción del Proyecto
Esta es una aplicación Vue.js diseñada para gestionar recursos y procesos de una empresa.

## Project Overview
This is a Vue.js application designed to manage company resources and processes.

## Setup and Installation

### Prerequisites
- Node.js (v14+)
- npm or yarn
- PostgreSQL database

### Local Development Setup
1. Clone the repository
   ```
   git clone https://github.com/your-username/websap.git
   cd websap
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables by creating a `.env` file:
   ```
   DATABASE_URL=postgres://username:password@localhost:5432/database_name
   NODE_ENV=development
   PORT=3000
   ```

4. Run the development server
   ```
   npm run serve
   ```

## Deployment

### Deploying to Render.com
1. Create a new Web Service on Render.com
2. Connect your GitHub repository
3. Configure the following settings:
   - Build Command: `npm run build`
   - Start Command: `npm start`

4. Add environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string provided by Render
   - `NODE_ENV`: production

5. Deploy your application

### Database Setup
1. Create a PostgreSQL database on Render.com
2. Use the connection details provided by Render in your application's environment variables

## Technologies Used
- Vue.js
- Node.js
- PostgreSQL
- [Other libraries/frameworks used in your project]