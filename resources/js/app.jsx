import React from "react";
import ReactDOM from "react-dom/client";
import "../css/app.css";

function App() {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <h1 className="text-3xl font-bold text-blue-600">
                Laravel 13 + React + Tailwind 🚀
            </h1>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById("app")).render(<App />);
