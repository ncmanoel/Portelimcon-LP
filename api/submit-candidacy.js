// api/submit-candidacy.js
// Vercel Serverless Function — Recebe formulário de candidatura (+ PDF) e dispara e-mails via Resend

const { Resend } = require('resend');

const FROM_EMAIL  = 'Portelimcon <contato@portelimcon.com.br>';
const TO_INTERNAL = 'atendimento@portelimcon.com.br';
const MAX_PDF_BYTES = 4 * 1024 * 1024; // 4MB base64 → ~3MB PDF real

// ─── Templates de E-mail ─────────────────────────────────────────────────────

function emailInternoCandidata({ name, whatsapp, email, desired_role, neighborhood, experience }) {
  const whatsappNum = whatsapp.replace(/\D/g, '');
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:32px auto;border-radius:8px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.10);">

    <!-- Header -->
    <div style="background:#0A1628;padding:28px 32px;text-align:center;">
      <p style="margin:0 0 6px;color:rgba(255,255,255,.55);font-size:12px;text-transform:uppercase;letter-spacing:.12em;">Portelimcon · RH</p>
      <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700;">👤 Nova Candidatura Recebida</h1>
    </div>

    <!-- Dados do Candidato -->
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
          <td style="padding:12px 0;font-size:15px;color:#1A2540;">${email || '—'}</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f4;">
          <td style="padding:12px 0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#5C6A88;">Cargo Desejado</td>
          <td style="padding:12px 0;font-size:15px;color:#1A2540;font-weight:600;">${desired_role}</td>
        </tr>
        <tr style="border-bottom:${experience ? '1px solid #e2e8f4' : 'none'};">
          <td style="padding:12px 0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#5C6A88;">Bairro / Cidade</td>
          <td style="padding:12px 0;font-size:15px;color:#1A2540;">${neighborhood}</td>
        </tr>
        ${experience ? `<tr>
          <td style="padding:12px 0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#5C6A88;vertical-align:top;">Experiência</td>
          <td style="padding:12px 0;font-size:15px;color:#1A2540;line-height:1.6;">${experience}</td>
        </tr>` : ''}
      </table>
    </div>

    <!-- CTA Responder -->
    <div style="background:#f4f6fb;padding:24px 32px;text-align:center;border-top:1px solid #e2e8f4;">
      <a href="https://wa.me/55${whatsappNum}?text=Olá%20${encodeURIComponent(name)}!%20Vi%20sua%20candidatura%20para%20${encodeURIComponent(desired_role)}%20na%20Portelimcon."
         style="display:inline-block;background:#25D366;color:#fff;padding:13px 28px;border-radius:6px;text-decoration:none;font-weight:700;font-size:14px;">
        💬 Entrar em contato com candidato
      </a>
      ${email ? `<p style="margin:12px 0 0;font-size:13px;color:#5C6A88;">ou responder em: <a href="mailto:${email}" style="color:#1E4FAF;">${email}</a></p>` : ''}
    </div>

    <!-- Footer -->
    <div style="background:#0A1628;padding:16px 32px;text-align:center;">
      <p style="margin:0;font-size:12px;color:rgba(255,255,255,.4);">Portelimcon · portelimcon.com.br · (41) 3264-7872</p>
    </div>

  </div>
</body>
</html>`;
}

function emailConfirmacaoCandidato({ name, desired_role }) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:32px auto;border-radius:8px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.10);">

    <!-- Header -->
    <div style="background:#0A1628;padding:32px;text-align:center;">
      <p style="margin:0 0 8px;color:rgba(255,255,255,.55);font-size:12px;text-transform:uppercase;letter-spacing:.12em;">Portelimcon</p>
      <div style="font-size:48px;margin-bottom:12px;">✅</div>
      <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;line-height:1.3;">Candidatura recebida com sucesso!</h1>
    </div>

    <!-- Corpo -->
    <div style="background:#fff;padding:40px 36px;">
      <p style="margin:0 0 16px;font-size:16px;color:#1A2540;line-height:1.6;">Olá, <strong>${name}</strong>!</p>
      <p style="margin:0 0 16px;font-size:15px;color:#5C6A88;line-height:1.7;">
        Recebemos sua candidatura para a vaga de <strong style="color:#1A2540;">${desired_role}</strong>.
      </p>
      <p style="margin:0 0 16px;font-size:15px;color:#5C6A88;line-height:1.7;">
        Guardaremos seu perfil em nosso <strong style="color:#1A2540;">banco de talentos</strong> e entraremos em contato pelo WhatsApp quando houver uma oportunidade alinhada ao seu perfil.
      </p>
      <p style="margin:0 0 0;font-size:14px;color:#5C6A88;line-height:1.7;">
        A Portelimcon tem mais de <strong>35 anos</strong> de atuação em Curitiba e Região. Trabalhamos com profissionalismo, respeito e estabilidade.
      </p>
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
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const { name, whatsapp, email, desired_role, neighborhood, experience, resume } = req.body || {};

  // ─── Validação no Servidor ─────────────────────────────────────────────────
  const errors = [];
  if (!name || name.trim().length < 3)            errors.push('Nome deve ter ao menos 3 caracteres');
  if (!whatsapp || whatsapp.replace(/\D/g,'').length < 10) errors.push('WhatsApp inválido');
  if (!desired_role || desired_role === '')        errors.push('Selecione o cargo desejado');
  if (!neighborhood || !neighborhood.trim())       errors.push('Bairro/Cidade obrigatório');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('E-mail com formato inválido');

  // Validação do PDF (se enviado)
  if (resume && resume.data) {
    const sizeBytes = Buffer.from(resume.data, 'base64').length;
    if (sizeBytes > MAX_PDF_BYTES) errors.push('Currículo excede o tamanho máximo de 4MB');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join('. ') });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY não configurada');
    return res.status(500).json({ error: 'Configuração de e-mail ausente no servidor.' });
  }

  const resend   = new Resend(process.env.RESEND_API_KEY);
  const data     = { name: name.trim(), whatsapp, email: email?.trim() || '', desired_role, neighborhood: neighborhood.trim(), experience };

  // Prepara anexo PDF (se enviado)
  const attachments = (resume && resume.data) ? [{
    filename: resume.name || 'curriculo.pdf',
    content:  resume.data, // base64
  }] : [];

  try {
    const promises = [];

    // 1. Notificação interna (com PDF anexo se enviado)
    promises.push(
      resend.emails.send({
        from:        FROM_EMAIL,
        to:          [TO_INTERNAL],
        subject:     `👤 Nova candidatura — ${data.name} (${data.desired_role})`,
        html:        emailInternoCandidata(data),
        attachments,
      })
    );

    // 2. Confirmação para o candidato (somente se informou e-mail)
    if (data.email) {
      promises.push(
        resend.emails.send({
          from:    FROM_EMAIL,
          to:      [data.email],
          subject: `Recebemos sua candidatura, ${data.name}!`,
          html:    emailConfirmacaoCandidato(data),
        })
      );
    }

    const results = await Promise.all(promises);
    const hasError = results.find(r => r.error);

    if (hasError) {
      console.error('Resend error:', hasError.error);
      return res.status(500).json({ error: 'Falha ao enviar e-mail. Tente novamente.' });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Erro inesperado:', err);
    return res.status(500).json({ error: 'Erro interno. Tente novamente ou ligue para (41) 3264-7872.' });
  }
};
