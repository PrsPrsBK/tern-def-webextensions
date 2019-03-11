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

Mozilla の IRC で宣伝したところコミュニティ製ツールを紹介したいねということになり、
ツールの 1 つとしてシェアされました。ありがとうございます。
[2018-04-12 Extension development tools - Add-ons / Development - Mozilla Discourse](https://discourse.mozilla.org/t/extension-development-tools/27608)


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

### mozilla-beta 以外のリポジトリを使いたい

nightly の場合です。

`npm run build -- --mozilla-repo /path/to/local/nightly/repository --channel nightly`

`webextensions-desktop-nightly.json` が作成されます。
`--channel` オプションはファイル名にのみ影響します。
`.tern-project` で指定すれば、使うファイルを切り替えられるというわけです。
切り替える必要がなければ、別に使わなくてもいいオプションです。


# ライセンス
MPL-2.0 です。

npm パッケージは json ファイルを含んでいます. そしてそのファイルの内容は、mozilla-beta リポジトリの json スキーマファイルに由来しています。
jsonスキーマファイルのいくつかは 3-Clause BSD ライセンスで、他のものは MPL-2.0 ライセンスです。
両方のライセンス条項が `LICENSE` ディレクトリにあります。

[//]: # (vim:expandtab ff=unix fenc=utf-8 sw=2)

