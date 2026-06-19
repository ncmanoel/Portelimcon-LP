# Especificação de Páginas — Portelimcon
## Solicitar Proposta & Trabalhe Conosco

> **Stack:** Next.js · Supabase · Resend · Vercel  
> **Domínio:** portelimcon.com.br  
> **Identidade visual:** Manter exatamente o padrão do site atual (cores, fontes, componentes)

---

## 1. VISÃO GERAL

Criar duas páginas novas e duas páginas de confirmação pós-envio:

| Página | URL | Finalidade |
|---|---|---|
| Solicitar Proposta | `/solicitar-proposta` | Capturar leads comerciais |
| Trabalhe Conosco | `/trabalhe-conosco` | Receber candidatos a vagas |
| Confirmação – Proposta | `/proposta-enviada` | Agradecimento pós-envio de proposta |
| Confirmação – Candidatura | `/candidatura-enviada` | Agradecimento pós-envio de currículo |

Também ajustar a **home** e o **menu de navegação** para incluir os novos acessos.

---

## 2. AJUSTES NA HOME E NO MENU

### 2.1 Menu de navegação (header)

**Antes:**
```
Serviços | Diferenciais | Segmentos | Contato | [Solicitar Proposta]
```

**Depois:**
```
Serviços | Diferenciais | Segmentos | Contato | Trabalhe Conosco | [Solicitar Proposta]
```

- "Trabalhe Conosco" → link para `/trabalhe-conosco` (estilo texto simples, sem destaque)
- "Solicitar Proposta" → link para `/solicitar-proposta` (manter estilo de botão atual)

### 2.2 Hero da home

Adicionar um segundo CTA abaixo ou ao lado do botão principal.

**Antes:**
```
[Solicitar Proposta]   [Ver nossos serviços]
```

**Depois:**
```
[Solicitar Proposta]   [Ver nossos serviços]

Procurando emprego? → Trabalhe Conosco
```

- O link "Trabalhe Conosco" deve ser discreto — texto pequeno, sem destaque visual, abaixo dos botões principais. Não deve competir com o CTA de proposta.
- Texto sugerido: `"Quer fazer parte do nosso time? Trabalhe Conosco →"`

### 2.3 Botão flutuante de WhatsApp

O botão flutuante atual abre o WhatsApp com a mensagem de proposta. Manter o comportamento atual — ele é destinado a leads, não a candidatos.

---

## 3. PÁGINA: SOLICITAR PROPOSTA (`/solicitar-proposta`)

### 3.1 Estrutura da página

```
[Header simples — logo + menu]
[Seção hero compacta]
[Formulário]
[Rodapé simples]
```

**Observação:** Usar header e footer do site, mas o foco total deve ser o formulário. Não incluir seções de serviços, depoimentos ou diferenciais nessa página — ela é uma landing de conversão.

### 3.2 Seção hero (acima do formulário)

- **Título:** `Solicite uma proposta sem compromisso`
- **Subtítulo:** `Preencha o formulário e nossa equipe entrará em contato em até 1 dia útil.`
- **Sem imagem de fundo** — fundo simples na cor primária do site (`#0A1628`) ou branco, conforme melhor contraste

### 3.3 Campos do formulário

| # | Campo | Tipo | Placeholder | Obrigatório |
|---|---|---|---|---|
| 1 | Nome completo | text | Ex: João Silva | ✅ |
| 2 | WhatsApp | tel | Ex: (41) 99999-9999 | ✅ |
| 3 | E-mail | email | Ex: joao@empresa.com.br | ✅ |
| 4 | Empresa / Condomínio | text | Ex: Condomínio Residencial Park | ✅ |
| 5 | Serviços de interesse | checkboxes | — | ✅ (mínimo 1) |
| 6 | Quantidade de profissionais | select | Selecione | ❌ |
| 7 | Observações | textarea | Descreva sua necessidade ou dúvida | ❌ |

