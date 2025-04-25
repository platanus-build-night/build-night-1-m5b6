"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = RootLayout;
require("./globals.css");
exports.metadata = {
    title: 'v0 App',
    description: 'Created with v0',
    generator: 'v0.dev',
};
function RootLayout({ children, }) {
    return (<html lang="en">
      <body>{children}</body>
    </html>);
}
