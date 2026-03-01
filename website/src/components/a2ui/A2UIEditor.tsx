"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Save, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Trash2,
  Copy,
  Download
} from "lucide-react";
import { validateA2UI, formatA2UI, parseA2UI, ValidationResult } from "@/lib/a2ui-validator";

interface A2UIEditorProps {
  initialA2UI?: any;
  onA2UIChange?: (a2ui: any) => void;
  onSave?: (a2ui: any) => void;
  readOnly?: boolean;
}

export default function A2UIEditor({ 
  initialA2UI = "{}", 
  onA2UIChange, 
  onSave,
  readOnly = false 
}: A2UIEditorProps) {
  const [a2uiCode, setA2uiCode] = useState(formatA2UI(initialA2UI));
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true, errors: [] });
  const [activeTab, setActiveTab] = useState("edit");

  useEffect(() => {
    try {
      const parsed = parseA2UI(a2uiCode);
      const validation = validateA2UI(parsed);
      setValidation(validation);
      onA2UIChange?.(parsed);
    } catch (error) {
      setValidation({ isValid: false, errors: ['Invalid JSON: ' + (error instanceof Error ? error.message : 'Unknown error')] });
      onA2UIChange?.(null);
    }
  }, [a2uiCode, onA2UIChange]);

  const handleFormat = () => {
    try {
      const parsed = parseA2UI(a2uiCode);
      setA2uiCode(formatA2UI(parsed));
    } catch (error) {
      console.error('Cannot format invalid JSON:', error);
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setA2uiCode(content);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleExport = () => {
    const blob = new Blob([a2uiCode], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'a2ui-definition.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(a2uiCode);
  };

  const insertTemplate = (template: any) => {
    setA2uiCode(formatA2UI(template));
  };

  const templates = {
    createSurface: {
      createSurface: {
        surfaceId: "main-container",
        surfaceType: "container"
      }
    },
    addHeading: {
      updateComponents: [
        {
          componentId: "main-title",
          componentType: "heading",
          properties: {
            text: "Welcome to A2UI",
            level: 1
          }
        }
      ]
    },
    addInput: {
      updateComponents: [
        {
          componentId: "user-input",
          componentType: "input",
          properties: {
            placeholder: "Enter your text",
            required: true
          }
        }
      ]
    },
    addButton: {
      updateComponents: [
        {
          componentId: "submit-btn",
          componentType: "button",
          properties: {
            text: "Submit",
            variant: "primary"
          }
        }
      ]
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-l-4 border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-blue-900/5 rounded-lg p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <FileText className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-400">A2UI Editor</h3>
            <p className="text-xs text-muted-foreground">
              {validation.isValid ? '✅ Valid JSON' : '❌ Invalid JSON'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleFormat}
            disabled={readOnly}
            className="text-xs"
          >
            Format
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleImport}
            disabled={readOnly}
            className="text-xs"
          >
            <Upload className="w-3 h-3" />
            Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="text-xs"
          >
            <Download className="w-3 h-3" />
            Export
          </Button>
          {onSave && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onSave?.(parseA2UI(a2uiCode))}
              disabled={!validation.isValid || readOnly}
              className="text-xs bg-blue-500 hover:bg-blue-600"
            >
              <Save className="w-3 h-3" />
              Save
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="edit" className="text-xs">Editor</TabsTrigger>
          <TabsTrigger value="templates" className="text-xs">Templates</TabsTrigger>
          <TabsTrigger value="validation" className="text-xs">Validation</TabsTrigger>
        </TabsList>

        {/* Editor Tab */}
        <TabsContent value="edit" className="mt-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Copy className="w-3 h-3" />
              <span>Click outside editor to lose focus • Ctrl+S to save</span>
            </div>
            <ScrollArea className="h-96 w-full">
              <textarea
                value={a2uiCode}
                onChange={(e) => setA2uiCode(e.target.value)}
                readOnly={readOnly}
                className="w-full h-96 p-4 font-mono text-sm bg-black/40 border border-blue-500/20 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                placeholder="Enter your A2UI JSON here..."
                spellCheck={false}
              />
            </ScrollArea>
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="mt-4">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Quick templates for common A2UI patterns. Click to insert into editor.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(templates).map(([key, template]) => (
                <div key={key} className="border border-blue-500/20 rounded-lg p-4">
                  <h4 className="text-sm font-medium mb-2 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                  <ScrollArea className="h-24 w-full">
                    <pre className="text-xs font-mono bg-black/30 p-2 rounded overflow-auto">
                      {formatA2UI(template)}
                    </pre>
                  </ScrollArea>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => insertTemplate(template)}
                    disabled={readOnly}
                    className="mt-2 text-xs w-full"
                  >
                    <Plus className="w-3 h-3" />
                    Insert Template
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Validation Tab */}
        <TabsContent value="validation" className="mt-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              {validation.isValid ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400" />
              )}
              <h4 className="text-sm font-medium">
                {validation.isValid ? 'A2UI Schema Valid' : 'A2UI Schema Invalid'}
              </h4>
            </div>
            
            {validation.errors.length > 0 && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                <h5 className="text-sm font-semibold text-red-400 mb-3">Validation Errors:</h5>
                <ScrollArea className="h-32 w-full">
                  <ul className="text-xs text-red-300 space-y-2">
                    {validation.errors.map((error, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-red-400 mt-0.5">•</span>
                        <span>{error}</span>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </div>
            )}
            
            {validation.isValid && (
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <h5 className="text-sm font-semibold text-green-400 mb-2">✅ Schema Validation Passed</h5>
                <p className="text-xs text-green-300">
                  Your A2UI definition follows the correct schema structure and is ready for rendering.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
