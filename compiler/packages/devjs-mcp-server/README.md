# Devjs MCP Server (experimental)

An experimental MCP Server for Devjs.

## Development

First, add this file if you're using Claude Desktop: `code ~/Library/Application\ Support/Claude/claude_desktop_config.json`. Copy the absolute path from `which node` and from `devjs/compiler/devjs-mcp-server/dist/index.js` and paste, for example:

```json
{
  "mcpServers": {
    "devjs": {
      "command": "/Users/<username>/.asdf/shims/node",
      "args": [
        "/Users/<username>/code/devjs/compiler/packages/devjs-mcp-server/dist/index.js"
      ]
    }
  }
}
```

Next, run `pnpm workspace devjs-mcp-server watch` from the `devjs/compiler` directory and make changes as needed. You will need to restart Claude everytime you want to try your changes.
