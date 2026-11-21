# Span CSV Reader

[中文](#中文) · [English](#english)

## 中文

无依赖 CSV 解析器，按字段区间切片并保留损坏引号、孤立回车和列数不齐的诊断。

### 本地运行

使用 Node.js 22.18 或更新版本。从 `solve.js` 导入 `run({ text, header })`，或让 `main.ts` 从 `MAKEFUN_INPUT_DIR/cases.json` 读取测试集并向 `MAKEFUN_OUTPUT_DIR` 写入结果。

## English

A dependency-free CSV parser with span scanning and exact recovery diagnostics for malformed fields and ragged records.

### Run locally

Use Node.js 22.18 or newer. Import `run({ text, header })` from `solve.js`, or run `node main.ts` with `MAKEFUN_INPUT_DIR` containing `cases.json` and `MAKEFUN_OUTPUT_DIR` pointing to an existing output directory.

[make.fun 赛事 / Original bounty](https://make.fun/bounty/csv-reader-speed-01-run-20261121)

## 示例 / Example

```sh
node --input-type=module -e "import { run } from './solve.js'; console.log(JSON.stringify(run({ text: 'name,score\nAda,42', header: true })))"
```

## 结果字段 / Output fields

| 字段或代码 / Field or code | 中文 | English |
| --- | --- | --- |
| `columns` | 表头列名（无表头时为 null） | Column names, or null without a header |
| `rows` | 解析出的记录 | Parsed records |
| `errors` | 诊断列表 | Diagnostic list |
| `unterminated_quote` | 引号未闭合 | Unclosed quoted field |
| `stray_cr` | 孤立的回车符 | Isolated carriage return |
| `quote_junk` | 引号后有多余内容 | Unexpected text after a quote |
| `short_row` | 字段少于预期 | Too few fields |
| `long_row` | 字段多于预期 | Too many fields |

## 许可证 / License

MIT. See [LICENSE](LICENSE).

