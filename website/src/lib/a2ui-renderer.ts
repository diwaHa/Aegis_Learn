import React from 'react';
import { validateA2UI } from './a2ui-validator';

export interface A2UIAction {
  type: 'click' | 'change' | 'submit';
  componentId: string;
  data?: any;
}

export default function A2UIRenderer({ data, onAction, className }: any) {
  if (!data || !Array.isArray(data)) return null;

  // Parse A2UI messages to extract surface and components
  let createSurface = null;
  let updateComponents = null;
  let beginRendering = null;

  for (const message of data) {
    if (message.createSurface) {
      createSurface = message.createSurface;
    }
    if (message.updateComponents) {
      updateComponents = message.updateComponents;
    }
    if (message.beginRendering) {
      beginRendering = message.beginRendering;
    }
  }

  if (!createSurface) {
    return React.createElement('div', null, 'No surface defined');
  }

  const { surfaceId } = createSurface;
  const surfaceClass = `a2ui-surface a2ui-surface-${surfaceId} ${className || ''}`;

  const renderComponent = (component: any): any => {
    const { id, component: componentData } = component;
    
    if (!componentData) {
      return React.createElement('div', { key: id }, 'Empty component');
    }
    
    // Handle different component types
    const componentType = Object.keys(componentData)[0];
    const properties = componentData[componentType];
    
    switch (componentType) {
      case 'Button':
        return React.createElement('button', {
          key: id,
          className: `px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors`,
          onClick: () => {
            const action: A2UIAction = {
              type: 'click',
              componentId: id,
              data: properties
            };
            onAction?.(action);
          }
        }, properties.label?.literalString || 'Button');
      
      case 'TextField':
        return React.createElement('input', {
          key: id,
          type: 'text',
          placeholder: properties.placeholder?.literalString || '',
          className: `px-3 py-2 border rounded ${properties.className || ''}`,
          onChange: (e: any) => {
            const action: A2UIAction = {
              type: 'change',
              componentId: id,
              data: { value: e.target.value }
            };
            onAction?.(action);
          }
        });
      
      case 'Text':
        return React.createElement('p', {
          key: id,
          className: properties.className || ''
        }, properties.text?.literalString || 'Text content');
      
      case 'Column':
        const children = properties.children?.explicitList || [];
        return React.createElement('div', {
          key: id,
          className: `flex flex-col gap-2 ${properties.className || ''}`
        }, children.map((childId: string) => {
          const childComponent = updateComponents?.components?.find((c: any) => c.id === childId);
          return childComponent ? renderComponent(childComponent) : null;
        }));
      
      case 'Row':
        const rowChildren = properties.children?.explicitList || [];
        return React.createElement('div', {
          key: id,
          className: `flex flex-row gap-2 ${properties.className || ''}`
        }, rowChildren.map((childId: string) => {
          const childComponent = updateComponents?.components?.find((c: any) => c.id === childId);
          return childComponent ? renderComponent(childComponent) : null;
        }));
      
      default:
        return React.createElement('div', {
          key: id,
          className: `p-4 border border-gray-300 rounded ${properties.className || ''}`
        }, [
          React.createElement('div', { key: 'unknown-type', className: 'text-sm text-gray-600' }, `Unknown component type: ${componentType}`),
          React.createElement('pre', { 
            key: 'component-debug',
            className: 'text-xs bg-gray-100 p-2 mt-2 rounded overflow-auto' 
          }, JSON.stringify(component, null, 2))
        ]);
    }
  };

  return React.createElement('div', {
    className: surfaceClass,
    style: createSurface?.style
  }, updateComponents?.components?.map((component: any, index: number) =>
    React.createElement('div', { 
      key: component.id || index, 
      className: 'a2ui-component' 
    }, renderComponent(component))
  ));
}
