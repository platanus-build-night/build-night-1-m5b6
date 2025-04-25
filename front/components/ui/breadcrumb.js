"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BreadcrumbEllipsis = exports.BreadcrumbSeparator = exports.BreadcrumbPage = exports.BreadcrumbLink = exports.BreadcrumbItem = exports.BreadcrumbList = exports.Breadcrumb = void 0;
const React = __importStar(require("react"));
const react_slot_1 = require("@radix-ui/react-slot");
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/lib/utils");
const Breadcrumb = React.forwardRef((_a, ref) => {
    var props = __rest(_a, []);
    return <nav ref={ref} aria-label="breadcrumb" {...props}/>;
});
exports.Breadcrumb = Breadcrumb;
Breadcrumb.displayName = "Breadcrumb";
const BreadcrumbList = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<ol ref={ref} className={(0, utils_1.cn)("flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5", className)} {...props}/>);
});
exports.BreadcrumbList = BreadcrumbList;
BreadcrumbList.displayName = "BreadcrumbList";
const BreadcrumbItem = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<li ref={ref} className={(0, utils_1.cn)("inline-flex items-center gap-1.5", className)} {...props}/>);
});
exports.BreadcrumbItem = BreadcrumbItem;
BreadcrumbItem.displayName = "BreadcrumbItem";
const BreadcrumbLink = React.forwardRef((_a, ref) => {
    var { asChild, className } = _a, props = __rest(_a, ["asChild", "className"]);
    const Comp = asChild ? react_slot_1.Slot : "a";
    return (<Comp ref={ref} className={(0, utils_1.cn)("transition-colors hover:text-foreground", className)} {...props}/>);
});
exports.BreadcrumbLink = BreadcrumbLink;
BreadcrumbLink.displayName = "BreadcrumbLink";
const BreadcrumbPage = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<span ref={ref} role="link" aria-disabled="true" aria-current="page" className={(0, utils_1.cn)("font-normal text-foreground", className)} {...props}/>);
});
exports.BreadcrumbPage = BreadcrumbPage;
BreadcrumbPage.displayName = "BreadcrumbPage";
const BreadcrumbSeparator = (_a) => {
    var { children, className } = _a, props = __rest(_a, ["children", "className"]);
    return (<li role="presentation" aria-hidden="true" className={(0, utils_1.cn)("[&>svg]:w-3.5 [&>svg]:h-3.5", className)} {...props}>
    {children !== null && children !== void 0 ? children : <lucide_react_1.ChevronRight />}
  </li>);
};
exports.BreadcrumbSeparator = BreadcrumbSeparator;
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";
const BreadcrumbEllipsis = (_a) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<span role="presentation" aria-hidden="true" className={(0, utils_1.cn)("flex h-9 w-9 items-center justify-center", className)} {...props}>
    <lucide_react_1.MoreHorizontal className="h-4 w-4"/>
    <span className="sr-only">More</span>
  </span>);
};
exports.BreadcrumbEllipsis = BreadcrumbEllipsis;
BreadcrumbEllipsis.displayName = "BreadcrumbElipssis";
