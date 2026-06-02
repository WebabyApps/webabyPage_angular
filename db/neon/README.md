# Neon setup

Use Neon as the production Postgres database for Webaby blog posts, meetup events and event signups.

## Create project

Recommended project settings:

- Project name: `Webaby`
- Postgres version: `17`
- Region: closest to deployment/users, for example `AWS Europe West 2 (London)`
- Enable Neon Auth: `on`

Neon Auth is useful here because users, sessions and auth state live in the database under the `neon_auth` schema. Keep app-specific relationships in public tables by storing the auth user id as text (`author_user_id`, `created_by_user_id`, `user_id`) until the exact Neon Auth schema is wired into the application layer.

## Apply schema

Run this in the Neon SQL editor:

```sql
\i db/neon/001_initial_content.sql
```

If the SQL editor does not support `\i`, paste the contents of `001_initial_content.sql` and run it.

## Environment

Do not put `DATABASE_URL` in Angular browser environment files. It must only be used by the SSR/API server.

Required server variables for the next integration step:

```bash
DATABASE_URL="postgresql://...?sslmode=verify-full"
ADMIN_EMAIL="your-admin-email@example.com"
NEON_AUTH_ENABLED="true"
NEON_AUTH_URL="https://..."
```

The current Angular prototype still uses local storage for content writes. The next step is adding server API endpoints that read/write these Neon tables and validate Neon Auth sessions before admin actions.
