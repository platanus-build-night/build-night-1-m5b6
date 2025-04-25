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
exports.PaginationPrevious = exports.PaginationNext = exports.PaginationLink = exports.PaginationItem = exports.PaginationEllipsis = exports.PaginationContent = exports.Pagination = void 0;
const React = __importStar(require("react"));
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/lib/utils");
const button_1 = require("@/components/ui/button");
const Pagination = (_a) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<nav role="navigation" aria-label="pagination" className={(0, utils_1.cn)("mx-auto flex w-full justify-center", className)} {...props}/>);
};
exports.Pagination = Pagination;
Pagination.displayName = "Pagination";
const PaginationContent = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<ul ref={ref} className={(0, utils_1.cn)("flex flex-row items-center gap-1", className)} {...props}/>);
});
exports.PaginationContent = PaginationContent;
PaginationContent.displayName = "PaginationContent";
const PaginationItem = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<li ref={ref} className={(0, utils_1.cn)("", className)} {...props}/>);
});
exports.PaginationItem = PaginationItem;
PaginationItem.displayName = "PaginationItem";
const PaginationLink = (_a) => {
    var { className, isActive, size = "icon" } = _a, props = __rest(_a, ["className", "isActive", "size"]);
    return (<a aria-current={isActive ? "page" : undefined} className={(0, utils_1.cn)((0, button_1.buttonVariants)({
            variant: isActive ? "outline" : "ghost",
            size,
        }), className)} {...props}/>);
};
exports.PaginationLink = PaginationLink;
PaginationLink.displayName = "PaginationLink";
const PaginationPrevious = (_a) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<PaginationLink aria-label="Go to previous page" size="default" className={(0, utils_1.cn)("gap-1 pl-2.5", className)} {...props}>
    <lucide_react_1.ChevronLeft className="h-4 w-4"/>
    <span>Previous</span>
  </PaginationLink>);
};
exports.PaginationPrevious = PaginationPrevious;
PaginationPrevious.displayName = "PaginationPrevious";
const PaginationNext = (_a) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<PaginationLink aria-label="Go to next page" size="default" className={(0, utils_1.cn)("gap-1 pr-2.5", className)} {...props}>
    <span>Next</span>
    <lucide_react_1.ChevronRight className="h-4 w-4"/>
  </PaginationLink>);
};
exports.PaginationNext = PaginationNext;
PaginationNext.displayName = "PaginationNext";
const PaginationEllipsis = (_a) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<span aria-hidden className={(0, utils_1.cn)("flex h-9 w-9 items-center justify-center", className)} {...props}>
    <lucide_react_1.MoreHorizontal className="h-4 w-4"/>
    <span className="sr-only">More pages</span>
  </span>);
};
exports.PaginationEllipsis = PaginationEllipsis;
PaginationEllipsis.displayName = "PaginationEllipsis";
