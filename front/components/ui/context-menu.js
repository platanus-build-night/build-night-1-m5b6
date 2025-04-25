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
exports.ContextMenuRadioGroup = exports.ContextMenuSubTrigger = exports.ContextMenuSubContent = exports.ContextMenuSub = exports.ContextMenuPortal = exports.ContextMenuGroup = exports.ContextMenuShortcut = exports.ContextMenuSeparator = exports.ContextMenuLabel = exports.ContextMenuRadioItem = exports.ContextMenuCheckboxItem = exports.ContextMenuItem = exports.ContextMenuContent = exports.ContextMenuTrigger = exports.ContextMenu = void 0;
const React = __importStar(require("react"));
const ContextMenuPrimitive = __importStar(require("@radix-ui/react-context-menu"));
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/lib/utils");
const ContextMenu = ContextMenuPrimitive.Root;
exports.ContextMenu = ContextMenu;
const ContextMenuTrigger = ContextMenuPrimitive.Trigger;
exports.ContextMenuTrigger = ContextMenuTrigger;
const ContextMenuGroup = ContextMenuPrimitive.Group;
exports.ContextMenuGroup = ContextMenuGroup;
const ContextMenuPortal = ContextMenuPrimitive.Portal;
exports.ContextMenuPortal = ContextMenuPortal;
const ContextMenuSub = ContextMenuPrimitive.Sub;
exports.ContextMenuSub = ContextMenuSub;
const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup;
exports.ContextMenuRadioGroup = ContextMenuRadioGroup;
const ContextMenuSubTrigger = React.forwardRef((_a, ref) => {
    var { className, inset, children } = _a, props = __rest(_a, ["className", "inset", "children"]);
    return (<ContextMenuPrimitive.SubTrigger ref={ref} className={(0, utils_1.cn)("flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground", inset && "pl-8", className)} {...props}>
    {children}
    <lucide_react_1.ChevronRight className="ml-auto h-4 w-4"/>
  </ContextMenuPrimitive.SubTrigger>);
});
exports.ContextMenuSubTrigger = ContextMenuSubTrigger;
ContextMenuSubTrigger.displayName = ContextMenuPrimitive.SubTrigger.displayName;
const ContextMenuSubContent = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<ContextMenuPrimitive.SubContent ref={ref} className={(0, utils_1.cn)("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className)} {...props}/>);
});
exports.ContextMenuSubContent = ContextMenuSubContent;
ContextMenuSubContent.displayName = ContextMenuPrimitive.SubContent.displayName;
const ContextMenuContent = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<ContextMenuPrimitive.Portal>
    <ContextMenuPrimitive.Content ref={ref} className={(0, utils_1.cn)("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className)} {...props}/>
  </ContextMenuPrimitive.Portal>);
});
exports.ContextMenuContent = ContextMenuContent;
ContextMenuContent.displayName = ContextMenuPrimitive.Content.displayName;
const ContextMenuItem = React.forwardRef((_a, ref) => {
    var { className, inset } = _a, props = __rest(_a, ["className", "inset"]);
    return (<ContextMenuPrimitive.Item ref={ref} className={(0, utils_1.cn)("relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", inset && "pl-8", className)} {...props}/>);
});
exports.ContextMenuItem = ContextMenuItem;
ContextMenuItem.displayName = ContextMenuPrimitive.Item.displayName;
const ContextMenuCheckboxItem = React.forwardRef((_a, ref) => {
    var { className, children, checked } = _a, props = __rest(_a, ["className", "children", "checked"]);
    return (<ContextMenuPrimitive.CheckboxItem ref={ref} className={(0, utils_1.cn)("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className)} checked={checked} {...props}>
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <lucide_react_1.Check className="h-4 w-4"/>
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.CheckboxItem>);
});
exports.ContextMenuCheckboxItem = ContextMenuCheckboxItem;
ContextMenuCheckboxItem.displayName =
    ContextMenuPrimitive.CheckboxItem.displayName;
const ContextMenuRadioItem = React.forwardRef((_a, ref) => {
    var { className, children } = _a, props = __rest(_a, ["className", "children"]);
    return (<ContextMenuPrimitive.RadioItem ref={ref} className={(0, utils_1.cn)("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className)} {...props}>
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <lucide_react_1.Circle className="h-2 w-2 fill-current"/>
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.RadioItem>);
});
exports.ContextMenuRadioItem = ContextMenuRadioItem;
ContextMenuRadioItem.displayName = ContextMenuPrimitive.RadioItem.displayName;
const ContextMenuLabel = React.forwardRef((_a, ref) => {
    var { className, inset } = _a, props = __rest(_a, ["className", "inset"]);
    return (<ContextMenuPrimitive.Label ref={ref} className={(0, utils_1.cn)("px-2 py-1.5 text-sm font-semibold text-foreground", inset && "pl-8", className)} {...props}/>);
});
exports.ContextMenuLabel = ContextMenuLabel;
ContextMenuLabel.displayName = ContextMenuPrimitive.Label.displayName;
const ContextMenuSeparator = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<ContextMenuPrimitive.Separator ref={ref} className={(0, utils_1.cn)("-mx-1 my-1 h-px bg-border", className)} {...props}/>);
});
exports.ContextMenuSeparator = ContextMenuSeparator;
ContextMenuSeparator.displayName = ContextMenuPrimitive.Separator.displayName;
const ContextMenuShortcut = (_a) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<span className={(0, utils_1.cn)("ml-auto text-xs tracking-widest text-muted-foreground", className)} {...props}/>);
};
exports.ContextMenuShortcut = ContextMenuShortcut;
ContextMenuShortcut.displayName = "ContextMenuShortcut";