**Opções do campo "Serviços de interesse" (checkboxes):**
- [ ] Portaria / Porteiro
- [ ] Controle de Acesso
- [ ] Limpeza e Conservação
- [ ] Zeladoria
- [ ] Recepcionista
- [ ] Jardinagem
- [ ] Auxiliar de Serviços Gerais
- [ ] Copeiragem
- [ ] Cobertura de Férias e Folgas

**Opções do campo "Quantidade de profissionais" (select):**
- Selecione (placeholder)
- 1 profissional
- 2 a 5 profissionais
- 6 a 10 profissionais
- Mais de 10 profissionais
- Ainda não sei

**Botão de envio:**
- Texto: `Quero uma proposta →`
- Estilo: botão primário do site (fundo escuro, texto branco)
- Estado de loading: desabilitar botão e trocar texto para `Enviando...` enquanto processa

**Nota de privacidade abaixo do botão:**
```
Seus dados são usados apenas para contato comercial. Não compartilhamos com terceiros.
```

### 3.4 Banco de dados (Supabase)

Criar tabela `proposals` com as seguintes colunas:

```sql
CREATE TABLE proposals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  services TEXT[] NOT NULL,        -- array com os serviços marcados
  professionals_count TEXT,        -- valor do select
  message TEXT,
  status TEXT DEFAULT 'novo'       -- novo | em_contato | fechado | descartado
);
```

### 3.5 E-mail automático (Resend)

**Disparar dois e-mails ao receber o formulário:**

**E-mail 1 — Notificação interna (para a Portelimcon)**
- Para: `contato@portelimcon.com.br`
- Assunto: `Nova solicitação de proposta — {nome} ({empresa})`
- Corpo: todos os campos preenchidos, formatados de forma legível

**E-mail 2 — Confirmação para o lead**
- Para: e-mail informado no formulário
- Assunto: `Recebemos sua solicitação, {nome}!`
- Corpo sugerido:
```
Olá, {nome}!

Recebemos sua solicitação de proposta para {empresa}.

Nossa equipe analisará suas necessidades e entrará em contato em até 1 dia útil pelo WhatsApp ou e-mail que você informou.

Caso prefira falar agora, entre em contato pelo (41) 99901-0144.

Att,
Equipe Portelimcon
portelimcon.com.br
```

### 3.6 Redirecionamento pós-envio

Após envio com sucesso → redirecionar para `/proposta-enviada`

**Rastreamento (importante):**
- Disparar evento no Google Tag Manager: `event: 'generate_lead', form: 'proposta'`
- Isso permitirá rastrear conversões no GA4 e Google Ads

---

## 4. PÁGINA DE CONFIRMAÇÃO: PROPOSTA ENVIADA (`/proposta-enviada`)

### Conteúdo

- **Ícone:** ✅ (checkmark grande)
- **Título:** `Proposta solicitada com sucesso!`
- **Texto:** `Recebemos seus dados e entraremos em contato em até 1 dia útil. Fique de olho no seu WhatsApp e e-mail.`
- **Botão 1:** `Falar pelo WhatsApp agora` → abre `https://wa.me/5541999010144`
- **Botão 2:** `Voltar para o início` → link para `/`

**Observação:** Esta página não deve ter formulário. Apenas a mensagem de confirmação e os botões. O Google Ads e GA4 podem usar o acesso a esta URL como evento de conversão.

---

## 5. PÁGINA: TRABALHE CONOSCO (`/trabalhe-conosco`)

### 5.1 Estrutura da página

```
[Header com menu]
[Seção de apresentação]
[Lista de vagas recorrentes]
[Formulário de candidatura]
[Rodapé]
```

### 5.2 Seção de apresentação

