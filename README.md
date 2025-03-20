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

## Using Neon with Netlify (Recommended)

[Neon](https://neon.tech) provides serverless PostgreSQL databases that work perfectly with Netlify deployments:

1. **Create a Neon account**:

   - Go to [neon.tech](https://neon.tech) and sign up for a free account
   - You can sign up with GitHub to make the process easier

2. **Create a project**:

   - Click "New Project"
   - Name it "budgetguard" (or any name you prefer)
   - Choose a region closest to your target audience
   - Click "Create Project"

3. **Get your connection string**:

   - After project creation, go to the "Connection Details" tab
   - Under "Connection string", copy the string that looks like:
     ```
     postgresql://[username]:[password]@[endpoint]/[dbname]
     ```

4. **Set up environment variable in Netlify**:

   - In Netlify, go to Site settings > Environment variables
   - Add the DATABASE_URL variable with your Neon connection string

5. **Deploy your site**:
   - Your site will now automatically connect to your Neon database

### Benefits of using Neon:

- **Free tier** for small projects
- **Serverless architecture** that scales with your app
- **Branch databases** for development and testing
- **No connection limits** in the free tier
- **Automatic backups**

## License

MIT
