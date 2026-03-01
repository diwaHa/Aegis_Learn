"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Download, Eye, EyeOff, Check } from "lucide-react";
import { validateA2UI, formatA2UI } from "@/lib/a2ui-validator";

interface A2UIPreviewProps {
  a2uiData: any;
  isVisible: boolean;
  onExport?: () => void;
  onCopy?: () => void;
}

export default function A2UIPreview({ a2uiData, isVisible, onExport, onCopy }: A2UIPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  if (!isVisible) return null;

  const validation = validateA2UI(a2uiData);
  const formattedA2UI = formatA2UI(a2uiData);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedA2UI);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.();
  };

  const handleExport = () => {
    const blob = new Blob([formattedA2UI], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'a2ui-definition.json';
    a.click();
    URL.revokeObjectURL(url);
    onExport?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-l-4 border-green-500/30 bg-gradient-to-r from-green-500/10 to-green-900/5 rounded-lg p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
            <span className="text-green-400 text-sm font-bold">A2UI</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-400">Live Preview</h3>
            <p className="text-xs text-muted-foreground">
              {validation.isValid ? '✅ Valid Schema' : '❌ Invalid Schema'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRaw(!showRaw)}
            className="text-xs"
          >
            {showRaw ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            {showRaw ? 'Hide' : 'Show'} JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={copied}
            className="text-xs"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleExport}
            className="text-xs bg-green-500 hover:bg-green-600"
          >
            <Download className="w-3 h-3" />
            Export
          </Button>
        </div>
      </div>

      {/* Validation Errors */}
      {!validation.isValid && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
          <h4 className="text-sm font-semibold text-red-400 mb-2">Validation Errors:</h4>
          <ul className="text-xs text-red-300 space-y-1">
            {validation.errors.map((error, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-red-400">•</span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visual Preview */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Visual Representation</h4>
          <div className="bg-black/30 rounded-lg p-4 min-h-[200px] flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-3">
                <span className="text-green-400 text-xs">UI</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {a2uiData.createSurface ? `Surface: ${a2uiData.createSurface.surfaceType}` : 'No Surface'}
              </p>
              {a2uiData.updateComponents && (
                <p className="text-xs text-muted-foreground mt-1">
                  {a2uiData.updateComponents.length} component(s) defined
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Raw JSON */}
        {showRaw && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Raw A2UI JSON</h4>
            <ScrollArea className="h-64 w-full">
              <pre className="text-xs font-mono bg-black/40 p-3 rounded border border-green-500/20 overflow-auto">
                {formattedA2UI}
              </pre>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Component Breakdown */}
      {a2uiData.updateComponents && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Component Breakdown</h4>
          <div className="space-y-2">
            {a2uiData.updateComponents.map((comp: any, index: number) => (
              <div key={comp.componentId || index} className="flex items-center gap-3 p-2 rounded bg-black/20 border border-green-500/10">
                <Badge variant="outline" className="text-xs">
                  {comp.componentType}
                </Badge>
                <span className="text-sm font-mono">{comp.componentId}</span>
                {comp.properties && (
                  <span className="text-xs text-muted-foreground">
                    {Object.keys(comp.properties).length} properties
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
