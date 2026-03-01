import React from 'react';
import { validateA2UI } from './a2ui-validator';

export interface A2UIAction {
  type: 'click' | 'change' | 'submit';
  componentId: string;
  data?: any;
}

export default function A2UIRenderer({ data, onAction, className }: any) {
  if (!data) return null;

  const validation = validateA2UI(data);
  if (!validation.isValid) {
    return React.createElement('div', {
      className: `p-4 border border-red-500/30 bg-red-500/10 rounded-lg ${className || ''}`
    }, [
      React.createElement('h3', { className: 'text-lg font-semibold text-red-400 mb-2' }, 'A2UI Validation Error'),
      React.createElement('div', { className: 'space-y-2' }, 
        validation.errors.map((error: string, index: number) =>
          React.createElement('div', { key: index, className: 'flex items-center gap-2 text-sm text-red-300' }, [
            React.createElement('span', { className: 'w-2 h-2 rounded-full bg-red-500/20 flex items-center justify-center' },
              React.createElement('span', { className: 'text-xs font-bold' }, '!')
            ),
            React.createElement('span', null, error)
          ])
        )
      )
    ]);
  }

  const renderComponent = (component: any): any => {
    const { componentId, componentType, properties, children } = component;
    
    switch (componentType) {
      case 'heading':
        const level = properties?.level || 1;
        const Tag = `h${level}` as any;
        return React.createElement(Tag, {
          className: properties?.className,
          style: properties?.style
        }, properties?.text || 'Heading');
      
      case 'text':
        return React.createElement('p', {
          className: properties?.className,
          style: properties?.style
        }, properties?.content || 'Text content');
      
      case 'button':
        return React.createElement('button', {
          className: `px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${properties?.className || ''}`,
          style: properties?.style,
          onClick: () => {
            const action: A2UIAction = {
              type: 'click',
              componentId,
              data: properties?.onClick
            };
            onAction?.(action);
          }
        }, properties?.text || 'Button');
      
      case 'input':
        return React.createElement('input', {
          type: properties?.type || 'text',
          placeholder: properties?.placeholder,
          required: properties?.required,
          className: `px-3 py-2 border rounded ${properties?.className || ''}`,
          style: properties?.style,
          onChange: (e: any) => {
            const action: A2UIAction = {
              type: 'change',
              componentId,
              data: { value: e.target.value }
            };
            onAction?.(action);
          }
        });
      
      case 'container':
        const direction = properties?.direction || 'column';
        const gap = properties?.gap || 'medium';
        const containerClass = `flex ${direction === 'row' ? 'flex-row' : 'flex-col'} gap-${gap} ${properties?.className || ''}`;
        
        return React.createElement('div', {
          className: containerClass,
          style: properties?.style
        }, children?.map((child: any, index: number) =>
          React.createElement('div', { key: index }, renderComponent(child))
        ));
      
      default:
        return React.createElement('div', {
          className: `p-4 border border-gray-300 rounded ${properties?.className || ''}`,
          style: properties?.style
        }, [
          React.createElement('div', { className: 'text-sm text-gray-600' }, `Unknown component type: ${componentType}`),
          React.createElement('pre', { 
            className: 'text-xs bg-gray-100 p-2 mt-2 rounded overflow-auto' 
          }, JSON.stringify(component, null, 2))
        ]);
    }
  };

  const renderA2UI = (): any => {
    if (!data.createSurface) {
      return React.createElement('div', null, 'No surface defined');
    }

    const { surfaceId, surfaceType } = data.createSurface;
    const surfaceClass = `a2ui-surface a2ui-surface-${surfaceType} ${className || ''}`;

    return React.createElement('div', {
      className: surfaceClass,
      style: data.createSurface?.style
    }, data.updateComponents?.map((component: any, index: number) =>
      React.createElement('div', { 
        key: component.componentId || index, 
        className: 'a2ui-component' 
      }, renderComponent(component))
    ));
  };

  return React.createElement('div', {
    className: 'a2ui-renderer'
  }, renderA2UI());
}
