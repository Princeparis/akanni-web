# Migration README

## Purpose

This document describes the idempotent migration we ran to move local media files to Vercel Blob Storage and how to safely re-run, roll back, and finalize the migration.

## Important files

- scripts/migrate-media-to-vercel-blob.js — migration utility. Supports --dry-run and --confirm. Writes scripts/migration-report.json.
- scripts/migration-report.json — generated report listing candidates and migrated results.
- src/payload.config.ts — registers @payloadcms/storage-vercel-blob using BLOB_READ_WRITE_TOKEN from .env
- src/collections/Media.ts — media collection access rules. We've removed temporary migration-token support; updates now require PAYLOAD_SECRET admin token.

## Prerequisites

- Ensure you have a backup of your database (Mongo/Postgres) or an export of the `media` collection before making changes.
- Ensure the running Payload server is reachable (default: http://localhost:3000) and that PAYLOAD_SECRET and BLOB_READ_WRITE_TOKEN are set in the environment or .env.

## Dry-run (recommended)

This lists candidates and writes scripts/migration-report.json but does not perform uploads or DB updates.

Example:

node scripts/migrate-media-to-vercel-blob.js --server=http://localhost:3000 --payload-secret=<PAYLOAD_SECRET> --dry-run

Review the generated scripts/migration-report.json and confirm all candidates look correct.

## Confirm (perform migration)

This performs uploads (server-side) to Vercel Blob and PATCHes the Payload media docs. The script is idempotent — it skips docs that already contain absolute URLs.

Example:

node scripts/migrate-media-to-vercel-blob.js --server=http://localhost:3000 --payload-secret=<PAYLOAD_SECRET> --confirm

What the script does:

- Scans configured upload directories for matching local files
- For each candidate, uploads to Vercel Blob using @vercel/blob.put() when possible
- If the blob already exists, it computes the public blob URL and uses that instead of overwriting
- PATCHes the corresponding Media doc's `url` (and other fields) using the admin API
- Writes migration results to scripts/migration-report.json

## Rollback plan

If you need to revert the migration:

1. Restore your DB from backup (recommended). This is the safest and fastest rollback.
2. If you don't have a DB backup but have the generated report, you can write a quick script to re-PATCH the media docs to their previous `url` values using the `candidates` section in scripts/migration-report.json.

## Finalization & post-migration steps

1. Remove MIGRATION_TOKEN and any temporary migration headers from deployment secrets and CI variables.
2. Verify admin UI and frontend pages: open several Media docs and pages that reference media assets to confirm assets load from Vercel Blob.
3. Optionally rotate PAYLOAD_SECRET if you want a security refresh.
4. Consider enabling direct client uploads (clientUploads) in the adapter if you want the admin UI to upload directly to Vercel Blob — test in staging first.
5. Remove any temporary dependencies added only for migration (e.g., form-data) and run your package manager to tidy dependencies.

## Notes

- The migration is idempotent: re-running with --dry-run will list the same candidates; re-running with --confirm will skip already-migrated docs.
- The script intentionally avoids overwriting existing blobs. If you want to overwrite, modify the script to pass allowOverwrite: true to @vercel/blob.put(), but be aware that may break cache behavior and URLs for existing consumers.

## Contact/Support

If you'd like, I can:

- Run the final security cleanup to remove MIGRATION_TOKEN (already done in code).
- Create a small rollback helper that uses the generated report to restore previous URLs without a full DB restore.
- Help enable clientUploads and test the admin UI in staging.
