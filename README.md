gulp-base使用方法
====

## 各ティレクトリの説明
_src --- _js             // minifyするjsを格納。拡張子.js / minifyしたくないものは_*.js
   |- _sass           // コンパイルするscssを格納。拡張性.scss / 直接出力しないものは_*.scss
	 |- _images         // 画像格納。このフォルダに入れた画像はdistフォルダに圧縮されて格納される
   |- _ejs            // htmlファイル格納場所。拡張子.ejs, html出力したくないものは_*.ejs
     |- _include    // _*.ejsファイル格納場所

***

dist --- apps            // 中のthemesにそれぞれコンパイルcss、minifyされたjsが格納される。'themefile'名は任意で変更（gulpfile.jsのディレクトリ指定の変更も必要）
   |- images          // 圧縮された画像の格納先
   |- docs
	   |- css         // cssスタイルガイドラインファイル


## 開発環境準備
1. [npm i gulp -D]
ローカルフォルダにgulpをインストール

2. [npm i]
パッケージインストール


## gulp コマンド
1. [gulp]
gulpの実行。scss,js,ejs,fileのタスク処理

2. [gulp clean]
_src/内で作成されたhtml,image,iconは、フォルダやファイルの削除・リネームをしても、distフォルダからは削除されないため、
htmlファイルの増減があった場合はgulp clean後にgulpを実行し、distフォルダを再生成する。 