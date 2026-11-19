# Smart Mess

Mess management and food-waste reduction. Students mark meal attendance; admins manage menus, see headcount predictions, and track waste.

## Stack (100% free tier)
- Next.js (App Router) + TypeScript, deployed on Vercel Hobby
- Tailwind CSS, Recharts
- PostgreSQL via Docker locally, Neon free tier in production
- Prisma ORM, Zod validation, bcryptjs for passwords

## Setup
```bash
cp .env.example .env
npm install
npm run db:up        # starts Postgres in Docker
npx prisma migrate dev --name init
npm run db:seed
npm run dev
npm run test
```
Demo logins (after seeding): `admin@mess.local` (admin) or `ali@mess.local` (student), password `password123`.

## Structure
```
prisma/        schema, migrations, seed
src/app/       routes: (student) mobile UI, (admin) desktop dashboard, api/
src/components/ design system and shared UI
src/server/    db client, services (business rules)
src/lib/       validators, time/cutoff logic, utils
src/styles/    design tokens (light/dark)
```
