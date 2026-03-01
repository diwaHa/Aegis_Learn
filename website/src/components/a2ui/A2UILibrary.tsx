"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Layout, 
  FileInput, 
  MousePointer as ButtonIcon, 
  Heading, 
  Image, 
  Square as Card,
  Plus,
  Copy,
  Eye
} from "lucide-react";
import { formatA2UI } from "@/lib/a2ui-validator";

interface A2UILibraryProps {
  onInsertA2UI?: (a2ui: any) => void;
}

interface A2UITemplate {
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  a2ui: any;
}

interface A2UICategory {
  [key: string]: A2UITemplate;
}

export default function A2UILibrary({ onInsertA2UI }: A2UILibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState<"layout" | "form" | "content">("layout");

  const a2uiTemplates: Record<string, A2UICategory> = {
    layout: {
      container: {
        name: "Container Layout",
        description: "Basic container with flex layout",
        icon: Layout,
        a2ui: {
          createSurface: {
            surfaceId: "main-container",
            surfaceType: "container"
          },
          updateComponents: [
            {
              componentId: "container",
              componentType: "container",
              properties: {
                direction: "column",
                gap: "medium",
                padding: "large"
              }
            }
          ]
        }
      },
      grid: {
        name: "Grid Layout",
        description: "Responsive grid layout",
        icon: Layout,
        a2ui: {
          createSurface: {
            surfaceId: "grid-container",
            surfaceType: "container"
          },
          updateComponents: [
            {
              componentId: "grid",
              componentType: "container",
              properties: {
                direction: "row",
                wrap: "wrap",
                gap: "medium"
              }
            }
          ]
        }
      }
    },
    form: {
      contactForm: {
        name: "Contact Form",
        description: "Complete contact form with validation",
        icon: FileInput,
        a2ui: {
          createSurface: {
            surfaceId: "contact-form",
            surfaceType: "container"
          },
          updateComponents: [
            {
              componentId: "form-title",
              componentType: "heading",
              properties: {
                text: "Contact Us",
                level: 2
              }
            },
            {
              componentId: "name-input",
              componentType: "input",
              properties: {
                placeholder: "Enter your name",
                required: true,
                type: "text"
              }
            },
            {
              componentId: "email-input",
              componentType: "input",
              properties: {
                placeholder: "Enter your email",
                required: true,
                type: "email"
              }
            },
            {
              componentId: "submit-btn",
              componentType: "button",
              properties: {
                text: "Send Message",
                variant: "primary",
                onClick: "submitForm"
              }
            }
          ]
        }
      }
    },
    content: {
      hero: {
        name: "Hero Section",
        description: "Landing page hero with heading and CTA",
        icon: Heading,
        a2ui: {
          createSurface: {
            surfaceId: "hero-section",
            surfaceType: "container"
          },
          updateComponents: [
            {
              componentId: "hero-title",
              componentType: "heading",
              properties: {
                text: "Welcome to Our App",
                level: 1
              }
            },
            {
              componentId: "hero-cta",
              componentType: "button",
              properties: {
                text: "Get Started",
                variant: "primary"
              }
            }
          ]
        }
      }
    }
  };

  const categories = ["layout", "form", "content"] as const;

  const handleInsertTemplate = (template: A2UITemplate) => {
    onInsertA2UI?.(template.a2ui);
  };

  const handlePreviewTemplate = (template: A2UITemplate) => {
    console.log('Preview template:', template.name);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-l-4 border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-purple-900/5 rounded-lg p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
          <Plus className="w-4 h-4 text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-purple-400">A2UI Component Library</h3>
          <p className="text-xs text-muted-foreground">
            Pre-built templates for common UI patterns
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="text-xs capitalize"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Templates Grid */}
      <ScrollArea className="h-96 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(a2uiTemplates[selectedCategory]).map(([key, template]) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              className="border border-purple-500/20 rounded-lg p-4 bg-black/20 hover:bg-purple-500/5 transition-all cursor-pointer"
            >
              {/* Template Header */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <template.icon className="w-4 h-4 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-purple-300 truncate">{template.name}</h4>
                  <p className="text-xs text-muted-foreground truncate">{template.description}</p>
                </div>
              </div>

              {/* Template Preview */}
              <div className="mb-3">
                <ScrollArea className="h-20 w-full">
                  <pre className="text-xs font-mono bg-black/40 p-2 rounded overflow-auto">
                    {formatA2UI(template.a2ui).substring(0, 200)}
                    {formatA2UI(template.a2ui).length > 200 && '...'}
                  </pre>
                </ScrollArea>
              </div>

              {/* Template Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePreviewTemplate(template)}
                  className="text-xs flex-1"
                >
                  <Eye className="w-3 h-3" />
                  Preview
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleInsertTemplate(template)}
                  className="text-xs flex-1 bg-purple-500 hover:bg-purple-600"
                >
                  <Copy className="w-3 h-3" />
                  Use Template
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="mt-6 p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
        <p className="text-xs text-muted-foreground text-center">
          💡 <strong>Tip:</strong> Templates provide a starting point. Customize them in A2UI Editor to fit your specific needs.
        </p>
      </div>
    </motion.div>
  );
}
