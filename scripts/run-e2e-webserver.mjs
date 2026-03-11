import { spawn, spawnSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL("../", import.meta.url));
const prismaDir = resolve(rootDir, "prisma");
const databaseFile = resolve(prismaDir, "e2e.db");
const e2eDistDir = resolve(rootDir, ".next-e2e");
const command = process.platform === "win32" ? "npx.cmd" : "npx";
const sharedEnv = {
  ...process.env,
  DATABASE_URL: "file:./e2e.db",
  NEXT_DIST_DIR: ".next-e2e",
};

function removeDatabaseArtifacts() {
  for (const suffix of ["", "-journal", "-shm", "-wal"]) {
    const candidate = `${databaseFile}${suffix}`;

    if (existsSync(candidate)) {
      rmSync(candidate, { force: true });
    }
  }
}

function runStep(args) {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    env: sharedEnv,
    shell: process.platform === "win32",
    stdio: "inherit",
  });

  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

removeDatabaseArtifacts();
rmSync(e2eDistDir, { recursive: true, force: true });
runStep(["prisma", "db", "push", "--skip-generate"]);
runStep(["prisma", "db", "seed"]);

const server = spawn(
  command,
  ["next", "dev", "--hostname", "127.0.0.1", "--port", "3001"],
  {
    cwd: rootDir,
    env: sharedEnv,
    shell: process.platform === "win32",
    stdio: "inherit",
  },
);

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    server.kill(signal);
  });
}

server.on("exit", (code) => {
  process.exit(code ?? 0);
});

server.on("error", (error) => {
  console.error(error);
  process.exit(1);
});
