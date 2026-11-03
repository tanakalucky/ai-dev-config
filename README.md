# Claude Code / Codex 共通設定

アプリのリポジトリへコピーして、規約・認識合わせ・独立3観点レビュー・Cloudflare運用を共有する。
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
| 認識合わせ | `/clarify 依頼内容` | `$config-clarify 依頼内容` |
| レビュー | `/ai-dev-config-review <比較元またはcommit> <要件>` | `$config-review <比較元またはcommit> <要件>` |
| Cloudflare導入・変更 | `/cloudflare-deploy 依頼内容` | `$config-cloudflare-deploy 依頼内容` |

既存アプリの更新では、この設定由来と確認した旧`.claude/skills/review/`を新しい入口へ置き換える。他のレビュー設定は変更しない。

例: 「このアプリにCloudflareのPRプレビュー運用を導入して」。PRごとの作成・更新・URLコメント・cleanupと、mainの成功CIからの本番反映を組み立てる。
詳細は[Cloudflare運用](.ai-config/rules/cloudflare-deploy.md)、[レビュー方針](.ai-config/review/policy.md)、[ラウンドと停止条件](.ai-config/review/rounds.md)を参照。
各入口に参照先の全文読取を指示しており、Markdownリンクの自動展開は前提にしない。

## 初期設定

- Cloudflare: 対象account/Worker、Secrets名と登録先、最小権限、previewと本番の資源を確認する。アプリ構成と公式CLIに合う方式を選び、既存Worker配下のWorker Previewから異なる方式へ変える場合は利用者に確認する。設定・Actions・処理・E2Eは各アプリに置く。
- レビュー: Codexのモデル・推論量はユーザー指定、未指定ならセッション設定を継承する。[Codexの実行条件](.agents/review-runtime.md)と[Claudeの入口](.claude/skills/ai-dev-config-review/SKILL.md)に従う。運用指示や編集ツールの制限は、完全な書込拒否を保証しない。
- 承認: ユーザー領域へのインストールや既存のsandbox・認証・承認設定の変更は自動で行わない。実デプロイ・削除・credential登録・PRコメント投稿は各タスクの承認範囲で行う。

設定を調整するときは共通本文を`.ai-config/`、ツール固有の呼出・モデル設定を各入口で変更する。
入口の仕様は[Codex skills](https://developers.openai.com/codex/build-skills)と[Claude skills](https://code.claude.com/docs/en/skills)を参照。
