# tern-def-webextensions
 * tern 用の WebExtensions 定義ファイルです。
   * オートコンプリートとドキュメント(MDN)表示が目的です。
   * tern に何をしてやればうまくいくのかが明確でなく、ソースのスキーマファイルの意味も把握していないので「まあまあ動作する」程度の出来です。
   * 定義ファイルも作成用スクリプトもすべて完成度を高めず「ないよりとても良い」くらいでやっています。
 * github には定義ファイルを置かない予定です。作成用スクリプトだけです。
 * npm に定義ファイルだけパッケージにして置けばいいかと思っていますが、まだそこまでできていません。
 * mozilla-betaでやる予定です。nightlyではないです。
 * Language Server の存在は知っていますし良いと思いますが、それにブラウザのソースを読ませるのを各自でやるのは採用できないので違う方法を採っています。

## 定義ファイルの使い方
※まだ定義ファイルは公開されていません。

Vim なら tern-for-vim をインストールして(nodejs と python スクリプトが動くので、Vim プラグインフォルダを統合しない方がいいかもしれません)、
プロジェクトの `.tern-project` に追記すればいいです。

```.tern-project
{
  "libs": [
    "browser",
    "path/to/webextensions-general-beta",
    "path/to/webextensions-firefox-desktop-beta"
    // or "path/to/webextensions-firefox-android-beta"
  ]
}
```

## 定義ファイルの作り方

`npm run build -- --repository /path/to/local/repository`

定義ファイルは 3 つあります。下記のグループに対応したものです。

 * genaral API
 * browser UI API
 * android UI API

<!-- vim:expandtab ff=unix fenc=utf-8 sw=2 -->
