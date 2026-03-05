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
  aiAdoption: number;
  budget: number;
  region: string;
}

export interface FlexibleColumn {
  name: string;
  format: {
    type: string;
    isArray: boolean;
    options?: string[];
  };
}

export interface FlexibleRow {
  id: string;
  name: string;
  index: number;
  values: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface FlexibleTableData {
  columns: FlexibleColumn[];
  rows: FlexibleRow[];
}
