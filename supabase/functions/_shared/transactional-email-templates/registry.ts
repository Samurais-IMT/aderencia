/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as evaluationSummary } from './evaluation-summary.tsx'
import { template as verificationTest } from './verification-test.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'evaluation-summary': evaluationSummary,
  'verification-test': verificationTest,
}
