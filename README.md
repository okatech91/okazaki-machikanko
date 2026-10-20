# 岡崎まち感光
2026年11月25〜26日、ひらの夫妻のための旅のWebマガジン。

## 起動
ビルド不要の静的アプリ。`python -m http.server 8080 --directory dist` でローカル確認し http://localhost:8080 を開く。file://では共有・Service Workerに制限がある。

## 構成
- dist/index.html, styles.css: 雑誌とレスポンシブ紙面
- dist/data.js: 人物・施設・初期旅程・調整項目・出典URL
- dist/core.js: 検証、共有形式、時間重複検知
- dist/app.js: 画面・編集・保存・印刷
- dist/brandbook.html: デザイン仕様
- dist/sw.js: 同一オリジンの基本画面のオフラインキャッシュ

## 使い方
旅程の主催者モードで予定を編集。保存先は端末内。共有ボタンは変更を含むURLを作る。受信した旅程の取り込みは明示的に実行する。準備画面でJSONの保存と読み込み、印刷。共有URLに秘密情報を入れない。予約代行、自動送信、共同編集サーバーはない。

## 公開手順
任意のHTTPS静的ホスティングへdist内をルートとして配置。index.htmlがトップページ。Service Workerの更新時はsw.jsのCACHE文字列を変更する。
Sitesは.openai/hosting.jsonの既存project_idを維持し、専用ソース同期ヘルパーでコミット・push・tar生成後にそのcommit/archiveを保存して公開する。認証トークンは保存しない。現在の公開先はオーナー限定の確認用。夫妻に送る前にSitesの共有設定で対象者へのアクセスを設定する。

## 素材
Noto Sans JP / DotGothic16 はSIL OFL。dist/assetsに原文同梱。風景写真は外部配信のCC0素材（Evelyn-rose / Wikimedia Commons）で本文・奥付に原典を記載。人物5名・施設7件の転載写真は未収録（許諾未確認）、公式写真掲載元へリンク。写真の外部配信はオフライン非対応。

## 確定情報と残課題
osotoは坂田さん訪問了承済み。脈は飯田圭さん担当・訪問了承済み。サウナは男性参加。時刻・車・宿・飲食予約は未確定。中川さんの正式な招待相手、寺門コーヒーの支店は要確認。案内情報は2026-10-19調査。Safari実機検証は未実施。
