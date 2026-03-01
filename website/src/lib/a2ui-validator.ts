export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateA2UI(data: any): ValidationResult {
  const errors: string[] = [];
  
  // Check if data is an object
  if (!data || typeof data !== 'object') {
    errors.push("A2UI data must be a valid object");
    return { isValid: false, errors };
  }
  
  // Check for required top-level properties
  if (!data.createSurface && !data.updateComponents && !data.updateDataModel && !data.deleteSurface) {
    errors.push("A2UI must have at least one of: createSurface, updateComponents, updateDataModel, deleteSurface");
  }
  
  // Validate createSurface
  if (data.createSurface) {
    if (!data.createSurface.surfaceId) {
      errors.push("createSurface missing required surfaceId");
    }
    if (!data.createSurface.surfaceType) {
      errors.push("createSurface missing required surfaceType");
    }
  }
  
  // Validate updateComponents
  if (data.updateComponents) {
    if (!Array.isArray(data.updateComponents)) {
      errors.push("updateComponents must be an array");
    } else {
      data.updateComponents.forEach((comp: any, index: number) => {
        if (!comp.componentId) {
          errors.push(`Component ${index}: Missing componentId`);
        }
        if (!comp.componentType) {
          errors.push(`Component ${index}: Missing componentType`);
        }
        if (!comp.properties) {
          errors.push(`Component ${index}: Missing properties`);
        }
      });
    }
  }
  
  // Validate updateDataModel
  if (data.updateDataModel) {
    if (!data.updateDataModel.data) {
      errors.push("updateDataModel missing required data");
    }
    if (!data.updateDataModel.surfaceId) {
      errors.push("updateDataModel missing required surfaceId");
    }
  }
  
  // Validate deleteSurface
  if (data.deleteSurface) {
    if (!data.deleteSurface.surfaceId) {
      errors.push("deleteSurface missing required surfaceId");
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function formatA2UI(data: any): string {
  return JSON.stringify(data, null, 2);
}

export function parseA2UI(jsonString: string): any {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    throw new Error(`Invalid A2UI JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
