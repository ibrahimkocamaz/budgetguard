# Budget Guard

A personal finance application built with Next.js, Prisma, and PostgreSQL.

## Getting Started

First, set up your environment variables:

```bash
# Copy the example env file and modify it with your values
cp .env.example .env.local
```

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- User authentication
- Expense tracking
- Category management
- Dashboard with charts and analytics
- Responsive design

## Database Setup

This application uses Prisma with PostgreSQL. To set up your local database:

```bash
# Generate Prisma client
npx prisma generate

# Create and seed the database (development only)
npx prisma db push
```

## Deploy on Netlify

This project is configured for deployment on Netlify:

1. Push your code to GitHub
2. Connect your GitHub repo to Netlify
3. Configure the following environment variables in Netlify:

   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXTAUTH_URL`: Your Netlify deployment URL
   - `NEXTAUTH_SECRET`: A secure random string for NextAuth

4. Deploy with the following settings:
   - Build command: `npm run build`
   - Publish directory: `out`

The Netlify configuration is already included in the `netlify.toml` file.

## License

MIT
