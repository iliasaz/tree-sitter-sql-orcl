# tree-sitter-sql-orcl

Tree-sitter grammar for Oracle SQL and PL/SQL. Used by [Macintora](https://github.com/iliasaz/macintora) to drive editor syntax highlighting.

## Status

Early. The grammar is seeded from [`DerekStride/tree-sitter-sql`](https://github.com/DerekStride/tree-sitter-sql) (ANSI-leaning SQL) and is being extended with Oracle-specific syntax (`q'...'` literals, hints, `CONNECT BY`, analytic `OVER`, `MERGE`, `MODEL`) and PL/SQL (anonymous blocks, packages, procedures, functions, triggers, types).

## Build

```sh
npm install -g tree-sitter-cli   # one-time
tree-sitter generate
tree-sitter test
```

The generated `src/parser.c`, `src/grammar.json`, and `src/node-types.json` are committed so Swift Package Manager consumers do not need the `tree-sitter-cli` to build the parser.

## Swift consumption

```swift
.package(url: "https://github.com/iliasaz/tree-sitter-sql-orcl", branch: "main")
```

Exposes the `TreeSitterSQLOrcl` library which declares `tree_sitter_sql_orcl()`.

## Credits

The base grammar is forked from [DerekStride/tree-sitter-sql](https://github.com/DerekStride/tree-sitter-sql), MIT licensed (see `LICENSE-third-party`).

## License

MIT — see `LICENSE`.
