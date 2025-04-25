"use strict";
"use client";
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
exports.toggleVariants = exports.Toggle = void 0;
const React = __importStar(require("react"));
const TogglePrimitive = __importStar(require("@radix-ui/react-toggle"));
const class_variance_authority_1 = require("class-variance-authority");
const utils_1 = require("@/lib/utils");
const toggleVariants = (0, class_variance_authority_1.cva)("inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 gap-2", {
    variants: {
        variant: {
            default: "bg-transparent",
            outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
        },
        size: {
            default: "h-10 px-3 min-w-10",
            sm: "h-9 px-2.5 min-w-9",
            lg: "h-11 px-5 min-w-11",
        },
    },
    defaultVariants: {
        variant: "default",
        size: "default",
    },
});
exports.toggleVariants = toggleVariants;
const Toggle = React.forwardRef((_a, ref) => {
    var { className, variant, size } = _a, props = __rest(_a, ["className", "variant", "size"]);
    return (<TogglePrimitive.Root ref={ref} className={(0, utils_1.cn)(toggleVariants({ variant, size, className }))} {...props}/>);
});
exports.Toggle = Toggle;
Toggle.displayName = TogglePrimitive.Root.displayName;
