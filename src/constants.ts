/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DashboardData } from "./types";

export const INITIAL_DATA: DashboardData = {
  operational: {
    waitingTime: {
      id: 'op-1',
      name: 'Patient Waiting Time',
      value: 12,
      unit: 'min',
      trend: 'down',
      target: 10,
      status: 'warning',
      category: 'operational',
      history: [
        { date: '2026-04-12', value: 15 },
        { date: '2026-04-13', value: 14 },
        { date: '2026-04-14', value: 16 },
        { date: '2026-04-15', value: 14 },
        { date: '2026-04-16', value: 13 },
        { date: '2026-04-17', value: 12 },
        { date: '2026-04-18', value: 12 },
      ]
    },
    workflowEfficiency: {
      id: 'op-2',
      name: 'Workflow Efficiency',
      value: 88,
      unit: '%',
      trend: 'up',
      target: 90,
      status: 'good',
      category: 'operational',
      history: [
        { date: '2026-04-12', value: 82 },
        { date: '2026-04-13', value: 84 },
        { date: '2026-04-14', value: 85 },
        { date: '2026-04-15', value: 86 },
        { date: '2026-04-16', value: 87 },
        { date: '2026-04-17', value: 88 },
        { date: '2026-04-18', value: 88 },
      ]
    },
    resourceUtilization: {
      id: 'op-3',
      name: 'Resource Utilization',
      value: 75,
      unit: '%',
      trend: 'stable',
      target: 80,
      status: 'good',
      category: 'operational',
      history: [
        { date: '2026-04-12', value: 74 },
        { date: '2026-04-13', value: 75 },
        { date: '2026-04-14', value: 76 },
        { date: '2026-04-15', value: 75 },
        { date: '2026-04-16', value: 75 },
        { date: '2026-04-17', value: 75 },
        { date: '2026-04-18', value: 75 },
      ]
    }
  },
  clinical: {
    medicationErrors: {
      id: 'cl-1',
      name: 'Medication Error Rate',
      value: 0.2,
      unit: '%',
      trend: 'down',
      target: 0.1,
      status: 'warning',
      category: 'clinical',
      history: [
        { date: '2026-04-12', value: 0.5 },
        { date: '2026-04-13', value: 0.4 },
        { date: '2026-04-14', value: 0.4 },
        { date: '2026-04-15', value: 0.3 },
        { date: '2026-04-16', value: 0.3 },
        { date: '2026-04-17', value: 0.2 },
        { date: '2026-04-18', value: 0.2 },
      ]
    },
    treatmentAdherence: {
      id: 'cl-2',
      name: 'Treatment Adherence',
      value: 92,
      unit: '%',
      trend: 'up',
      target: 95,
      status: 'good',
      category: 'clinical',
      history: [
        { date: '2026-04-12', value: 88 },
        { date: '2026-04-13', value: 89 },
        { date: '2026-04-14', value: 90 },
        { date: '2026-04-15', value: 91 },
        { date: '2026-04-16', value: 91 },
        { date: '2026-04-17', value: 92 },
        { date: '2026-04-18', value: 92 },
      ]
    },
    clinicalOutcomes: {
      id: 'cl-3',
      name: 'Clinical Outcome Score',
      value: 85,
      unit: '/100',
      trend: 'stable',
      target: 90,
      status: 'warning',
      category: 'clinical',
      history: [
        { date: '2026-04-12', value: 84 },
        { date: '2026-04-13', value: 84 },
        { date: '2026-04-14', value: 85 },
        { date: '2026-04-15', value: 85 },
        { date: '2026-04-16', value: 85 },
        { date: '2026-04-17', value: 85 },
        { date: '2026-04-18', value: 85 },
      ]
    }
  },
  satisfaction: {
    surveyScore: {
      id: 'sa-1',
      name: 'Patient Survey Score',
      value: 4.2,
      unit: '/5',
      trend: 'up',
      target: 4.5,
      status: 'good',
      category: 'satisfaction',
      history: [
        { date: '2026-04-12', value: 3.8 },
        { date: '2026-04-13', value: 3.9 },
        { date: '2026-04-14', value: 4.0 },
        { date: '2026-04-15', value: 4.1 },
        { date: '2026-04-16', value: 4.1 },
        { date: '2026-04-17', value: 4.2 },
        { date: '2026-04-18', value: 4.2 },
      ]
    },
    serviceResponsiveness: {
      id: 'sa-2',
      name: 'Service Responsiveness',
      value: 7.8,
      unit: '/10',
      trend: 'stable',
      target: 8.5,
      status: 'warning',
      category: 'satisfaction',
      history: [
        { date: '2026-04-12', value: 7.5 },
        { date: '2026-04-13', value: 7.6 },
        { date: '2026-04-14', value: 7.6 },
        { date: '2026-04-15', value: 7.7 },
        { date: '2026-04-16', value: 7.8 },
        { date: '2026-04-17', value: 7.8 },
        { date: '2026-04-18', value: 7.8 },
      ]
    },
    engagement: {
      id: 'sa-3',
      name: 'Patient Engagement',
      value: 65,
      unit: '%',
      trend: 'up',
      target: 75,
      status: 'warning',
      category: 'satisfaction',
      history: [
        { date: '2026-04-12', value: 60 },
        { date: '2026-04-13', value: 61 },
        { date: '2026-04-14', value: 62 },
        { date: '2026-04-15', value: 63 },
        { date: '2026-04-16', value: 64 },
        { date: '2026-04-17', value: 65 },
        { date: '2026-04-18', value: 65 },
      ]
    }
  },
  lastUpdated: new Date().toISOString()
};
