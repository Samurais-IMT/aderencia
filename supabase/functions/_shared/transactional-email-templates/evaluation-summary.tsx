/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "UNO Predict"

interface EvaluationSummaryProps {
  htmlContent?: string
  clientName?: string
  meetingDate?: string
}

const EvaluationSummaryEmail = ({ htmlContent, clientName, meetingDate }: EvaluationSummaryProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Resumo da Avaliação de Aderência{clientName ? ` - ${clientName}` : ''}</Preview>
    <Body style={main}>
      <Container style={container}>
        {htmlContent ? (
          <Section dangerouslySetInnerHTML={{ __html: htmlContent }} />
        ) : (
          <>
            <Heading style={h1}>Resumo da Avaliação</Heading>
            <Text style={text}>
              {clientName ? `Cliente: ${clientName}` : 'Avaliação de Aderência'}
            </Text>
            {meetingDate && <Text style={text}>Data: {meetingDate}</Text>}
          </>
        )}
        <Hr style={hr} />
        <Text style={footer}>
          Gerado automaticamente pelo {SITE_NAME}
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: EvaluationSummaryEmail,
  subject: (data: Record<string, any>) =>
    data.subject || `Avaliação de Aderência${data.clientName ? ` - ${data.clientName}` : ''}`,
  displayName: 'Resumo de avaliação',
  previewData: {
    clientName: 'Empresa Teste',
    meetingDate: '15/01/2026',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '20px 25px', maxWidth: '680px', margin: '0 auto' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#1a1a1a', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#555', lineHeight: '1.5', margin: '0 0 15px' }
const hr = { borderColor: '#e5e5e5', margin: '24px 0' }
const footer = { fontSize: '12px', color: '#999', textAlign: 'center' as const, margin: '0' }
