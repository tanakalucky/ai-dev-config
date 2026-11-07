# Claude Code / Codex 共通設定

アプリのリポジトリへコピーして、規約・認識合わせ・Issue の開発進行・FSD・独立3観点レビュー・Cloudflare運用を共有する。
共通本文は`AGENTS.md`と`.ai-config/`、ツール別の入口は`.agents/skills/`と`.claude/skills/`に置く。
生成処理や外部の設定リポジトリへの参照は不要。

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

Dots が選択・起動・追跡・停止後の再開を担当し、[共通手順](.ai-config/workflows/development-orchestrator.md)が1つの Issue の調査・本人確認・実装委譲・PR・独立レビュー・最終 SHA の品質確認を進める。新機能/仕様変更はシナリオへの本人の明確な承認後に実装する。既存のコピー方式とレビュー入口を使い、外部実行や merge の権限は各タスクで確認する。

[週次課題発見](.ai-config/workflows/weekly-discovery.md)はバグ/リファクタの独立2系統と独立5人中3賛成の採用、[振返りと改善](.ai-config/workflows/development-improvement.md)は資料別分析・改善投票・before/after の効果確認を扱う。外部実行の接続・既存日次の更新・安全な停止は[導入テンプレート](.ai-config/templates/development-loop-integration.md)を参照する。外部スケジュールや自動投稿・merge/deployは別途許可された導入時に扱う。

標準テストはコピー後の入口・リンク・安全境界・状態遷移の記述を静的に確認する。実行補助は合成データで証拠の整合性を確認する。いずれも実モデルの動作検証とは別であり、委譲や外部 CI/E2E の成功を保証しない。リポジトリの CI はこの標準テストだけを実行し、アプリへコピーする5つの配布物には含めない。

## 初期設定

- FSD: 「この画面をFSDで追加して」「既存アプリへの配置案を示して」のように依頼する。[共通ルール](.ai-config/rules/fsd.md)と[導入手順](.ai-config/workflows/fsd.md)を使い、ソースルート・エイリアス・共有パッケージ・ルーターとの対応は各アプリに記録する。必要なレイヤーだけを使い、一括移行・設定生成・依存チェックCIの追加は行わない。
- Cloudflare: 対象account/Worker、Secrets名と登録先、最小権限、previewと本番の資源を確認する。アプリ構成と公式CLIに合う方式を選び、既存Worker配下のWorker Previewから異なる方式へ変える場合は利用者に確認する。設定・Actions・処理・E2Eは各アプリに置く。
- レビュー: Codexのモデル・推論量はユーザー指定、未指定ならセッション設定を継承する。[Codexの実行条件](.agents/review-runtime.md)と[Claudeの入口](.claude/skills/ai-dev-config-review/SKILL.md)に従う。運用指示や編集ツールの制限は、完全な書込拒否を保証しない。
- 承認: ユーザー領域へのインストールや既存のsandbox・認証・承認設定の変更は自動で行わない。実デプロイ・削除・credential登録・PRコメント投稿は各タスクの承認範囲で行う。

設定を調整するときは共通本文を`.ai-config/`、ツール固有の呼出・モデル設定を各入口で変更する。
入口の仕様は[Codex skills](https://developers.openai.com/codex/build-skills)と[Claude skills](https://code.claude.com/docs/en/skills)を参照。
