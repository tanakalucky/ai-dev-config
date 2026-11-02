# Claude Code / Codex 共通設定

アプリのリポジトリへコピーして使う設定一式。生成処理や外部の設定リポジトリへの参照は不要。
共通の指示は`AGENTS.md`、規約・認識合わせ・レビュー・デプロイ手順は`.ai-config/`で一元管理する。

```text
AGENTS.md                      共通の作業指示
CLAUDE.md -> AGENTS.md          相対symlink
.ai-config/
  rules/coding.md              コーディング規約
  rules/documentation.md       READMEの記載方針
  rules/cloudflare-deploy.md   Cloudflareの運用ルール
  workflows/cloudflare-deploy.md  アプリへの導入・変更手順
  workflows/clarify.md         認識合わせ
  review/
    policy.md                 制約・重大度・完了条件・出力形式
    rounds.md                 レビューと修正の上限・収束判定
    workflow.md               base確定・収集・3観点・統合
    reviewer.md               観点担当の共通手順
    correctness.md            正確性/安全性
    tests.md                  テスト
    design.md                 設計/可読性
.agents/
  review-runtime.md           Codex固有のモデル・権限・委譲条件
  skills/config-*/SKILL.md     Codexの薄い入口6本
.claude/skills/*/SKILL.md       Claude Codeの薄い入口6本
```

## アプリへの配置

`AGENTS.md`、`CLAUDE.md`、`.ai-config/`、`.agents/`、`.claude/`をセットでコピーする。
`.git/`やこのREADMEは配布に不要。隠しディレクトリとsymlinkを保持できる方法を使う。
既存の同名ファイル・ディレクトリがある場合は、上書きせず差分を確認して統合する。
空の配置先なら、たとえば`cp -R`で上記5つをコピーできる(macOS/Linux)。
`CLAUDE.md`のリンク先は常に同じルートの`AGENTS.md`。
Windows等でsymlinkが通常ファイルになってしまう環境は、そのまま使えるとはみなさずリンクを確認する。

```sh
# コピー後のルートで確認
readlink CLAUDE.md
python3 -m unittest discover -s .ai-config/tests -v
```

`readlink`の期待値は`AGENTS.md`。テストはPython 3.9以上の標準ライブラリのみを使い、
リンクと全Markdown参照が配置先の内部で解決することを確認する。
ユーザー領域へのインストール、既存設定の切替、権限変更は自動で行わない。
前の`commands/`・`skills/`・`rules/`配置から採用する場合は、アプリ側の既存入口との重複を確認する。
Claudeの`/clarify`・`/review`・3観点のskill名は維持し、配置は`.claude/skills/`へ統一した。

## 利用方法とツール固有部分

配置後に新しいセッションを開始し、規約と入口を認識していることを確認する。
Markdownリンクは自動includeとして扱わず、入口に明示的な読取指示を記載している。
各リンクはそのMarkdown自身の場所を基準に解決する。

| 用途 | Claude Code | Codex |
| --- | --- | --- |
| 認識合わせ | `/clarify 依頼内容` | `$config-clarify 依頼内容` |
| レビュー | `/review <比較元またはcommit> <要件>` | `$config-review <比較元またはcommit> <要件>` |
| Cloudflare導入・変更 | `/cloudflare-deploy 依頼内容` | `$config-cloudflare-deploy 依頼内容` |
| 3観点 | Skill呼出で`review-correctness`・`review-tests`・`review-design` | 独立した子agentが`config-review-correctness`・`config-review-tests`・`config-review-design`を読む |

Cloudflareの入口はアプリ構成を調べ、PRごとの`pr-番号`の作成・更新・close/merge後のcleanup、
mainの成功CIからの本番反映を組み立てる。例: 「このアプリにCloudflareのPRプレビュー運用を導入して」。
設定・Actions・処理・E2Eは各アプリに作成する。既存Worker配下のWorker Previewを優先し、
異なる方式へ変更する場合は利用者に確認する。
初期設定では対象account/Worker、必要なSecrets名と登録先、最小権限、previewと本番の資源を示す。
実デプロイ・削除・credential登録は各タスクの承認範囲で行う。

Claudeのレビュー担当は既存の`model: sonnet`・`context: fork`・`background: false`と
`disallowed-tools: Write, Edit`を維持する。これは完全な書込拒否を保証するsandboxではない。
Codexのモデル・推論量はユーザー指定、未指定ならセッションの設定を継承する。
[Codexの実行条件](.agents/review-runtime.md)に従い、既存のsandbox・認証・承認設定は変更しない。
独立した子agentでレビューし、ネストしたCLI起動やOSによる書込拒否の実測は必須にしない。
実効条件の未確認だけを理由に開始を中止せず、確認できない値や委譲できない観点は区別して報告する。

## 共通方針の編集

共通本文は`.ai-config/`だけを編集する。ツール固有の呼出やモデル設定は各ツールの入口で変更する。
テストはAAA(Arrange・Act・Assert)で準備・実行・検証を分け、形式だけの複雑化は避ける。
レビューと修正の回数・停止条件は[ラウンドの共通定義](.ai-config/review/rounds.md)を参照する。
初回を含め最大3ラウンド。各ラウンドで独立3観点を各1回行い、P0/P1が0件なら早期終了する。
残れば実装担当が修正して次へ進み、3回目でも残れば未解決点を報告して停止する。
レビュー担当は報告のみ。修正後の最新状態を再レビューしていなければ収束とは扱わない。
固定baseからの全差分、機密除外、行番号・根拠・最小修正案、実行と読取の区別、
未完了の明記、失敗した観点の自動再試行禁止は共通方針に定義している。
生成スクリプトや生成物の再生成は不要。

## 対応するツール

入口の仕様は[Codex skills](https://developers.openai.com/codex/build-skills)、
[Claude skills](https://code.claude.com/docs/en/skills)を参照。
静的な参照・配置テストと、各CLIや実環境での動作検証は区別する。
