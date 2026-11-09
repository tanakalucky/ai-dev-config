# Claude Code / Codex 共通設定

アプリのリポジトリへコピーして、規約・認識合わせ・Issue の開発進行・FSD・独立3観点レビュー・Cloudflare運用を共有する。
共通本文は`AGENTS.md`と`.ai-config/`、薄い入口は`.agents/skills/`と`.claude/skills/`。
生成処理や外部設定repoへの参照は不要。

## アプリへの配置

`AGENTS.md`、`CLAUDE.md`、`.ai-config/`、`.agents/`、`.claude/`、`.codex/agents/`をコピーする。
従来の5配布物にproject-scoped Codex agent定義だけを加える。`.codex/`全体や個人のconfigはコピーしない。
既存の同名設定や旧配置の入口があれば、上書きせず差分と重複を確認して統合する。
`.git/`、このREADME、[過去の検証記録](docs/validation/README.md)は配布に不要。

空の配置先には`cp -R`など、隠しディレクトリとsymlinkを保持できる方法を使う。
`CLAUDE.md`は同じルートの`AGENTS.md`への相対symlink。Windows等でも通常ファイルになっていないか確認する。

```sh
# コピー後のルートで確認
readlink CLAUDE.md
```

`readlink`の期待値は`AGENTS.md`。
配置後は新しいセッションで規約と入口の認識を確認する。

## 日本語とコミットの既定

説明・回答・ドキュメント・コミットメッセージの説明文は日本語を既定とする。ユーザーが別の言語を明示した場合はその指定に従い、技術識別子・コマンド・設定キー・原文引用は保つ。

- Claude Code: 配布する`.claude/settings.json`の`"language": "japanese"`で応答言語を指定する。共通指示は既存の`CLAUDE.md` symlinkから読む。この設定は音声入力の認識言語とセッション名にも影響する。
- Codex: `AGENTS.md`の指示で指定する。Codexの設定ファイルへ独自の`language`キーは追加しない。
- コミット: 両ツールで[コミット規約](.ai-config/rules/commits.md)を使う。Conventional Commits形式で、typeや`BREAKING CHANGE`は英語、説明文は日本語を既定とする。

既存の`.claude/settings.json`へ導入する場合もファイル全体を置換せず、既存キーを保って`language`を手動で統合する。
異なる言語指定があれば、上位の指示、個人・管理設定、作業ディレクトリに応じて読み込まれる指示や設定を確認する。個人設定をこの配布物で変更しない。
配置先の新しいセッションで読み込みと応答言語を確認する。指示による運用であり、すべての出力の強制やcommit時の自動検査は行わない。

