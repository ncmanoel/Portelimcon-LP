// api/submit-proposal.js
// Vercel Serverless Function — Recebe formulário de proposta e dispara e-mails via Resend

const { Resend } = require('resend');

const FROM_EMAIL  = 'Portelimcon <contato@portelimcon.com.br>';
const TO_INTERNAL = 'contato@portelimcon.com.br';

// ─── Templates de E-mail ─────────────────────────────────────────────────────

function emailInterno({ name, whatsapp, email, company, services, professionals_count, message }) {
  const servicosList = Array.isArray(services) ? services.join(', ') : (services || '—');
  const whatsappNum  = whatsapp.replace(/\D/g, '');
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:32px auto;border-radius:8px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.10);">

    <!-- Header -->
    <div style="background:#0A1628;padding:28px 32px;text-align:center;">
      <p style="margin:0 0 6px;color:rgba(255,255,255,.55);font-size:12px;text-transform:uppercase;letter-spacing:.12em;">Portelimcon</p>
      <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700;">🔔 Nova Solicitação de Proposta</h1>
    </div>

    <!-- Dados do Lead -->
    <div style="background:#fff;padding:32px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr style="border-bottom:1px solid #e2e8f4;">
          <td style="padding:12px 0;width:160px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#5C6A88;">Nome</td>
          <td style="padding:12px 0;font-size:15px;color:#1A2540;font-weight:600;">${name}</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f4;">
          <td style="padding:12px 0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#5C6A88;">WhatsApp</td>
          <td style="padding:12px 0;font-size:15px;color:#1A2540;">${whatsapp}</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f4;">
          <td style="padding:12px 0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#5C6A88;">E-mail</td>
          <td style="padding:12px 0;font-size:15px;color:#1A2540;">${email}</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f4;">
          <td style="padding:12px 0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#5C6A88;">Empresa / Cond.</td>
          <td style="padding:12px 0;font-size:15px;color:#1A2540;font-weight:600;">${company}</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f4;">
          <td style="padding:12px 0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#5C6A88;">Serviços</td>
          <td style="padding:12px 0;font-size:15px;color:#1A2540;">${servicosList}</td>
        </tr>
        <tr style="border-bottom:${message ? '1px solid #e2e8f4' : 'none'};">
          <td style="padding:12px 0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#5C6A88;">Qtd. Profissionais</td>
          <td style="padding:12px 0;font-size:15px;color:#1A2540;">${professionals_count || 'Não informado'}</td>
        </tr>
        ${message ? `<tr>
          <td style="padding:12px 0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#5C6A88;vertical-align:top;">Observações</td>
          <td style="padding:12px 0;font-size:15px;color:#1A2540;line-height:1.6;">${message}</td>
        </tr>` : ''}
      </table>
    </div>

    <!-- CTA Responder -->
    <div style="background:#f4f6fb;padding:24px 32px;text-align:center;border-top:1px solid #e2e8f4;">
      <a href="https://wa.me/55${whatsappNum}?text=Olá%20${encodeURIComponent(name)}!%20Vi%20sua%20solicitação%20de%20proposta%20para%20${encodeURIComponent(company)}."
         style="display:inline-block;background:#25D366;color:#fff;padding:13px 28px;border-radius:6px;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:.03em;">
        💬 Responder pelo WhatsApp
      </a>
    </div>

    <!-- Footer -->
    <div style="background:#0A1628;padding:16px 32px;text-align:center;">
      <p style="margin:0;font-size:12px;color:rgba(255,255,255,.4);">Portelimcon · portelimcon.com.br · (41) 3264-7872</p>
    </div>

  </div>
