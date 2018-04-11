# tern-def-webextensions
![Screenshot](images/2018-04-12_readme-img_01.jpg)

 * [tern](http://ternjs.net/) 用の WebExtensions 定義ファイルです。
   * エディタ上の補完とドキュメント([MDN](https://developer.mozilla.org/en-US/Add-ons/WebExtensions))表示が目的です。
   * tern に何をしてやればうまくいくのかが明確でなく、ソースのスキーマファイルの意味も把握していないので「まあまあ動作する」程度の出来です。
   * 定義ファイルも作成用スクリプトもすべて完成度を高めず「ないよりとても良い」くらいでやっています。
 * [github](https://github.com/PrsPrsBK/tern-def-webextensions) には定義ファイルを置かない予定です。作成用スクリプトだけです。
 * [npm package](https://www.npmjs.com/package/tern-def-webextensions) に定義ファイルがあります。
 * mozilla-betaでやっています。nightly ではないです。
 * MDN の URL は [mdn-browser-compat-data](https://www.npmjs.com/package/mdn-browser-compat-data) のものです。
 * Language Server の存在は知っていますし良いと思いますが、それにブラウザのソースを読ませるのを各自でやるのは採用できないので違う方法を採っています。

## 定義ファイルの使い方

Vim なら [tern-for-vim](https://github.com/ternjs/tern_for_vim) をインストールして 
(nodejs と python スクリプトが動くので、Vim プラグインフォルダを統合しない方がいいかもしれません)、
プロジェクトの `.tern-project` に追記すればいいです。

```.tern-project
{
  "libs": [
    "browser",
    "path/to/webextensions-desktop-beta"
  ]
}
```

## 定義ファイルの作り方

`npm run build -- --repository /path/to/local/repository`

定義ファイルは 1 つです。下記のグループ別にしたかったのですが、定義ファイルの間で参照させる方法が
分からなかったので一つにしました。android UI は省略されましたが、多分 browser UI (デスクトップ) に
含まれているだろうからいいかな、ということです。

 * genaral API
 * browser UI API
 * android UI API

[//]: # (vim:expandtab ff=unix fenc=utf-8 sw=2)

