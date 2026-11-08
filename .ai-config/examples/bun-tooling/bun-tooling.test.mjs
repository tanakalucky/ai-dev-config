import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import test from "node:test"

const sample = new URL("./", import.meta.url)

// BUN-01 / BUN-03: CI と同じコマンドをコピー先で実行する。
test("新規配置で frozen install と正常コードの整形・lint が成功し lockfile は変わらない", () => {
  const project = createProject()
  try {
    const lockBefore = readFileSync(join(project, "bun.lock"), "utf8")
    writeFileSync(join(project, "index.ts"), "export const answer = 42\n")

    const install = run(project, "install", "--frozen-lockfile", "--ignore-scripts")
    const format = run(project, "run", "format:check")
    const lint = run(project, "run", "lint")
    const check = run(project, "run", "check")

    expectSuccess(install)
    expectSuccess(format)
    expectSuccess(lint)
    expectSuccess(check)
    assert.equal(readFileSync(join(project, "bun.lock"), "utf8"), lockBefore)
  } finally {
    rmSync(project, { recursive: true, force: true })
  }
})

// BUN-02: check は書き込まず、format だけが整形する。
test("未整形コードは検査と集約 script が失敗し整形後に成功する", () => {
  const project = createProject()
  try {
    expectSuccess(run(project, "install", "--frozen-lockfile", "--ignore-scripts"))
    const source = "export const answer={value:42};\n"
    writeFileSync(join(project, "index.ts"), source)

    const formatCheck = run(project, "run", "format:check")
    const check = run(project, "run", "check")

    expectFailure(formatCheck)
    expectFailure(check)
    assert.equal(readFileSync(join(project, "index.ts"), "utf8"), source)
    expectSuccess(run(project, "run", "format"))
    expectSuccess(run(project, "run", "check"))
    assert.equal(
      readFileSync(join(project, "index.ts"), "utf8"),
      "export const answer = { value: 42 }\n",
    )
  } finally {
    rmSync(project, { recursive: true, force: true })
  }
})

// BUN-03: 整形できるコードでも lint 違反は失敗する。
test("lint 違反は lint と集約 script が失敗し修正後に成功する", () => {
  const project = createProject()
  try {
    expectSuccess(run(project, "install", "--frozen-lockfile", "--ignore-scripts"))
    writeFileSync(join(project, "index.ts"), "export const pattern = /[]/\n")

    const lint = run(project, "run", "lint")
    const check = run(project, "run", "check")

    expectFailure(lint)
    assert.match(lint.stdout + lint.stderr, /no-empty-character-class/)
    expectFailure(check)
    writeFileSync(join(project, "index.ts"), "export const pattern = /[a-z]/\n")
    expectSuccess(run(project, "run", "check"))
  } finally {
    rmSync(project, { recursive: true, force: true })
  }
})

test("依存の版と lockfile が一致しなければ frozen install が失敗する", () => {
  const project = createProject()
  try {
    const packagePath = join(project, "package.json")
    const manifest = JSON.parse(readFileSync(packagePath, "utf8"))
    manifest.devDependencies.oxlint = "1.91.0"
    writeFileSync(packagePath, JSON.stringify(manifest, null, 2))
    const lockBefore = readFileSync(join(project, "bun.lock"), "utf8")

    const install = run(project, "install", "--frozen-lockfile", "--ignore-scripts")

    expectFailure(install)
    assert.match(install.stdout + install.stderr, /lockfile/i)
    assert.equal(readFileSync(join(project, "bun.lock"), "utf8"), lockBefore)
  } finally {
    rmSync(project, { recursive: true, force: true })
  }
})

function createProject() {
  const project = mkdtempSync(join(tmpdir(), "bun-tooling-test-"))
  for (const name of ["package.json", "bunfig.toml", "bun.lock", ".gitignore"]) {
    copyFileSync(new URL(name, sample), join(project, name))
  }
  mkdirSync(join(project, ".github", "workflows"), { recursive: true })
  copyFileSync(
    new URL("bun-tooling.yml", sample),
    join(project, ".github", "workflows", "bun-tooling.yml"),
  )
  const version = run(project, "--version")
  expectSuccess(version)
  const manifest = JSON.parse(readFileSync(join(project, "package.json"), "utf8"))
  assert.equal(`bun@${version.stdout.trim()}`, manifest.packageManager)
  return project
}

function run(project, ...args) {
  const result = spawnSync("bun", args, { cwd: project, encoding: "utf8", timeout: 120_000 })
  assert.ifError(result.error)
  assert.equal(result.signal, null)
  return result
}

function expectSuccess(result) {
  assert.equal(result.status, 0, result.stdout + result.stderr)
}

function expectFailure(result) {
  assert.notEqual(result.status, 0, result.stdout + result.stderr)
}