</body>
</html>`;
}

function emailConfirmacaoLead({ name, company }) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:32px auto;border-radius:8px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.10);">

    <!-- Header -->
    <div style="background:#0A1628;padding:32px;text-align:center;">
      <p style="margin:0 0 8px;color:rgba(255,255,255,.55);font-size:12px;text-transform:uppercase;letter-spacing:.12em;">Portelimcon</p>
      <div style="font-size:48px;margin-bottom:12px;">✅</div>
      <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;line-height:1.3;">Solicitação recebida com sucesso!</h1>
    </div>

    <!-- Corpo -->
    <div style="background:#fff;padding:40px 36px;">
      <p style="margin:0 0 16px;font-size:16px;color:#1A2540;line-height:1.6;">Olá, <strong>${name}</strong>!</p>
      <p style="margin:0 0 16px;font-size:15px;color:#5C6A88;line-height:1.7;">
        Recebemos sua solicitação de proposta para <strong style="color:#1A2540;">${company}</strong>.
      </p>
      <p style="margin:0 0 28px;font-size:15px;color:#5C6A88;line-height:1.7;">
        Nossa equipe analisará suas necessidades e entrará em contato em até <strong style="color:#1A2540;">1 dia útil</strong> pelo WhatsApp ou e-mail que você informou.
      </p>
      <p style="margin:0 0 20px;font-size:15px;color:#5C6A88;">Prefere falar agora? Entre em contato diretamente:</p>
      <div style="text-align:center;margin:24px 0;">
        <a href="https://wa.me/5541999010144?text=Olá!%20Acabei%20de%20solicitar%20uma%20proposta%20e%20gostaria%20de%20mais%20informações."
           style="display:inline-block;background:#25D366;color:#fff;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:700;font-size:15px;">
          💬 (41) 99901-0144 · WhatsApp
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#0A1628;padding:20px 32px;text-align:center;">
      <p style="margin:0 0 4px;font-size:13px;color:rgba(255,255,255,.65);">Portaria, Limpeza e Zeladoria em Curitiba · Desde 1991</p>
      <a href="https://www.portelimcon.com.br" style="font-size:12px;color:rgba(255,255,255,.4);text-decoration:none;">www.portelimcon.com.br</a>
    </div>

  </div>
</body>
</html>`;
}

// ─── Handler Principal ────────────────────────────────────────────────────────

module.exports = async function handler(req, res) {
  // CORS — aceita apenas do domínio da Portelimcon
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const { name, whatsapp, email, company, services, professionals_count, message } = req.body || {};

  // ─── Validação no Servidor ─────────────────────────────────────────────────
  const errors = [];
  if (!name || name.trim().length < 3)          errors.push('Nome deve ter ao menos 3 caracteres');
  if (!whatsapp || whatsapp.replace(/\D/g,'').length < 10) errors.push('WhatsApp inválido');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('E-mail inválido');
  if (!company || !company.trim())               errors.push('Empresa/Condomínio obrigatório');
  if (!services || !Array.isArray(services) || services.length === 0) errors.push('Selecione ao menos 1 serviço');

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join('. ') });
  }

  // ─── Envio de E-mails ──────────────────────────────────────────────────────
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY não configurada');
    return res.status(500).json({ error: 'Configuração de e-mail ausente no servidor.' });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const data   = { name: name.trim(), whatsapp, email: email.trim(), company: company.trim(), services, professionals_count, message };

  try {
    // 1. Notificação interna
    const [interno, confirmacao] = await Promise.all([
      resend.emails.send({
        from:    FROM_EMAIL,
        to:      [TO_INTERNAL],
        subject: `🔔 Nova solicitação de proposta — ${data.name} (${data.company})`,
        html:    emailInterno(data),
      }),
      // 2. Confirmação para o lead
      resend.emails.send({
        from:    FROM_EMAIL,
        to:      [data.email],
        subject: `Recebemos sua solicitação, ${data.name}!`,
        html:    emailConfirmacaoLead(data),
      }),
    ]);

    if (interno.error || confirmacao.error) {
      console.error('Resend error:', interno.error || confirmacao.error);
      return res.status(500).json({ error: 'Falha ao enviar e-mail. Tente novamente.' });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Erro inesperado:', err);
    return res.status(500).json({ error: 'Erro interno. Tente novamente ou ligue para (41) 3264-7872.' });
  }
};
