import React, { useState, useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import Split from "react-split";
import {
  FaHtml5,
  FaCss3Alt,
  FaCog,
  FaExpand,
  FaCompress,
  FaSave,
  FaUpload,
} from "react-icons/fa";

const defaultHTML = '<div class="bg-black text-white p-4">XD</div>';
const defaultCSS = "/* Add custom styles here */";
const defaultConfig = `module.exports = {
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [],
}`;

const TabButton = ({ icon: Icon, label, isActive, onClick }) => (
  <button
    className={`flex items-center px-4 py-2 ${
      isActive
        ? "bg-gray-700 text-white"
        : "text-gray-400 hover:bg-gray-700 hover:text-white"
    } transition-colors duration-200`}
    onClick={onClick}
  >
    <Icon className="mr-2" />
    {label}
  </button>
);

export default function App() {
  const [activeTab, setActiveTab] = useState("HTML");
  const [htmlContent, setHtmlContent] = useState(defaultHTML);
  const [cssContent, setCssContent] = useState(defaultCSS);
  const [configContent, setConfigContent] = useState(defaultConfig);
  const [preview, setPreview] = useState("");
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"></script>
        <script>
          tailwind.config = ${configContent}
        </script>
        <style>${cssContent}</style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `;
    setPreview(fullHtml);
  }, [htmlContent, cssContent, configContent]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  };

  // const saveProject = () => {
  //   const project = {
  //     html: htmlContent,
  //     css: cssContent,
  //     config: configContent,
  //   };
  //   const blob = new Blob([JSON.stringify(project)], {
  //     type: "application/json",
  //   });
  //   const url = URL.createObjectURL(blob);
  //   const a = document.createElement("a");
  //   a.href = url;
  //   a.download = "tailwind-playground-project.json";
  //   a.click();
  // };

  // const loadProject = (event) => {
  //   const file = event.target.files[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onload = (e) => {
  //       try {
  //         const project = JSON.parse(e.target.result);
  //         setHtmlContent(project.html || "");
  //         setCssContent(project.css || "");
  //         setConfigContent(project.config || "");
  //       } catch (error) {
  //         console.error("Error loading project:", error);
  //       }
  //     };
  //     reader.readAsText(file);
  //   }
  // };
  const saveProject = async () => {
    try {
      const project = {
        html: htmlContent,
        css: cssContent,
        config: configContent,
      };
      const filePath = await save({
        filters: [
          {
            name: "JSON",
            extensions: ["json"],
          },
        ],
      });
      if (filePath) {
        await writeTextFile(filePath, JSON.stringify(project));
        console.log("Project saved successfully");
      }
    } catch (error) {
      console.error("Failed to save project:", error);
    }
  };

  const loadProject = async () => {
    try {
      const selected = await open({
        filters: [
          {
            name: "JSON",
            extensions: ["json"],
          },
        ],
      });
      if (selected) {
        const contents = await readTextFile(selected);
        const project = JSON.parse(contents);
        setHtmlContent(project.html || "");
        setCssContent(project.css || "");
        setConfigContent(project.config || "");
        console.log("Project loaded successfully");
      }
    } catch (error) {
      console.error("Failed to load project:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <div className="flex-none bg-gray-800 p-2 flex items-center justify-between">
        <h1 className="text-xl font-bold">HTML & Tailwind Playground</h1>
        <div className="flex space-x-2">
          <button
            onClick={saveProject}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
          >
            <FaSave className="inline mr-1" /> Save
          </button>
          <label className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors duration-200 cursor-pointer">
            <FaUpload className="inline mr-1" /> Load
            <input
              type="file"
              onChange={loadProject}
              className="hidden"
              accept=".json"
            />
          </label>
          <button
            onClick={toggleFullScreen}
            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors duration-200"
          >
            {isFullScreen ? (
              <FaCompress className="inline" />
            ) : (
              <FaExpand className="inline" />
            )}
          </button>
        </div>
      </div>
      <div className="flex-grow flex flex-col">
        <div className="flex-none bg-gray-800 flex">
          <TabButton
            icon={FaHtml5}
            label="HTML"
            isActive={activeTab === "HTML"}
            onClick={() => setActiveTab("HTML")}
          />
          <TabButton
            icon={FaCss3Alt}
            label="CSS"
            isActive={activeTab === "CSS"}
            onClick={() => setActiveTab("CSS")}
          />
          <TabButton
            icon={FaCog}
            label="Config"
            isActive={activeTab === "Config"}
            onClick={() => setActiveTab("Config")}
          />
        </div>
        <Split
          className="flex-grow flex"
          sizes={[50, 50]}
          minSize={100}
          expandToMin={false}
          gutterSize={10}
          gutterAlign="center"
          snapOffset={30}
          dragInterval={1}
        >
          <div className="h-full overflow-auto">
            <div className={`h-full ${activeTab !== "HTML" && "hidden"}`}>
              <CodeMirror
                value={htmlContent}
                height="100%"
                theme={oneDark}
                extensions={[html()]}
                onChange={(value) => setHtmlContent(value)}
              />
            </div>
            <div className={`h-full ${activeTab !== "CSS" && "hidden"}`}>
              <CodeMirror
                value={cssContent}
                height="100%"
                theme={oneDark}
                extensions={[css()]}
                onChange={(value) => setCssContent(value)}
              />
            </div>
            <div className={`h-full ${activeTab !== "Config" && "hidden"}`}>
              <CodeMirror
                value={configContent}
                height="100%"
                theme={oneDark}
                extensions={[javascript()]}
                onChange={(value) => setConfigContent(value)}
              />
            </div>
          </div>
          <div className="flex flex-col h-full">
            <div className="flex-none bg-gray-800 p-2">
              <h2 className="font-bold">Preview</h2>
            </div>
            <div className="flex-grow bg-white">
              <iframe
                title="preview"
                srcDoc={preview}
                className="w-full h-full border-none"
                sandbox="allow-scripts"
              />
            </div>
          </div>
        </Split>
      </div>
    </div>
  );
}
