// swift-tools-version:5.6
import PackageDescription

let package = Package(
    name: "TreeSitterSQLOrcl",
    products: [
        .library(name: "TreeSitterSQLOrcl", targets: ["TreeSitterSQLOrcl"]),
    ],
    dependencies: [
        .package(url: "https://github.com/tree-sitter/swift-tree-sitter", from: "0.8.0"),
    ],
    targets: [
        .target(
            name: "TreeSitterSQLOrcl",
            dependencies: [],
            path: ".",
            exclude: [
                "binding.gyp",
                "bindings/c",
                "bindings/go",
                "bindings/node",
                "bindings/python",
                "bindings/rust",
                "Cargo.toml",
                "CHANGELOG.md",
                "CMakeLists.txt",
                "CONTRIBUTING.md",
                "docs",
                "go.mod",
                "grammar",
                "grammar.js",
                "LICENSE",
                "LICENSE-third-party",
                "Makefile",
                "package.json",
                "package-lock.json",
                "pyproject.toml",
                "README.md",
                "scripts",
                "setup.py",
                "src/grammar.json",
                "src/node-types.json",
                "test",
                "tree-sitter.json",
            ],
            sources: [
                "src/parser.c",
                "src/scanner.c",
            ],
            resources: [
                .copy("queries")
            ],
            publicHeadersPath: "bindings/swift/TreeSitterSQLOrcl",
            cSettings: [.headerSearchPath("src")]
        ),
        .testTarget(
            name: "TreeSitterSQLOrclTests",
            dependencies: [
                .product(name: "SwiftTreeSitter", package: "swift-tree-sitter"),
                "TreeSitterSQLOrcl",
            ],
            path: "bindings/swift/TreeSitterSQLOrclTests"
        )
    ],
    cLanguageStandard: .c11
)
