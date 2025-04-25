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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarouselNext = exports.CarouselPrevious = exports.CarouselItem = exports.CarouselContent = exports.Carousel = void 0;
const React = __importStar(require("react"));
const embla_carousel_react_1 = __importDefault(require("embla-carousel-react"));
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/lib/utils");
const button_1 = require("@/components/ui/button");
const CarouselContext = React.createContext(null);
function useCarousel() {
    const context = React.useContext(CarouselContext);
    if (!context) {
        throw new Error("useCarousel must be used within a <Carousel />");
    }
    return context;
}
const Carousel = React.forwardRef((_a, ref) => {
    var { orientation = "horizontal", opts, setApi, plugins, className, children } = _a, props = __rest(_a, ["orientation", "opts", "setApi", "plugins", "className", "children"]);
    const [carouselRef, api] = (0, embla_carousel_react_1.default)(Object.assign(Object.assign({}, opts), { axis: orientation === "horizontal" ? "x" : "y" }), plugins);
    const [canScrollPrev, setCanScrollPrev] = React.useState(false);
    const [canScrollNext, setCanScrollNext] = React.useState(false);
    const onSelect = React.useCallback((api) => {
        if (!api) {
            return;
        }
        setCanScrollPrev(api.canScrollPrev());
        setCanScrollNext(api.canScrollNext());
    }, []);
    const scrollPrev = React.useCallback(() => {
        api === null || api === void 0 ? void 0 : api.scrollPrev();
    }, [api]);
    const scrollNext = React.useCallback(() => {
        api === null || api === void 0 ? void 0 : api.scrollNext();
    }, [api]);
    const handleKeyDown = React.useCallback((event) => {
        if (event.key === "ArrowLeft") {
            event.preventDefault();
            scrollPrev();
        }
        else if (event.key === "ArrowRight") {
            event.preventDefault();
            scrollNext();
        }
    }, [scrollPrev, scrollNext]);
    React.useEffect(() => {
        if (!api || !setApi) {
            return;
        }
        setApi(api);
    }, [api, setApi]);
    React.useEffect(() => {
        if (!api) {
            return;
        }
        onSelect(api);
        api.on("reInit", onSelect);
        api.on("select", onSelect);
        return () => {
            api === null || api === void 0 ? void 0 : api.off("select", onSelect);
        };
    }, [api, onSelect]);
    return (<CarouselContext.Provider value={{
            carouselRef,
            api: api,
            opts,
            orientation: orientation || ((opts === null || opts === void 0 ? void 0 : opts.axis) === "y" ? "vertical" : "horizontal"),
            scrollPrev,
            scrollNext,
            canScrollPrev,
            canScrollNext,
        }}>
        <div ref={ref} onKeyDownCapture={handleKeyDown} className={(0, utils_1.cn)("relative", className)} role="region" aria-roledescription="carousel" {...props}>
          {children}
        </div>
      </CarouselContext.Provider>);
});
exports.Carousel = Carousel;
Carousel.displayName = "Carousel";
const CarouselContent = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    const { carouselRef, orientation } = useCarousel();
    return (<div ref={carouselRef} className="overflow-hidden">
      <div ref={ref} className={(0, utils_1.cn)("flex", orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col", className)} {...props}/>
    </div>);
});
exports.CarouselContent = CarouselContent;
CarouselContent.displayName = "CarouselContent";
const CarouselItem = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    const { orientation } = useCarousel();
    return (<div ref={ref} role="group" aria-roledescription="slide" className={(0, utils_1.cn)("min-w-0 shrink-0 grow-0 basis-full", orientation === "horizontal" ? "pl-4" : "pt-4", className)} {...props}/>);
});
exports.CarouselItem = CarouselItem;
CarouselItem.displayName = "CarouselItem";
const CarouselPrevious = React.forwardRef((_a, ref) => {
    var { className, variant = "outline", size = "icon" } = _a, props = __rest(_a, ["className", "variant", "size"]);
    const { orientation, scrollPrev, canScrollPrev } = useCarousel();
    return (<button_1.Button ref={ref} variant={variant} size={size} className={(0, utils_1.cn)("absolute  h-8 w-8 rounded-full", orientation === "horizontal"
            ? "-left-12 top-1/2 -translate-y-1/2"
            : "-top-12 left-1/2 -translate-x-1/2 rotate-90", className)} disabled={!canScrollPrev} onClick={scrollPrev} {...props}>
      <lucide_react_1.ArrowLeft className="h-4 w-4"/>
      <span className="sr-only">Previous slide</span>
    </button_1.Button>);
});
exports.CarouselPrevious = CarouselPrevious;
CarouselPrevious.displayName = "CarouselPrevious";
const CarouselNext = React.forwardRef((_a, ref) => {
    var { className, variant = "outline", size = "icon" } = _a, props = __rest(_a, ["className", "variant", "size"]);
    const { orientation, scrollNext, canScrollNext } = useCarousel();
    return (<button_1.Button ref={ref} variant={variant} size={size} className={(0, utils_1.cn)("absolute h-8 w-8 rounded-full", orientation === "horizontal"
            ? "-right-12 top-1/2 -translate-y-1/2"
            : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90", className)} disabled={!canScrollNext} onClick={scrollNext} {...props}>
      <lucide_react_1.ArrowRight className="h-4 w-4"/>
      <span className="sr-only">Next slide</span>
    </button_1.Button>);
});
exports.CarouselNext = CarouselNext;
CarouselNext.displayName = "CarouselNext";