- **Título:** `Faça parte do nosso time`
- **Texto:**
```
A Portelimcon tem mais de 35 anos cuidando de condomínios e empresas em Curitiba e Região. 
Se você quer trabalhar com profissionalismo, respeito e estabilidade, preencha o formulário 
abaixo e entraremos em contato quando houver uma vaga alinhada ao seu perfil.
```

### 5.3 Vagas recorrentes

Exibir como cards ou lista visual com ícones:

| Cargo | Ícone sugerido |
|---|---|
| Porteiro | 🏢 |
| Controlador de Acesso | 🔑 |
| Zelador | 🔧 |
| Servente de Limpeza | 🧹 |
| Auxiliar de Serviços Gerais | ⚙️ |
| Recepcionista | 🤝 |
| Copeiro | ☕ |
| Jardineiro | 🌿 |

Nota abaixo da lista:
```
Não encontrou sua área? Envie seu currículo assim mesmo — analisamos todos os perfis.
```

### 5.4 Campos do formulário

| # | Campo | Tipo | Placeholder | Obrigatório |
|---|---|---|---|---|
| 1 | Nome completo | text | Ex: Maria Oliveira | ✅ |
| 2 | WhatsApp | tel | Ex: (41) 99999-9999 | ✅ |
| 3 | E-mail | email | Ex: maria@email.com | ❌ |
| 4 | Cargo desejado | select | Selecione o cargo | ✅ |
| 5 | Bairro / Cidade | text | Ex: Pinheirinho, Curitiba | ✅ |
| 6 | Experiência anterior | textarea | Conte um pouco sobre sua experiência na área | ❌ |
| 7 | Currículo (PDF) | file upload | Anexar currículo (opcional, máx. 5MB) | ❌ |

**Opções do campo "Cargo desejado" (select):**
- Selecione o cargo (placeholder)
- Porteiro
- Controlador de Acesso
- Zelador
- Servente de Limpeza
- Auxiliar de Serviços Gerais
- Recepcionista
- Copeiro
- Jardineiro
- Outro

**Botão de envio:**
- Texto: `Enviar candidatura →`
- Estilo: botão primário do site
- Estado de loading: `Enviando...`

**Nota abaixo do botão:**
```
Suas informações são tratadas com sigilo e usadas somente para processo seletivo interno.
```

### 5.5 Upload de currículo

- Aceitar apenas PDF
- Tamanho máximo: 5MB
- Armazenar no Supabase Storage em bucket `curriculos`
- Caminho sugerido: `curriculos/{id-da-candidatura}/{nome-do-arquivo}.pdf`
- Se o candidato não anexar currículo, o campo simplesmente fica vazio — não bloquear o envio

### 5.6 Banco de dados (Supabase)

Criar tabela `candidates` com as seguintes colunas:

```sql
CREATE TABLE candidates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT,
  desired_role TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  experience TEXT,
  resume_url TEXT,                  -- URL do PDF no Supabase Storage
  status TEXT DEFAULT 'novo'        -- novo | em_analise | aprovado | descartado
);
```

### 5.7 E-mail automático (Resend)

**Disparar dois e-mails ao receber o formulário:**

**E-mail 1 — Notificação interna (para a Portelimcon)**
- Para: `contato@portelimcon.com.br`
- Assunto: `Nova candidatura — {nome} ({cargo})`
- Corpo: todos os campos preenchidos + link para o currículo (se enviado)

**E-mail 2 — Confirmação para o candidato** (somente se e-mail foi informado)
- Para: e-mail informado
- Assunto: `Recebemos sua candidatura, {nome}!`
- Corpo sugerido:
```
Olá, {nome}!

Recebemos sua candidatura para a vaga de {cargo}.

Guardaremos seu perfil em nosso banco de talentos e entraremos em contato 
pelo WhatsApp quando houver uma oportunidade alinhada ao seu perfil.

Att,
Equipe Portelimcon
portelimcon.com.br
```

### 5.8 Redirecionamento pós-envio

Após envio com sucesso → redirecionar para `/candidatura-enviada`

