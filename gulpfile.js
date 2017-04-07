'use strict';

// ----------------------------------------
// Settings
// ----------------------------------------
var path = {
	$iconSrcDir: '_src/_icons/**/', // アイコンにするSVGファイルの格納場所
	$iconCssDestDir: '_src/_sass/foundation/', // アイコン用SCSSファイルの格納場所
	$iconTemplateCssPath: '_src/_sass/foundation/_fontstemplate.scss', // アイコン用CSSのテンプレートファイル
	$iconDestDir: 'dist/apps/themes/themefile/resources/fonts/',　// アイコンファイルの出力先
	$sassSrcDir: '_src/_sass/**/', // 開発用SCSSファイル格納場所
	$cssStyleDir: 'dist/docs/css/', // CSSスタイルガイドの生成場所
	$cssDestDir: 'dist/apps/themes/themefile/resources/css/', // コンパイルCSSの出力先
	$jsSrcDir: '_src/_js/**/', // 開発用JSファイルの格納場所
	$jsDestDir: 'dist/apps/themes/themefile/resources/js/', // 圧縮JSファイルの出力先
	$htmlEditDir: '_src/_ejs/**/', // 開発用HTML（EJS）ファイルの格納場所
	$imgSrcDir: '_src/_images/**/', // 画像ファイルの格納場所
	$distDir: 'dist/' // ローカルルートフォルダ
}
var name = {
	$iconFontName: 'myfont', // iconfont名称設定
	$compiledCssName: 'app.css', // コンパイルCSSのファイル名指定
	$concatJsName: 'app.js' // 圧縮JSのファイル名指定
}

// ----------------------------------------
// Packages
// ----------------------------------------
var gulp = require('gulp'), // gulp
	browserSync = require('browser-sync'), // ブラウザの自動リロード
	reload = browserSync.reload, // ブラウザの自動リロード
	plumber = require('gulp-plumber'), // タスクの継続
	rename = require('gulp-rename'), // ファイル名のリネーム
	notify = require('gulp-notify'), // タスク完了通知
	concat = require('gulp-concat'), // 複数ファイルのマージ
	rimraf = require('rimraf'), // 単一ファイル削除
	del = require('del'), // 複数ファイル、ディレクトリ削除
	runSequence = require('run-sequence'), // 直列処理
	cache = require('gulp-cached'), // ファイルキャッシュ、変更点のみの処理を実行
	consolidate = require('gulp-consolidate'), // テンプレートエンジン
	watch = require('gulp-watch'), // ファイル監視
	sourcemaps = require('gulp-sourcemaps'), // sassソースマップ作成
	sass = require('gulp-sass'), // sass
	autoPrefixer = require('gulp-autoprefixer'), // Can I Use を用いたベンダープレフィックスの自動付与
	cmq = require('gulp-merge-media-queries'), // メディアクエリの記載順自動整理
	cssComb = require('gulp-csscomb'), // cssプロパティの自動整列
	frontnote = require('gulp-frontnote'), // cssスタイルガイド自動生成
	cleanCss = require('gulp-clean-css'), // css圧縮
	uglify = require('gulp-uglify'), // js圧縮
	imageMin = require('gulp-imagemin'), // 画像圧縮
	pngquant = require("imagemin-pngquant"), // 画像圧縮オプション
	iconfont = require('gulp-iconfont'), // iconfont作成
	Async = require('async'), // iconfont関係
	svgmin = require('gulp-svgmin'), // svg圧縮
	ejs = require('gulp-ejs'); // html include

// ----------------------------------------
// HTML Task
// ----------------------------------------
gulp.task('ejs', function () {
	gulp.src(
		[path.$htmlEditDir + '*.ejs', '!' + path.$htmlEditDir + '_*.ejs']
		)
		.pipe(plumber({
			errorHandler: notify.onError("Error: <%= error.message %>")
		}))
		.pipe(ejs())
		.pipe(rename({
			extname: '.html'
		}))
		.pipe(gulp.dest(path.$distDir))
		.pipe(notify({
			title: 'HTML MAKE DONE!!',
			message: new Date()
		}));
});

// ----------------------------------------
// Image Task
// ----------------------------------------
gulp.task('imageMin', function () {
	gulp.src(
		[path.$imgSrcDir + '*.{png,jpg,svg,webp}']
		)
		.pipe(plumber({
			errorHandler: notify.onError("Error: <%= error.message %>")
		}))
		.pipe(imageMin({
			progressive: true,
			svgpPlugins: [
				{
					removeViewBox: false
				},
				{
					cleanupIDs: false
				}
		],
			use: [pngquant()]
		}))
		.pipe(gulp.dest(path.$distDir + 'images'));
})

