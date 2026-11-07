# Claude Code / Codex 共通設定

アプリのリポジトリへコピーして、規約・認識合わせ・Issue の開発進行・FSD・独立3観点レビュー・Cloudflare運用を共有する。
共通本文は`AGENTS.md`と`.ai-config/`、薄い入口は`.agents/skills/`と`.claude/skills/`。
生成処理や外部設定repoへの参照は不要。

## アプリへの配置

`AGENTS.md`、`CLAUDE.md`、`.ai-config/`、`.agents/`、`.claude/`の5つをコピーする。
既存の同名設定や旧配置の入口があれば、上書きせず差分と重複を確認して統合する。
`.git/`、このREADME、[過去の検証記録](docs/validation/README.md)は配布に不要。

空の配置先には`cp -R`など、隠しディレクトリとsymlinkを保持できる方法を使う。
`CLAUDE.md`は同じルートの`AGENTS.md`への相対symlink。Windows等でも通常ファイルになっていないか確認する。

```sh
# コピー後のルートで確認
readlink CLAUDE.md
python3 -m unittest discover -s .ai-config/tests -v
```

`readlink`の期待値は`AGENTS.md`。テストはPython 3.9以上の標準ライブラリで、
配布物のリンクとMarkdown参照を確認する。CLIや実環境の動作検証とは区別する。
配置後は新しいセッションで規約と入口の認識を確認する。

## 呼び出し方

| 用途 | Claude Code | Codex |
| --- | --- | --- |
| Issue ごとの開発進行 | `/development-orchestrator <repository/Issue> <再開情報>` | `$development-orchestrator <repository/Issue> <再開情報>` |
| 週次の候補発見・採用 | `/weekly-discovery <repository/週範囲>` | `$weekly-discovery <repository/週範囲>` |
| 開発ループの振返り・改善 | `/development-improvement <repository/分析期間>` | `$development-improvement <repository/分析期間>` |
| 認識合わせ | `/clarify 依頼内容` | `$config-clarify 依頼内容` |
| FSD導入・変更・配置案 | `/fsd 依頼内容` | `$config-fsd 依頼内容` |
| レビュー | `/ai-dev-config-review <比較元またはcommit> <要件>` | `$config-review <比較元またはcommit> <要件>` |
| Cloudflare導入・変更 | `/cloudflare-deploy 依頼内容` | `$config-cloudflare-deploy 依頼内容` |

既存アプリの更新では、この設定由来と確認した旧`.claude/skills/review/`を新しい入口へ置き換える。他のレビュー設定は変更しない。

例: 「このアプリにCloudflareのPRプレビュー運用を導入して」。PRごとの作成・更新・URLコメント・cleanupと、mainの成功CIからの本番反映を組み立てる。
詳細は[Cloudflare運用](.ai-config/rules/cloudflare-deploy.md)、[レビュー方針](.ai-config/review/policy.md)、[ラウンドと停止条件](.ai-config/review/rounds.md)を参照。
各入口に参照先の全文読取を指示しており、Markdownリンクの自動展開は前提にしない。

## Issue ごとの開発進行

[Issue ごとの共通手順](.ai-config/workflows/development-orchestrator.md)を正本とする。Coordinator（AIまたは人間）が選択・起動・追跡・再開を担当し、オーケストレーターが調査・本人確認・実装委譲・PR・品質確認を進める。新機能/仕様変更は本人のシナリオ承認後に実装する。外部操作の許可はタスクごとに確認する。

[週次課題発見](.ai-config/workflows/weekly-discovery.md)は独立2系統の調査と候補採用、[振返りと改善](.ai-config/workflows/development-improvement.md)は資料別分析・改善投票・効果確認を扱う。採用は独立5人中3賛成。外部スケジュール・自動投稿・merge/deployは別途許可が必要。

標準テストはコピー先の入口・リンク・安全境界・状態遷移を静的に確認し、[実行補助](.ai-config/helpers/orchestrator_dry_run.py)は合成証拠の整合性を確認する。実モデルや外部CI/E2Eの成功を保証しない。このrepoのCIは標準テストのみで、5つの配布物には含めない。

## 初期設定

- FSD: 「この画面をFSDで追加して」「既存アプリへの配置案を示して」のように依頼する。[共通ルール](.ai-config/rules/fsd.md)と[導入手順](.ai-config/workflows/fsd.md)を使い、ソースルート・エイリアス・共有パッケージ・ルーターとの対応は各アプリに記録する。必要なレイヤーだけを使い、一括移行・設定生成・依存チェックCIの追加は行わない。
- Cloudflare: 対象account/Worker、Secrets名と登録先、最小権限、previewと本番の資源を確認する。アプリ構成と公式CLIに合う方式を選び、既存Worker配下のWorker Previewから異なる方式へ変える場合は利用者に確認する。設定・Actions・処理・E2Eは各アプリに置く。
- レビュー: Codexのモデル・推論量はユーザー指定、未指定ならセッション設定を継承する。[Codexの実行条件](.agents/review-runtime.md)と[Claudeの入口](.claude/skills/ai-dev-config-review/SKILL.md)に従う。運用指示や編集ツールの制限は、完全な書込拒否を保証しない。
- 承認: ユーザー領域へのインストールや既存のsandbox・認証・承認設定の変更は自動で行わない。実デプロイ・削除・credential登録・PRコメント投稿は各タスクの承認範囲で行う。

設定を調整するときは共通本文を`.ai-config/`、ツール固有の呼出・モデル設定を各入口で変更する。
入口の仕様は[Codex skills](https://developers.openai.com/codex/build-skills)と[Claude skills](https://code.claude.com/docs/en/skills)を参照。
