/**
 * build-analytics-fixture.ts (TASK-194) — builds a COPY of the site into `.next-analytics` with a stub
 * Mixpanel token, for tests/e2e/analytics.spec.ts. The normal `.next` build has no token (analytics is a
 * no-op there) and the token is inlined at build time, so the "events fire" tests need their own build.
 *
 * The stub token is not a real project: every request to Mixpanel is intercepted in the test and none
 * ever leaves the machine. `NEXT_PUBLIC_ANALYTICS_ENV=development` lets the stub run on 127.0.0.1.
 * Next rewrites `tsconfig.json` and `next-env.d.ts` to mention the alternate dist dir; both are restored.
 *
 * Usage: pnpm build:analytics-fixture
 */
import { copyFileSync, existsSync, unlinkSync } from "node:fs";
import { spawnSync } from "node:child_process";

const FILES = ["tsconfig.json", "next-env.d.ts"];
const backups = FILES.map((f) => [f, `${f}.analytics-bak`] as const);
for (const [file, backup] of backups) copyFileSync(file, backup);

let status = 1;
try {
  const result = spawnSync("pnpm", ["exec", "dotenv", "-e", ".env.tooling", "--", "next", "build"], {
    stdio: "inherit",
    env: {
      ...process.env,
      NEXT_DIST_DIR: ".next-analytics",
      NEXT_PUBLIC_MIXPANEL_TOKEN: "0123456789abcdef0123456789abcdef",
      NEXT_PUBLIC_ANALYTICS_ENV: "development",
    },
  });
  status = result.status ?? 1;
} finally {
  for (const [file, backup] of backups) {
    if (existsSync(backup)) {
      copyFileSync(backup, file);
      unlinkSync(backup);
    }
  }
}
process.exit(status);
