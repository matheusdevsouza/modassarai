export interface EmailTemplateOptions {
  title: string;
  greeting?: string;
  name?: string;
  content: string;
  buttonText?: string;
  buttonUrl?: string;
  footerNote?: string;
  expiryTime?: string;
  showLogo?: boolean;
}

function getLogoUrl(): string {
  if (process.env.EMAIL_LOGO_URL) {
    return process.env.EMAIL_LOGO_URL;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl && !appUrl.includes('localhost') && !appUrl.includes('127.0.0.1')) {
    const cleanUrl = appUrl.replace(/\/$/, '');
    return `${cleanUrl}/images/logo.png`;
  }
  
  return process.env.NEXT_PUBLIC_APP_URL 
    ? `${process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')}/images/logo.png`
    : '/images/logo.png';
}

const LOGO_URL = getLogoUrl();

if (process.env.NODE_ENV === 'development') {

}

const PRIMARY_COLOR = '#0F4024'; 
const PRIMARY_COLOR_LIGHT = '#4F5955';
const TEXT_DARK = '#1F2937';
const TEXT_MEDIUM = '#4B5563';
const TEXT_LIGHT = '#6B7280';
const BORDER_COLOR = '#E5E7EB';
const BG_WHITE = '#FFFFFF';
const BG_LIGHT = '#F9FAFB';

export function generateEmailTemplate(options: EmailTemplateOptions): string {
  const {
    title,
    greeting = 'Olá',
    name = '',
    content,
    buttonText,
    buttonUrl,
    footerNote,
    expiryTime,
    showLogo = true,
  } = options;

  const greetingText = name ? `${greeting}, ${name}!` : greeting;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title} - Maria Pistache</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: ${BG_LIGHT}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${BG_LIGHT};">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: ${BG_WHITE}; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
          
          ${showLogo ? `
          <tr>
            <td align="center" style="padding: 40px 30px 30px; background-color: ${BG_WHITE}; border-bottom: 2px solid ${PRIMARY_COLOR};">
              <!--[if mso]>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100">
                <tr>
                  <td align="center">
                    <img src="${LOGO_URL}" alt="Maria Pistache" width="100" height="100" style="display: block; margin: 0 auto;" />
                  </td>
                </tr>
              </table>
              <![endif]-->
              <!--[if !mso]><!-->
              <img 
                src="${LOGO_URL}" 
                alt="Maria Pistache" 
                width="100" 
                height="100" 
                style="display: block; margin: 0 auto; max-width: 100px; height: auto; border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;" 
                border="0"
              />
              <!--<![endif]-->
            </td>
          </tr>
          ` : `
          <tr>
            <td align="center" style="padding: 30px 30px 20px; background-color: ${BG_WHITE}; border-bottom: 2px solid ${PRIMARY_COLOR};">
              <h1 style="margin: 0; color: ${TEXT_DARK}; font-size: 28px; font-weight: 700; letter-spacing: 0.5px;">Maria Pistache</h1>
            </td>
          </tr>
          `}
          
          <tr>
            <td style="padding: 40px 30px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding-bottom: 24px;">
                    <h2 style="margin: 0; color: ${TEXT_DARK}; font-size: 24px; font-weight: 600; line-height: 1.3;">${title}</h2>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding-bottom: 20px;">
                    <p style="margin: 0; color: ${TEXT_DARK}; font-size: 16px; line-height: 1.6; font-weight: 500;">${greetingText}</p>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding-bottom: 30px;">
                    <div style="color: ${TEXT_MEDIUM}; font-size: 15px; line-height: 1.7;">
                      ${content}
                    </div>
                  </td>
                </tr>
                
                ${buttonText && buttonUrl ? `
                <tr>
                  <td align="center" style="padding: 30px 0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="center" style="background-color: ${PRIMARY_COLOR}; border-radius: 8px;">
                          <a href="${buttonUrl}" style="display: inline-block; padding: 14px 32px; color: #FFFFFF; text-decoration: none; font-size: 16px; font-weight: 600; letter-spacing: 0.3px; border-radius: 8px;">
                            ${buttonText}
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ` : ''}
                
                ${buttonText && buttonUrl ? `
                <tr>
                  <td style="padding: 24px 0 0 0;">
                    <div style="padding: 16px; background-color: ${BG_LIGHT}; border-radius: 6px; border: 1px solid ${BORDER_COLOR};">
                      <p style="margin: 0 0 8px 0; color: ${TEXT_LIGHT}; font-size: 13px; line-height: 1.5;">
                        <strong style="color: ${TEXT_MEDIUM};">Se o botão não funcionar,</strong> copie e cole este link no seu navegador:
                      </p>
                      <p style="margin: 0; word-break: break-all; color: ${PRIMARY_COLOR}; font-size: 12px; line-height: 1.6; font-family: 'Courier New', monospace; font-weight: 500;">
                        ${buttonUrl}
                      </p>
                    </div>
                  </td>
                </tr>
                ` : ''}
                
                ${expiryTime ? `
                <tr>
                  <td style="padding-top: 24px;">
                    <div style="background-color: #F0F9F4; border-left: 4px solid ${PRIMARY_COLOR}; padding: 14px 16px; border-radius: 4px;">
                      <p style="margin: 0; color: ${TEXT_DARK}; font-size: 13px; line-height: 1.6;">
                        <strong style="color: ${PRIMARY_COLOR};">Importante:</strong> Este link expira em <strong>${expiryTime}</strong> por segurança.
                      </p>
                    </div>
                  </td>
                </tr>
                ` : ''}
                
                ${footerNote ? `
                <tr>
                  <td style="padding-top: 24px;">
                    <p style="margin: 0; color: ${TEXT_LIGHT}; font-size: 13px; line-height: 1.6;">
                      ${footerNote}
                    </p>
                  </td>
                </tr>
                ` : ''}
              </table>
            </td>
          </tr>
          
          <tr>
            <td align="center" style="padding: 30px; background-color: ${BG_LIGHT}; border-top: 1px solid ${BORDER_COLOR};">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 12px;">
                    <p style="margin: 0; color: ${TEXT_LIGHT}; font-size: 12px; line-height: 1.5;">
                      © ${new Date().getFullYear()} <strong style="color: ${PRIMARY_COLOR};">Maria Pistache</strong>. Todos os direitos reservados.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <p style="margin: 0; color: ${TEXT_LIGHT}; font-size: 11px; line-height: 1.4;">
                      Este é um e-mail automático, por favor não responda.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding: 0 12px;">
                          <a href="${process.env.NEXT_PUBLIC_APP_URL || '#'}" style="color: ${PRIMARY_COLOR}; text-decoration: none; font-size: 12px; font-weight: 500;">Visite nosso site</a>
                        </td>
                        <td style="padding: 0 12px; color: ${TEXT_LIGHT};">•</td>
                        <td style="padding: 0 12px;">
                          <a href="${process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/contato` : '#'}" style="color: ${PRIMARY_COLOR}; text-decoration: none; font-size: 12px; font-weight: 500;">Contato</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