**Rastreamento:**
- Disparar evento no GTM: `event: 'form_submit', form: 'candidatura'`
- Importante: este evento NÃO deve ser configurado como conversão no Google Ads — apenas no GA4 para análise interna

---

## 6. PÁGINA DE CONFIRMAÇÃO: CANDIDATURA ENVIADA (`/candidatura-enviada`)

### Conteúdo

- **Ícone:** ✅
- **Título:** `Candidatura enviada com sucesso!`
- **Texto:** `Recebemos seu perfil e vamos guardá-lo em nosso banco de talentos. Entraremos em contato pelo WhatsApp quando houver uma vaga para você.`
- **Botão:** `Voltar para o início` → link para `/`

---

## 7. VALIDAÇÕES E COMPORTAMENTO DOS FORMULÁRIOS

### Validações de campo

| Campo | Validação |
|---|---|
| Nome | Mínimo 3 caracteres |
| WhatsApp | Formato brasileiro: (XX) XXXXX-XXXX ou XXXXXXXXXX |
| E-mail | Formato válido de e-mail |
| Serviços (proposta) | Pelo menos 1 checkbox marcado |
| Cargo (candidatura) | Valor diferente do placeholder |
| Currículo | Somente PDF, máximo 5MB |

### Comportamento geral

- Validar campos em tempo real (ao sair do campo / `onBlur`)
- Exibir mensagens de erro inline, abaixo de cada campo
- Desabilitar botão de envio enquanto há erros ou durante o loading
- Em caso de erro na API: exibir mensagem de erro no topo do formulário:
  ```
  Ocorreu um erro ao enviar. Tente novamente ou entre em contato pelo WhatsApp: (41) 99901-0144
  ```
- Máscara no campo WhatsApp: formatar automaticamente para `(XX) XXXXX-XXXX`

---

## 8. RASTREAMENTO E ANALYTICS

### Eventos a configurar no GTM / GA4

| Evento | Gatilho | Usar no Google Ads? |
|---|---|---|
| `page_view` | Acesso a `/solicitar-proposta` | ✅ Sim (audiência) |
| `generate_lead` | Acesso a `/proposta-enviada` | ✅ Sim (conversão principal) |
| `page_view` | Acesso a `/trabalhe-conosco` | ❌ Não |
| `form_submit` | Acesso a `/candidatura-enviada` | ❌ Não |

### Palavras-chave negativas recomendadas para o Google Ads

Após separar as páginas, adicionar como negativas na campanha:
```
emprego, vaga, vagas, currículo, curriculo, trabalhar, contratação, 
contratacao, CLT, salário, salario, oportunidade de emprego
```

---

## 9. CHECKLIST DE ENTREGA

### Banco de dados
- [ ] Tabela `proposals` criada no Supabase
- [ ] Tabela `candidates` criada no Supabase
- [ ] Bucket `curriculos` criado no Supabase Storage com acesso privado

### Páginas
- [ ] `/solicitar-proposta` — formulário funcionando
- [ ] `/proposta-enviada` — página de confirmação
- [ ] `/trabalhe-conosco` — formulário com upload funcionando
- [ ] `/candidatura-enviada` — página de confirmação

### E-mails (Resend)
- [ ] Notificação interna ao receber proposta
- [ ] Confirmação automática para o lead
- [ ] Notificação interna ao receber candidatura
- [ ] Confirmação automática para o candidato (quando e-mail informado)

### Site
- [ ] Menu atualizado com "Trabalhe Conosco"
- [ ] Hero da home com link discreto para "Trabalhe Conosco"
- [ ] Botão flutuante do WhatsApp mantido (apenas para proposta)

### Analytics
- [ ] Evento `generate_lead` configurado no GTM para `/proposta-enviada`
- [ ] Conversão `generate_lead` configurada no Google Ads
- [ ] Palavras-chave negativas adicionadas na campanha
