/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface KPIBase {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  target: number;
  status: 'critical' | 'warning' | 'good';
  category: 'operational' | 'clinical' | 'satisfaction';
  history: { date: string; value: number }[];
}

export interface OperationalKPIs {
  waitingTime: KPIBase;
  workflowEfficiency: KPIBase;
  resourceUtilization: KPIBase;
}

export interface ClinicalKPIs {
  medicationErrors: KPIBase;
  treatmentAdherence: KPIBase;
  clinicalOutcomes: KPIBase;
}

export interface SatisfactionKPIs {
  surveyScore: KPIBase;
  serviceResponsiveness: KPIBase;
  engagement: KPIBase;
}

export interface DashboardData {
  operational: OperationalKPIs;
  clinical: ClinicalKPIs;
  satisfaction: SatisfactionKPIs;
  lastUpdated: string;
}

export interface AIInsight {
  id: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'alert';
  actionable: boolean;
  category: string;
}