Claude Codeのcloudでrepo設定が使われる範囲はセッション形態に依存する。単一repoのセッションと、multi-repo/project cloudのセッションを同一視しない。
一般のClaudeチャットや設定ファイルを読み込まない実行環境への適用は保証しない。Codexでも`AGENTS.md`を読み込む対応環境と対象ディレクトリを確認する。
仕様は[Claudeのlanguage設定](https://code.claude.com/docs/en/settings-reference#language)、[cloudでの設定範囲](https://code.claude.com/docs/en/settings#settings-in-cloud-sessions)、[CodexのAGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md)を参照。

## 呼び出し方

| 用途 | Claude Code | Codex |
| --- | --- | --- |
| Issue ごとの開発進行 | `/development-orchestrator <repository/Issue> <再開情報>` | `$development-orchestrator <repository/Issue> <再開情報>` |
| 週次の候補発見・採用 | `/weekly-discovery <repository/週範囲>` | `$weekly-discovery <repository/週範囲>` |
| 開発ループの振返り・改善 | `/development-improvement <repository/分析期間>` | `$development-improvement <repository/分析期間>` |
| 認識合わせ | `/clarify 依頼内容` | `$clarify 依頼内容` |
| FSD導入・変更・配置案 | `/fsd 依頼内容` | `$fsd 依頼内容` |
| レビュー | `/ai-dev-config-review <比較元またはcommit> <要件>` | `$ai-dev-config-review <比較元またはcommit> <要件>` |
| Cloudflare導入・変更 | `/cloudflare-deploy 依頼内容` | `$cloudflare-deploy 依頼内容` |

既存アプリの更新では、この設定由来と確認した旧`.claude/skills/review/`を新しい入口へ置き換える。他のレビュー設定は変更しない。
Codexの旧`.agents/skills/config-*`も、この設定由来と確認した入口を置き換える。
`config-review`は`ai-dev-config-review`、その他は`config-`を外した名前にし、旧入口を残さない。
同名の別スキルがある場合は、上書きせず差分を確認して統合する。

例: 「このアプリにCloudflareのPRプレビュー運用を導入して」。PRごとの作成・更新・URLコメント・cleanupと、mainの成功CIからの本番反映を組み立てる。
詳細は[Cloudflare運用](.ai-config/rules/cloudflare-deploy.md)、[レビュー方針](.ai-config/review/policy.md)、[ラウンドと停止条件](.ai-config/review/rounds.md)を参照。
各入口に参照先の全文読取を指示しており、Markdownリンクの自動展開は前提にしない。

## Issue ごとの開発進行

[Issue ごとの共通手順](.ai-config/workflows/development-orchestrator.md)を正本とする。Coordinator（AIまたは人間）は日次のIssue確認・整理、Issue担当と週次担当への依頼、本人への質問・結果の受け渡しを行う。依頼後はrepo最上位の指揮者が進行・品質・停止再開を管理し、現在有効な対象限定許可と品質・安全・権限条件がすべて成立した場合だけmergeを判断・実行する。新機能/仕様変更は本人のシナリオ承認後に実装する。文書自体は外部操作を許可しない。

[週次課題発見](.ai-config/workflows/weekly-discovery.md)は独立2系統の調査と候補採用、[振返りと改善](.ai-config/workflows/development-improvement.md)は資料別分析・改善投票・効果確認を扱う。採用は独立5人中3賛成。外部スケジュール・自動投稿・merge/deployは別途許可が必要。

## Preview E2E の実行例

[Preview E2E Actions サンプル](.ai-config/examples/preview-e2e/README.md)に、Preview 完了後の GitHub API 起動と実行workflowを置く。
アプリ固有の検証adapter・E2Eコマンド・必要な許可を揃えて導入する。配布コピーだけでは有効にならない。

## 新規 JS / TS のツール構成例

新規 JavaScript / TypeScript プロジェクトでは Bun（パッケージ管理）・`bun fmt`（整形）・Oxlint（lint）を使う。
[共通ルール](.ai-config/rules/bun-tooling.md)と[設定・CI サンプル](.ai-config/examples/bun-tooling/README.md)を参照。
配布コピーだけでは有効にならず、既存プロジェクトの移行やこの config repo の CI 追加は行わない。

## 初期設定

- FSD: 「この画面をFSDで追加して」「既存アプリへの配置案を示して」のように依頼する。[共通ルール](.ai-config/rules/fsd.md)と[導入手順](.ai-config/workflows/fsd.md)を使い、ソースルート・エイリアス・共有パッケージ・ルーターとの対応は各アプリに記録する。必要なレイヤーだけを使い、一括移行・設定生成・依存チェックCIの追加は行わない。
- Cloudflare: 対象account/Worker、Secrets名と登録先、最小権限、previewと本番の資源を確認する。アプリ構成と公式CLIに合う方式を選び、既存Worker配下のWorker Previewから異なる方式へ変える場合は利用者に確認する。設定・Actions・処理・E2Eは各アプリに置く。
- レビュー: Codexのモデル・推論量はユーザー指定、未指定ならセッション設定を継承する。[Codexの実行条件](.agents/review-runtime.md)と[Claudeの入口](.claude/skills/ai-dev-config-review/SKILL.md)に従う。運用指示や編集ツールの制限は、完全な書込拒否を保証しない。
- 承認: ユーザー領域へのインストールや既存のsandbox・認証・承認設定の変更は自動で行わない。実デプロイ・削除・credential登録・PRコメント投稿は各タスクの承認範囲で行う。

.codex/agents/のTOMLと.claude/agents/のMarkdownは専門役の定義。最上位セッションで既存skillを実行し、専門役を直接呼ぶ。
[役割・受け渡し・起動方法](.ai-config/workflows/agent-handoff.md)を全文読む。週次採用候補はIssueへ保存し、Coordinatorが日次で依頼する。
ローカル定義の配布はブラウザ/cloudでの自動検出や実効権限の保証ではない。

設定を調整するときは共通本文を`.ai-config/`、ツール固有の呼出・モデル設定を各入口で変更する。
入口の仕様は[Codex skills](https://developers.openai.com/codex/build-skills)と[Claude skills](https://code.claude.com/docs/en/skills)を参照。
