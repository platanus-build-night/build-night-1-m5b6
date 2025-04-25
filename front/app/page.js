"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Home;
const react_1 = require("react");
const outline_1 = require("@heroicons/react/24/outline");
const featured_headline_1 = __importDefault(require("@/components/featured-headline"));
const category_card_1 = __importDefault(require("@/components/category-card"));
const graph_mode_1 = __importDefault(require("@/components/graph-mode"));
const mock_data_1 = require("@/lib/mock-data");
function Home() {
    const [mode, setMode] = (0, react_1.useState)("dashboard");
    const [isDaytime, setIsDaytime] = (0, react_1.useState)(true);
    const [expandedCategory, setExpandedCategory] = (0, react_1.useState)(null);
    // Mock day/night cycle - in a real app, this would check actual sunrise/sunset
    (0, react_1.useEffect)(() => {
        const checkDayTime = () => {
            const hours = new Date().getHours();
            setIsDaytime(hours >= 6 && hours < 20);
        };
        checkDayTime();
        const interval = setInterval(checkDayTime, 60000);
        return () => clearInterval(interval);
    }, []);
    const toggleMode = () => {
        setMode(mode === "dashboard" ? "graph" : "dashboard");
        setExpandedCategory(null);
    };
    return (<main className="flex min-h-screen flex-col bg-white dark:bg-black text-black dark:text-white">
      {/* App Header */}
      <header className="sticky top-0 z-10 backdrop-blur-lg bg-white/80 dark:bg-black/80 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-medium">houp.cl</h1>
            {/* Day/Night Visor */}
            <div className="ml-2 flex items-center">
              {isDaytime ? (<div className="flex items-center text-amber-500">
                  <outline_1.SunIcon className="h-5 w-5 mr-1"/>
                  <span className="text-xs">Open</span>
                </div>) : (<div className="flex items-center text-indigo-400">
                  <outline_1.MoonIcon className="h-5 w-5 mr-1"/>
                  <span className="text-xs">Closed until sunrise</span>
                </div>)}
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-0.5">
            <button onClick={() => setMode("dashboard")} className={`flex items-center px-3 py-1.5 rounded-full text-sm ${mode === "dashboard" ? "bg-white dark:bg-gray-900 shadow-sm" : "text-gray-500 dark:text-gray-400"}`}>
              <outline_1.Squares2X2Icon className="h-4 w-4 mr-1.5"/>
              Dashboard
            </button>
            <button onClick={() => setMode("graph")} className={`flex items-center px-3 py-1.5 rounded-full text-sm ${mode === "graph" ? "bg-white dark:bg-gray-900 shadow-sm" : "text-gray-500 dark:text-gray-400"}`}>
              <outline_1.ChartBarIcon className="h-4 w-4 mr-1.5"/>
              Immersive
            </button>
          </div>
        </div>
      </header>

      {/* Featured Headline */}
      {isDaytime && <featured_headline_1.default headline={mock_data_1.mockFeaturedHeadline.headline} digest={mock_data_1.mockFeaturedHeadline.digest}/>}

      {/* Content Area */}
      <div className="flex-1 container mx-auto px-4 py-6">
        {!isDaytime ? (<div className="flex flex-col items-center justify-center h-[70vh] text-center">
            <outline_1.MoonIcon className="h-16 w-16 text-indigo-400 mb-4"/>
            <h2 className="text-2xl font-medium mb-2">Houp is resting</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              We're closed for the night. Return after sunrise for your daily dose of positive news.
            </p>
          </div>) : mode === "dashboard" ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mock_data_1.mockCategories.map((category) => (<category_card_1.default key={category.id} category={category} isExpanded={expandedCategory === category.id} onToggle={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}/>))}
          </div>) : (<graph_mode_1.default categories={mock_data_1.mockCategories}/>)}
      </div>
    </main>);
}
