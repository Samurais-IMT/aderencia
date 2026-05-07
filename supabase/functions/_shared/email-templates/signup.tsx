/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface SignupEmailProps {
  token: string
}

export const SignupEmail = ({ token }: SignupEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Seu código de verificação</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Verificação de cadastro</Heading>
        <Text style={text}>Olá,</Text>
        <Text style={text}>Seja bem-vindo(a)! 👋</Text>
        <Text style={text}>
          Para concluir seu cadastro, utilize o código abaixo:
        </Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={text}>
          Se você não solicitou o cadastro, pode ignorar este e-mail.
        </Text>
        <Text style={text}>
          Se precisar de ajuda, estamos à disposição.
        </Text>
        <Text style={footer}>
          Atenciosamente,{'\n'}Equipe UNO Soluções
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

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
const codeStyle = {
  fontFamily: 'Courier, monospace',
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: 'hsl(14, 100%, 57%)',
  margin: '0 0 30px',
}
const footer = {
  fontSize: '12px',
  color: '#999999',
  margin: '30px 0 0',
  whiteSpace: 'pre-line' as const,
}
