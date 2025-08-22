// services/data.models.ts
export interface PolicyData {
  id: number;
  title: string;
  type: 'General' | 'Privacy' | 'Equity' | 'Rights' | 'Ethics';
  status: 'Active' | 'Draft' | 'Review';
  lastUpdated: string;
  jurisdiction: 'Local' | 'State' | 'National' | 'International';
}

export interface EducationData {
  id: number;
  institution: string;
  enrollment: number;
  aiAdoption: number; // percentage
  budget: number;
  region: string;
}

// Simplified flexible model
export interface FlexibleColumn {
  id: string;
  name: string;
  type: string;
  format: {
    type: string;
    isArray: boolean;
    [key: string]: any; // Allow additional format properties
  };
  [key: string]: any; // Allow additional column properties
}

export interface FlexibleRow {
  id: string;
  name: string;
  index: number;
  values: Record<string, any>; // Flexible key-value pairs
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any; // Allow additional row properties
}

export interface FlexibleTableData {
  columns: FlexibleColumn[];
  rows: FlexibleRow[];
}
