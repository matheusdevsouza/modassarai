import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { generateEmailTemplate } from './email-templates';
function loadEnvFile(filePath: string) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          let value = valueParts.join('=').trim();
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
          }
          process.env[key.trim()] = value;
        }
      }
    }
  }
}
if (!process.env.SMTP_HOST) {
  loadEnvFile('.env.local');
  loadEnvFile('.env');
}
const createTransporter = () => {
  const config = {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
      ciphers: 'SSLv3'
    }
  };
  return nodemailer.createTransport(config);
};
const saveEmailToFile = async (mailOptions: any) => {
  try {
    const emailDir = path.join(process.cwd(), 'temp_emails');
    if (!fs.existsSync(emailDir)) {
      fs.mkdirSync(emailDir, { recursive: true });
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `email-${timestamp}.html`;
    const filepath = path.join(emailDir, filename);
    const emailContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Email Debug - ${mailOptions.subject}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .header { background: #f0f0f0; padding: 10px; border-radius: 5px; margin-bottom: 20px; }
    .content { border: 1px solid #ddd; padding: 20px; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="header">
    <h3>Email Debug Information</h3>
    <p><strong>To:</strong> ${mailOptions.to}</p>
    <p><strong>From:</strong> ${mailOptions.from}</p>
    <p><strong>Subject:</strong> ${mailOptions.subject}</p>
    <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
  </div>
  <div class="content">
    ${mailOptions.html}
  </div>
</body>
</html>`;
    fs.writeFileSync(filepath, emailContent);
    return true;
  } catch (error) {

    return false;
  }
};
export interface VerificationEmailData {
  email: string;
  name: string;
  verificationToken: string;
}
export interface PasswordResetEmailData {
  email: string;
  name: string;
  resetToken: string;
}
export interface TrackingEmailData {
  email: string;
  name: string;
  orderNumber: string;
  trackingCode: string;
  trackingUrl: string;
  shippingCompany: string;
}
export interface PaymentConfirmationEmailData {
  email: string;
  name: string;
  orderNumber: string;
  totalAmount: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}
export interface OrderShippedEmailData {
  email: string;
  name: string;
  orderNumber: string;
  trackingCode: string;
  trackingUrl: string;
  shippingCompany: string;
  estimatedDelivery: string;
}
export interface TwoFactorCodeEmailData {
  email: string;
  name: string;
  code: string;
}
export async function sendVerificationEmail(data: VerificationEmailData): Promise<void> {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verificar-email?token=${data.verificationToken}`;
  const html = generateEmailTemplate({
    title: 'Verifique sua conta',
    greeting: 'Olá',
    name: data.name,
    content: `
      <p style="margin: 0 0 16px 0;">Obrigado por se cadastrar na <strong style="color: #0F4024;">Modas Saraí</strong>! Estamos muito felizes em tê-lo(a) conosco.</p>
      <p style="margin: 0;">Para ativar sua conta e começar a aproveitar todos os benefícios, clique no botão abaixo para verificar seu endereço de e-mail.</p>
    `,
    buttonText: 'Verificar E-mail',
    buttonUrl: verificationUrl,
    expiryTime: '24 horas',
    footerNote: 'Se você não criou uma conta na Modas Saraí, pode ignorar este e-mail com segurança.',
  });
  const mailOptions = {
    from: `"Modas Saraí" <${process.env.SMTP_FROM || process.env.EMAIL_FROM}>`,
    to: data.email,
    subject: "Verifique sua conta - Modas Saraí",
    html,
  };
  try {
    const transporter = createTransporter();
    await transporter.verify();
    await transporter.sendMail(mailOptions);
  } catch (error) {
    await saveEmailToFile(mailOptions);
  }
}
export async function sendPasswordResetEmail(data: PasswordResetEmailData): Promise<void> {
  const transporter = createTransporter();
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/redefinir-senha?token=${data.resetToken}`;
  const html = generateEmailTemplate({
    title: 'Redefinir Senha',
    greeting: 'Olá',
    name: data.name,
    content: `
      <p style="margin: 0 0 16px 0;">Recebemos uma solicitação para redefinir a senha da sua conta na <strong style="color: #0F4024;">Modas Saraí</strong>.</p>
      <p style="margin: 0;">Clique no botão abaixo para criar uma nova senha segura.</p>
    `,
    buttonText: 'Redefinir Senha',
    buttonUrl: resetUrl,
    expiryTime: '1 hora',
    footerNote: 'Se você não solicitou a redefinição de senha, pode ignorar este e-mail com segurança. Sua senha permanecerá inalterada.',
  });
  const mailOptions = {
    from: `"Modas Saraí" <${process.env.SMTP_FROM || process.env.EMAIL_FROM}>`,
    to: data.email,
    subject: "Redefinir Senha - Modas Saraí",
    html,
  };
  await transporter.sendMail(mailOptions);
}
export async function sendTrackingEmail(data: TrackingEmailData): Promise<void> {
  const transporter = createTransporter();
  const trackingInfoHtml = `
    <div style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-left: 4px solid #D4AF37; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h3 style="margin: 0 0 16px 0; color: #1F2937; font-size: 18px; font-weight: 600;">Informações do Pedido</h3>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="padding: 10px 0; color: #4B5563; font-size: 14px;"><strong style="color: #1F2937;">Número do Pedido:</strong></td>
          <td align="right" style="padding: 10px 0; color: #1F2937; font-size: 14px; font-weight: 600;">${data.orderNumber}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #4B5563; font-size: 14px;"><strong style="color: #1F2937;">Código de Rastreamento:</strong></td>
          <td align="right" style="padding: 10px 0; color: #1F2937; font-size: 14px; font-family: 'Courier New', monospace;">${data.trackingCode}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #4B5563; font-size: 14px;"><strong style="color: #1F2937;">Transportadora:</strong></td>
          <td align="right" style="padding: 10px 0; color: #1F2937; font-size: 14px;">${data.shippingCompany}</td>
        </tr>
      </table>
    </div>
  `;
  const html = generateEmailTemplate({
    title: 'Seu pedido foi enviado',
    greeting: 'Olá',
    name: data.name,
    content: `
      <p style="margin: 0 0 16px 0;">Ótimas notícias! Seu pedido foi <strong style="color: #D4AF37;">enviado com sucesso</strong> e está a caminho da sua casa.</p>
      ${trackingInfoHtml}
      <p style="margin: 20px 0 0 0;">Você também pode acompanhar seu pedido acessando sua conta em nosso site.</p>
    `,
    buttonText: 'Rastrear Pedido',
    buttonUrl: data.trackingUrl,
  });
  const mailOptions = {
    from: `"Modas Saraí" <${process.env.SMTP_FROM || process.env.EMAIL_FROM}>`,
    to: data.email,
    subject: `Rastreamento do Pedido ${data.orderNumber} - Modas Saraí`,
    html,
  };
  await transporter.sendMail(mailOptions);
}
export async function sendPaymentConfirmationEmail(data: PaymentConfirmationEmailData): Promise<void> {
  const transporter = createTransporter();
  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB; color: #4B5563; font-size: 14px;">
        ${item.name} <span style="color: #6B7280;">x${item.quantity}</span>
      </td>
      <td align="right" style="padding: 10px 0; border-bottom: 1px solid #E5E7EB; color: #1F2937; font-size: 14px; font-weight: 600;">
        R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}
      </td>
    </tr>
  `).join('');
  const orderInfoHtml = `
    <div style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-left: 4px solid #D4AF37; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h3 style="margin: 0 0 16px 0; color: #1F2937; font-size: 18px; font-weight: 600;">Detalhes do Pedido</h3>
      <p style="margin: 0 0 12px 0; color: #4B5563; font-size: 14px;">
        <strong style="color: #1F2937;">Número do Pedido:</strong> ${data.orderNumber}
      </p>
      <p style="margin: 0 0 20px 0; color: #4B5563; font-size: 14px;">
        <strong style="color: #1F2937;">Status:</strong> <span style="color: #D4AF37;">Processando</span>
      </p>
      <h4 style="margin: 0 0 12px 0; color: #1F2937; font-size: 16px; font-weight: 600;">Itens do Pedido:</h4>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        ${itemsHtml}
        <tr>
          <td style="padding: 15px 0 0 0; border-top: 2px solid #D4AF37; color: #1F2937; font-size: 18px; font-weight: 700;">
            Total:
          </td>
          <td align="right" style="padding: 15px 0 0 0; border-top: 2px solid #D4AF37; color: #D4AF37; font-size: 18px; font-weight: 700;">
            R$ ${data.totalAmount.toFixed(2).replace('.', ',')}
          </td>
        </tr>
      </table>
    </div>
  `;
  const html = generateEmailTemplate({
    title: 'Pagamento Aprovado',
    greeting: 'Olá',
    name: data.name,
    content: `
      <p style="margin: 0 0 16px 0;">Ótimas notícias! Seu pagamento foi <strong style="color: #D4AF37;">aprovado com sucesso</strong> e seu pedido está sendo processado.</p>
      ${orderInfoHtml}
      <div style="background-color: #FEF3C7; border-left: 4px solid #D4AF37; padding: 14px 16px; border-radius: 4px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0; color: #1F2937; font-size: 15px; font-weight: 600;">Próximos Passos:</p>
        <ul style="margin: 0; padding-left: 20px; color: #4B5563; font-size: 14px; line-height: 1.8;">
          <li>Seu pedido está sendo preparado com muito cuidado</li>
          <li>Você receberá um e-mail quando o produto for enviado</li>
          <li>Acompanhe o status do seu pedido em sua conta</li>
        </ul>
      </div>
      <p style="margin: 20px 0 0 0; color: #4B5563; font-size: 15px;">Obrigado por escolher a <strong style="color: #0F4024;">Modas Saraí</strong>!</p>
    `,
  });
  const mailOptions = {
    from: `"Modas Saraí" <${process.env.SMTP_FROM || process.env.EMAIL_FROM}>`,
    to: data.email,
    subject: `Pagamento Aprovado - Pedido ${data.orderNumber} - Modas Saraí`,
    html,
  };
  await transporter.sendMail(mailOptions);
}
export async function sendOrderShippedEmail(data: OrderShippedEmailData): Promise<void> {
  const transporter = createTransporter();
  const trackingInfoHtml = `
    <div style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-left: 4px solid #D4AF37; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h3 style="margin: 0 0 16px 0; color: #1F2937; font-size: 18px; font-weight: 600;">Informações de Rastreamento</h3>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="padding: 10px 0; color: #4B5563; font-size: 14px;"><strong style="color: #1F2937;">Número do Pedido:</strong></td>
          <td align="right" style="padding: 10px 0; color: #1F2937; font-size: 14px; font-weight: 600;">${data.orderNumber}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #4B5563; font-size: 14px;"><strong style="color: #1F2937;">Código de Rastreamento:</strong></td>
          <td align="right" style="padding: 10px 0; color: #1F2937; font-size: 14px; font-family: 'Courier New', monospace;">${data.trackingCode}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #4B5563; font-size: 14px;"><strong style="color: #1F2937;">Transportadora:</strong></td>
          <td align="right" style="padding: 10px 0; color: #1F2937; font-size: 14px;">${data.shippingCompany}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #4B5563; font-size: 14px;"><strong style="color: #1F2937;">Previsão de Entrega:</strong></td>
          <td align="right" style="padding: 10px 0; color: #D4AF37; font-size: 14px; font-weight: 600;">${data.estimatedDelivery}</td>
        </tr>
      </table>
    </div>
  `;
  const html = generateEmailTemplate({
    title: 'Seu pedido foi enviado',
    greeting: 'Olá',
    name: data.name,
    content: `
      <p style="margin: 0 0 16px 0;">Ótimas notícias! Seu pedido foi <strong style="color: #D4AF37;">enviado com sucesso</strong> e está a caminho da sua casa.</p>
      ${trackingInfoHtml}
      <div style="background-color: #FEF3C7; border-left: 4px solid #D4AF37; padding: 14px 16px; border-radius: 4px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0; color: #1F2937; font-size: 15px; font-weight: 600;">O que acontece agora?</p>
        <ul style="margin: 0; padding-left: 20px; color: #4B5563; font-size: 14px; line-height: 1.8;">
          <li>Seu pedido está em trânsito</li>
          <li>Você pode acompanhar o status usando o código de rastreamento acima</li>
          <li>Em caso de dúvidas, entre em contato conosco através do nosso site</li>
        </ul>
      </div>
      <p style="margin: 20px 0 0 0; color: #4B5563; font-size: 15px;">Obrigado por escolher a <strong style="color: #0F4024;">Modas Saraí</strong>!</p>
    `,
    buttonText: 'Rastrear Pedido',
    buttonUrl: data.trackingUrl,
  });
  const mailOptions = {
    from: `"Modas Saraí" <${process.env.SMTP_FROM || process.env.EMAIL_FROM}>`,
    to: data.email,
    subject: `Seu Pedido Foi Enviado! - ${data.orderNumber} - Modas Saraí`,
    html,
  };
  await transporter.sendMail(mailOptions);
}
export async function send2FACodeEmail(data: TwoFactorCodeEmailData): Promise<void> {
  const codeDisplay = data.code.match(/.{1,1}/g)?.join(' ') || data.code;

  const html = generateEmailTemplate({
    title: 'Código de Verificação',
    greeting: 'Olá',
    name: data.name,
    content: `
      <p style="margin: 0 0 20px 0;">Você solicitou acesso à sua conta na <strong style="color: #0F4024;">Modas Saraí</strong>.</p>
      
      <div style="background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%); border: 2px solid #86EFAC; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
        <p style="margin: 0 0 12px 0; color: #166534; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Seu Código de Verificação</p>
        <div style="font-size: 36px; font-weight: 700; color: #0F4024; letter-spacing: 8px; font-family: 'Courier New', monospace; margin: 12px 0;">
          ${codeDisplay}
        </div>
        <p style="margin: 12px 0 0 0; color: #166534; font-size: 12px;">Este código expira em 10 minutos</p>
      </div>
      
      <div style="background-color: #FEF3C7; border-left: 4px solid #D4AF37; padding: 14px 16px; border-radius: 4px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0; color: #1F2937; font-size: 15px; font-weight: 600;">⚠️ Importante:</p>
        <ul style="margin: 0; padding-left: 20px; color: #4B5563; font-size: 14px; line-height: 1.8;">
          <li>Nunca compartilhe este código com ninguém</li>
          <li>A Modas Saraí nunca pedirá seu código por telefone ou e-mail</li>
          <li>Se você não solicitou este código, ignore este e-mail e altere sua senha imediatamente</li>
        </ul>
      </div>
      
      <p style="margin: 20px 0 0 0; color: #4B5563; font-size: 15px;">Use este código no campo de verificação para concluir o login.</p>
    `,
    buttonText: '',
    buttonUrl: '',
    expiryTime: '10 minutos',
    footerNote: 'Este código é válido por apenas 10 minutos e só pode ser usado uma vez. Se você não solicitou este código, sua conta pode estar em risco - altere sua senha imediatamente.',
  });

  const mailOptions = {
    from: `"Modas Saraí" <${process.env.SMTP_FROM || process.env.EMAIL_FROM}>`,
    to: data.email,
    subject: `Código de Verificação - ${data.code} - Modas Saraí`,
    html,
  };

  try {
    const transporter = createTransporter();
    await transporter.verify();
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Erro ao enviar e-mail 2FA:', error);
    await saveEmailToFile(mailOptions);
  }
}
