/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "UNO Predict"

interface VerificationTestProps {
  recipientName?: string
  sentAt?: string
}

const VerificationTestEmail = ({ recipientName, sentAt }: VerificationTestProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>E-mail de verificação do domínio notify.unosolucoes.com.br</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          {recipientName ? `Olá, ${recipientName}!` : 'E-mail de verificação'}
        </Heading>
        <Text style={text}>
          Este é um e-mail de teste enviado pelo {SITE_NAME} para confirmar que o
          domínio <strong>notify.unosolucoes.com.br</strong> está entregando corretamente.
        </Text>
        <Section style={badge}>
          <Text style={badgeText}>✓ Entrega confirmada</Text>
        </Section>
        {sentAt && (
          <Text style={meta}>Enviado em: {sentAt}</Text>
        )}
        <Hr style={hr} />
        <Text style={footer}>
          Se você recebeu este e-mail, sua infraestrutura de envio está operacional.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: VerificationTestEmail,
  subject: 'Teste de verificação - notify.unosolucoes.com.br',
  displayName: 'Teste de verificação de domínio',
  previewData: { recipientName: 'Equipe UNO', sentAt: new Date().toLocaleString('pt-BR') },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px 28px', maxWidth: '560px' }
const h1 = { fontSize: '22px', fontWeight: 'bold', color: '#000000', margin: '0 0 16px' }
const text = { fontSize: '14px', color: '#333333', lineHeight: '1.6', margin: '0 0 16px' }
const badge = { backgroundColor: '#fc984c', borderRadius: '6px', padding: '12px 16px', margin: '16px 0' }
const badgeText = { color: '#000000', fontWeight: 'bold', fontSize: '14px', margin: 0 }
const meta = { fontSize: '12px', color: '#666666', margin: '12px 0 0' }
const hr = { borderColor: '#eeeeee', margin: '24px 0' }
const footer = { fontSize: '12px', color: '#999999', margin: '0' }
