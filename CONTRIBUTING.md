# 開発者向けガイド

## セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/share-quest/share-quest-mvp
cd share-quest-mvp
```

### 2. 環境変数の設定

`apps/website/.env` を作成（値はSupabaseダッシュボードから取得）：

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 3. 開発サーバー起動

```bash
pnpm install
pnpm run dev
```

## デプロイ

mainブランチへのpushでVercelに自動デプロイされます。

pushする前に必ずpullしてください。競合を避けるため `--rebase` を使います：

```bash
cd apps/website && pnpm build && cd ../.. && git add -A && git commit -m "メッセージ" && git pull --rebase && git push
```

## URL設計

| URL                  | 画面                     |
| -------------------- | ------------------------ |
| `/`                  | ホーム                   |
| `/search`            | 検索                     |
| `/writers`           | ライター一覧             |
| `/writers/:username` | ライタープロフィール     |
| `/articles/:id`      | 記事詳細                 |
| `/favorites`         | お気に入り               |
| `/settings`          | 設定                     |
| `/about`             | SHARE Questとは          |
| `/writer-dash`       | ライター用ダッシュボード |
| `/writer-dash/new`   | 新規記事作成             |
| `/writer-series`     | 連載管理                 |
| `/editor-dash`       | 編集長用ダッシュボード   |
| `/editor-articles`   | 全記事の編集・削除       |
| `/editor-recommend`  | おすすめ・人気設定       |
| `/editor-writers`    | ライター管理             |
| `/login`             | ログイン                 |
| `/register`          | ライター登録             |
| `/privacy`           | プライバシーポリシー     |
| `/terms`             | 利用規約                 |
| `/contact`           | お問い合わせ             |

## ユーザーロール

| ロール   | 権限                                         |
| -------- | -------------------------------------------- |
| `guest`  | 未ログイン・記事閲覧のみ                     |
| `viewer` | ログイン済み・お気に入り使用可               |
| `writer` | 記事作成・編集・投稿申請・削除               |
| `editor` | 全記事管理・ライター管理・承認権限・記事作成 |

ロール変更はSupabase SQL Editorで：

```sql
update public.profiles set role = 'editor' where email = '対象メールアドレス';
```

## 注意事項

- `App.tsx` は全コンポーネントが1ファイルに集約。別ファイル分離は非推奨。
- pre-commitフックは `vite-plus` で管理（huskyではない）。
- **pre-commitフックはビルドエラー時にgitの変更を自動で差し戻す。ただしディスク上のファイルは戻らない場合があるため、エラー後は `git checkout apps/website/src/App.tsx` で状態を確認すること。**
- pushが弾かれた場合は `git pull --rebase && git push` で解決する。
- `vercel.json` は `apps/website/public/` に置く（リポジトリルートではない）。
- Vercel環境変数は Vercel ダッシュボードで手動設定が必要。
