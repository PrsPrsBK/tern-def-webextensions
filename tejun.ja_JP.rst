========================================
運用とその手順
========================================

この文書は何？
------------------

PowerShell スクリプトを使って更新作業と更新チェック作業をある程度楽にしています。
時間の経過とともに、tern定義ファイルに更新が必要かもしれない状況、
更新時の作業、更新が必要なかった時の対処、といったことを思い出しにくくなりました。
そのためメモを書きました。


更新するタイミング
--------------------

tern定義ファイルの内容は、 ``mozilla-beta`` リポジトリと MDN の ``browser-compat-data`` から
生成されています。
これらのうち、 ``mozilla-beta`` から生成される部分に変更がある場合のみ、パッケージの更新を行います。
``browser-compat-data`` のみに変更がある場合は更新しないし、そもそも更新チェックしません。
パッケージ更新の際、 ``browser-compat-data`` をその時点の最新版に更新してからtern定義ファイルを作成するので、
そのとき ``browser-compat-data`` の内容が反映されます。

結果、更新はFirefoxのリリースサイクルと同じく大体6週間に一度「必要かもしれない」タイミングが到来します。
tern定義ファイルが変化しなければ更新しませんし、
もっと短い間隔で更新が必要になるケースもあります(実際ありました)。


毎日一回やること
------------------

毎日一回更新チェックスクリプトを手動で実行しています。
自動化して通知を送付させれば良いとも思いますが、このプロジェクトは
「やれる気持ちも時間もないなら終わり」というものであり、
「やれない」状態になった自分に通知だけが届き続けるのは虚しいので自動化していません。

更新チェックスクリプトによって、「npm ライブラリを更新する必要があるかもしれない」かどうかが判ります。


.. code-block:: console

  # スクリプト実行例
  pwsh:$ D:\path\to\daily-check.ps1 d:/path/to/mozilla-beta
  478255:31a96f10ac89
  478256:75556d20ccd8
  478257:b029fed629af
  478258:e09caa30a2ed
  478259:61f821471935
  478260:0cda49e34d37
  478261:69d593f6097b
  478262:5cb524fe7be8
  478263:aaab66845dc5
  478264:eaa3a2a13a5d
  478265:07f7e41737eb
  478266:d3320ef71ef2
  478267:b1ca612ffb07
  478268:6a8ce370f814
  478269:4a79d4e9efff
  478270:f7b6f9fd2de5
  478271:e21cf620b886
  478272:42533e380350
  478273:476aa14b33e3

  # 更新が多い場合は次を表示する指示を入力させる状態になります。
  # S1000 とすれば1000行スキップできます。

  incomings may exist. hg pull -u? [y/n]: y  # yを入力
  https://hg.mozilla.org/releases/mozilla-beta/ から取り込み中
  変更点を探索中
  リビジョンを追加中
  マニフェストを追加中
  ファイルの変更を追加中
  19 個のリビジョン(41 の変更を 35 ファイルに適用)を追加
    # ここまではすぐ到達しますが、ここからはかなり時間かかります。2件とかでも数分です
  new changesets 31a96f10ac89:476aa14b33e3
  ファイルの更新数 35、 マージ数 0、 削除数 1、 衝突未解消数 0
  no change added.


「更新の必要があるかもしれない」場合は、
まず ``cset.log`` と ``cset_pubed.log`` を比べて、コミットログのレベルで何が変更されたか見ます。
これは趣味なので飛ばしてもいいです。
また、リポジトリの履歴追跡に際しては 2つの ``manifest.json`` に注目しているのですが、
それぞれコミットログを3つしか記録していないので、
変更が多いときは最新の3つ以外は判りません。
続いて ``npm run build -- --mozilla-repo d:/path/to/mozilla-beta`` してtern定義ファイルを作ります。
最後に ``npm publish`` した時点のものと ``diff`` を取って調べます。
違いがあればパッケージを作り直してアップロードします(次節参照)。
違いがなければ更新できないので、翌日以降の変更チェックを継続するための準備作業をします。
``cset_pubed.log`` を削除して現在の ``cset.log`` を残したまま ``cset_pubed.log`` に別名コピーします。
手順のこの部分は改善の余地があります。


更新するとき
------------------


tern定義ファイル生成
======================

まず先に生成したtern定義ファイルを名前変更しておきます。
今後の更新チェックで ``diff`` を取るために使います。

``mdn-browser-compat-data`` npm パッケージを更新します。
``yarn outdated`` で状況確認したのち ``yarn upgrade mdn-browser-compat-data`` などします。
``npm outdated`` と ``npm update --save`` でもいいです。

続いて定義ファイル生成です。
``npm run build -- --mozilla-repo d:/path/to/mozilla-beta --shrink`` です。
パッケージサイズを小さくしたいのでこうしています。


パッケージを作る
==================

先に ``package.json`` 記載のバージョンを更新します。

.. code-block:: console

  # publish の前にtgzを作って中身をチェックしています。
  # この時点ではdefs/which_is_used.txtが前回提出時のままです。
  pwsh:$ npm pack

  # これを実行したのちユーザ入力待ちになります。
  # d:/path/to/repository のように入力します
  pwsh:$ npm publish

  cmdlet regist-pub-status.ps1 at command pipeline position 1
  Supply values for the following parameters:
  mozilla_repo: d:/path/to/mozilla-beta
  + tern-def-webextensions@x.y.z


更新チェックスクリプトで違いがなかった場合は
``cset.log`` を残したまま ``cset_pubed.log`` に別名コピーしましたが、
パッケージを作成した場合は ``npm publish`` の過程で自動で処理されます。
パッケージ作成で失敗した場合はここがおかしくなるので、やはり手順に改善の余地があります。


パッケージを作った後
======================

一応githubにpushしています。tern定義ファイルはないですが。
あとtwitterでツイートしています。
ツイート以外の通知はしていません。
最初だけ mozilla の IRC で「広告していいですか」ときいて、結果コミュニティ製のWebextensionsツールとして
紹介してもらえましたが、それだけです。

* IRC ircs://irc.mozilla.org:6697/ の #webextensions
* ツールの一例として記載されたときのスレッド `2018-04-12 Extension development tools - Add-ons / Development - Mozilla Discourse <https://discourse.mozilla.org/t/extension-development-tools/27608>`__


タグをつける
======================

.. code-block:: console

  git tag 1.0.0
  git push
  git push --tags


.. vim:expandtab ff=dos fenc=utf-8 sw=2

