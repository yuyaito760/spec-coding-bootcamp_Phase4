"use client";

import { Sandpack } from "@codesandbox/sandpack-react";

interface CodeRunnerProps {
  code: string;
  language: string;
}

export function CodeRunner({ code, language }: CodeRunnerProps) {
  const isReact = language === "tsx" || language === "jsx";
  const template = isReact ? "react-ts" : "vanilla-ts";
  const fileName = isReact ? "/App.tsx" : "/index.ts";

  return (
    <div className="mt-2 rounded-lg overflow-hidden">
      <Sandpack
        theme="dark"
        template={template}
        files={{ [fileName]: code }}
        options={{ showNavigator: false, showTabs: false, editorHeight: 300 }}
      />
    </div>
  );
}
