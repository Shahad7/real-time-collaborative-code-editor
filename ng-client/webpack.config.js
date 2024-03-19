// const path = require("path");
// const MiniCssExtractPlugin = require("mini-css-extract-plugin");

// module.exports = {
//   entry: {
//     app: "./index.js",
//     // Package each language's worker and give these filenames in `getWorkerUrl`
//     "editor.worker": "monaco-editor/esm/vs/editor/editor.worker.js",
//     "json.worker": "monaco-editor/esm/vs/language/json/json.worker",
//     "css.worker": "monaco-editor/esm/vs/language/css/css.worker",
//     "html.worker": "monaco-editor/esm/vs/language/html/html.worker",
//     "ts.worker": "monaco-editor/esm/vs/language/typescript/ts.worker",
//   },
//   output: {
//     globalObject: "self",
//     filename: "[name].bundle.js",
//     path: path.resolve(__dirname, "dist"),
//   },
//   module: {
//     rules: [
//       {
//         test: /\.css$/,
//         include: [
//           MONACO_DIR,
//           path.join(
//             __dirname,
//             "node_modules/monaco-editor/esm/vs/base/browser/ui/actionbar"
//           ),
//           "./node_modules/monaco-editor/esm/vs/base/browser/ui/actionbar",
//         ],
//         use: [MiniCssExtractPlugin.loader, "css-loader"],
//       },
//       {
//         test: /\.ttf$/,
//         use: ["file-loader"],
//       },
//     ],
//   },
// };
var path = require("path");
var MONACO_DIR = path.join(__dirname, "node_modules/monaco-editor");
var Monaco_Dir = path.join(__dirname, "./node_modules/monaco-editor");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// output: {
//   path: path.resolve(__dirname, 'dist'),
//   filename: 'js/[name].js',
// },

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        include: [MONACO_DIR, Monaco_Dir],
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          {
            options: {
              url: false,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new MonacoEditorWebpackPlugin({
      languages: [
        "typescript",
        "javascript",
        "css",
        "html",
        "kotlin",
        "swift",
        "java",
        "python",
        "csharp",
        "cpp",
        "rust",
        "go",
        "php",
        "ruby",
        "scala",
        "lua",
        "perl",
        "sql",
        "json",
        "yaml",
        "xml",
        "markdown",
        "plaintext",
      ],
    }),
  ],
};
