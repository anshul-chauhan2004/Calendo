# Local Run Notes

## Important

This project currently uses:

- `Prisma ORM 7`
- `Neon PostgreSQL`

### Node Version Requirement

Prisma 7 CLI is sensitive to Node version.

Use:

- `Node 20.19.0+`
- or `Node 22.x`

If you are on `Node 20.18.x`, commands like:

- `npm run prisma:generate`
- `npm run prisma:push`

can fail before the app even starts.

## Practical Local Run Path

Once dependencies are installed and the database is already synced and seeded, you only need:

```bash
cd server
npm run dev
```

```bash
cd client
npm run dev
```

## If You Need Full Prisma Commands Locally

Upgrade Node first, then run:

```bash
cd server
npm install
npm run prisma:generate
npm run prisma:push
npm run db:seed
npm run dev
```

## Neon Runtime Note

The server and seed script are configured with the `ws` WebSocket constructor required by the Neon serverless driver in Node.js.