// ----------------------------------------
// Iconfont Task
// ----------------------------------------
gulp.task('iconfont', function (done) {
	var iconStream = gulp.src(
		[path.$iconSrcDir + '*.svg']
		)
		.pipe(svgmin())
		.pipe(iconfont({
			fontName: name.$iconFontName,
			formats: ['ttf', 'eot', 'woff', 'woff2', 'svg']
		}));

	Async.parallel([
		function handleGlyphs(cb) {
			iconStream.on('glyphs', function (glyphs, options) {
				gulp.src(
					[path.$iconTemplateCssPath]
					)
					.pipe(consolidate('lodash', {
						glyphs: glyphs,
						fontName: name.$iconFontName,
						fontPath: '../fonts/',
						className: 'icon'
					}))
					.pipe(rename({
						basename: '_fonts'
					}))
					.pipe(gulp.dest(path.$iconCssDestDir))
					.on('finish', cb);
			});
		},
		function handleFonts(cb) {
			iconStream
				.pipe(gulp.dest(path.$iconDestDir))
				.on('finish', cb);
		}
	], done);
});

// ----------------------------------------
// SASS Task
// ----------------------------------------
gulp.task('sass', function () {
	gulp.src(
		[path.$sassSrcDir + '*.scss']
		)
		.pipe(plumber({
			errorHandler: notify.onError("Error: <%= error.message %>")
		}))
		.pipe(frontnote({
			out: path.$cssStyleDir
		}))
		.pipe(sourcemaps.init())
		.pipe(sass({
			outputStyle: 'compressed'
		}))
		.pipe(autoPrefixer({
			browsers: ['last 5 version', 'Safari >=  5', 'ie >= 8', 'Android >= 2.3'],
			cascade: false
		}))
		.pipe(cssComb())
		.pipe(cmq({
			log: true
		}))
		.pipe(concat(name.$compiledCssName))
		.pipe(sourcemaps.write('../maps/'))
		.pipe(gulp.dest(path.$cssDestDir))
		.pipe(cleanCss())
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest(path.$cssDestDir))
		.pipe(notify({
			title: 'sass compile DONE!!',
			message: new Date()
		}));
});

// ----------------------------------------
// Javascript Task
// ----------------------------------------
gulp.task('jsconcat', function () {
	gulp.src(
		[path.$jsSrcDir + '*.js', '!' + path.$jsSrcDir + '_*.js']
		)
		.pipe(plumber({
			errorHandler: notify.onError("Error: <%= error.message %>")
		}))
		.pipe(concat(name.$concatJsName))
		.pipe(gulp.dest(path.$jsDestDir))
});
gulp.task('jsuglify', function () {
	gulp.src(
		[path.$jsDestDir + name.$concatJsName]
		)
		.pipe(plumber({
			errorHandler: notify.onError("Error: <%= error.message %>")
		}))
		.pipe(uglify({
			preserveComments: 'some' // !から始まるコメントを残す
		}))
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest(path.$jsDestDir))
		.pipe(notify({
			title: 'js compress DONE!!',
			message: new Date()
		}));
});
gulp.task('js', ['jsconcat', 'jsuglify']);

// ----------------------------------------
// Browser Sync Task
// ----------------------------------------
gulp.task('browser-Sync', function () {
	browserSync({
		server: {
			baseDir: path.$distDir
		}
	});

	gulp.watch(
		[path.$cssDestDir + '*.css', path.$distDir + '**/*.html', path.$jsDestDir + '*.js'], reload
	);
});

// ----------------------------------------
// Watch Task
// ----------------------------------------
gulp.task('watch', function () {
	gulp.watch(
		[path.$sassSrcDir + '*.scss'], ['sass']
	);
	gulp.watch(
		[path.$htmlEditDir + '*.ejs'], ['ejs']
	);
	gulp.watch(
		[path.$jsSrcDir + '*.js'], ['js']
	);
	gulp.watch(
		[path.$iconSrcDir + '*.svg'], ['iconfont']
	);
	gulp.watch(
		[path.$imgSrcDir + '*'], ['imageMin']
	);
});

// ----------------------------------------
// Task Run
// ----------------------------------------
gulp.task(
	'default', ['watch', 'sass', 'js', 'ejs', 'iconfont', 'imageMin', 'browser-Sync']
);

// ----------------------------------------
// [Command] gulp clean
// ----------------------------------------
gulp.task('clean', function () {
	del([path.$distDir + '**/*']);
});