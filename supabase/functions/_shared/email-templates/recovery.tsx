/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
}: RecoveryEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Redefinição de Senha</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Redefinição de Senha</Heading>
        <Text style={text}>Olá,</Text>
        <Text style={text}>
          Recebemos uma solicitação para redefinir sua senha.
        </Text>
        <Text style={text}>Para continuar, clique no botão abaixo:</Text>
        <Button style={button} href={confirmationUrl}>
          👉 Redefinir Senha
        </Button>
        <Text style={text}>
          Se você não solicitou essa alteração, pode ignorar este e-mail com segurança.
        </Text>
        <Text style={text}>
          Por motivos de segurança, este link pode expirar em breve.
        </Text>
        <Text style={footer}>
          Atenciosamente,{'\n'}Equipe UNO Soluções
        </Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '20px 25px' }
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#262626',
  margin: '0 0 20px',
}
const text = {
  fontSize: '14px',
  color: '#737373',
  lineHeight: '1.5',
  margin: '0 0 16px',
}
const button = {
  backgroundColor: 'hsl(14, 100%, 57%)',
  color: '#ffffff',
  fontSize: '14px',
  borderRadius: '0.75rem',
  padding: '12px 20px',
  textDecoration: 'none',
}
const footer = {
  fontSize: '12px',
  color: '#999999',
  margin: '30px 0 0',
  whiteSpace: 'pre-line' as const,
}
