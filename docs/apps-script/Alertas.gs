/**
 * Alertas de vencimento · Checklist mestre de licitações GiroHub
 *
 * Roda DENTRO da planilha "Checklist Mestre – Licitações GiroHub (Sistema)", na conta licitacao@girohub.com.br
 * (Extensões → Apps Script). Envia um e-mail por dia, só quando há aviso novo:
 *   - documentos que chegam a 30, 15, 7, 1 ou 0 dia do vencimento;
 *   - às segundas-feiras, também o resumo semanal (conformidade, vencidos, próximos 30 dias, sem data).
 * Cada aviso enviado fica registrado na aba "Alertas_enviados" (o mesmo aviso nunca sai duas vezes).
 *
 * Instalação: veja docs/apps-script/COMO-INSTALAR.md. Depois de colar, rode uma vez a função `instalar`.
 * Regras iguais às do sistema (lib/model.ts): vence = data de emissão + validade (dias);
 * conforme = "Validado" e dentro do prazo; "Não se aplica" fica fora da conta.
 */

// ===================== CONFIGURAÇÃO =====================
var CONFIG = {
  destinatarios: 'licitacao@girohub.com.br',   // vários: separe por vírgula
  linkSistema: '',                              // ex.: https://girohub-licitacoes.vercel.app (preencha depois do deploy)
  horaEnvio: 7,                                 // hora do envio diário (horário de Brasília)
  marcos: [30, 15, 7, 1, 0],
  fuso: 'America/Sao_Paulo',
};
// ========================================================

var ABA_DOCS = 'Documentos';
var ABA_ENVIADOS = 'Alertas_enviados';

/** Cria (ou recria) o gatilho diário. Rode UMA vez depois de colar o script. */
function instalar() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'enviarAlertas') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('enviarAlertas').timeBased().everyDays(1).atHour(CONFIG.horaEnvio).inTimezone(CONFIG.fuso).create();
  Logger.log('Gatilho diário criado para ' + CONFIG.horaEnvio + 'h (' + CONFIG.fuso + '). Envio para: ' + CONFIG.destinatarios);
}

/** Envia agora um e-mail de TESTE com a situação atual (não registra nada em Alertas_enviados). */
function testarEnvio() {
  var r = montar_(true);
  enviar_(r, true);
  Logger.log('Teste enviado para ' + CONFIG.destinatarios + '. Avisos: ' + r.avisos.length + '; vencidos: ' + r.resumo.vencidos.length);
}

/** Função chamada pelo gatilho diário. */
function enviarAlertas() {
  var trava = LockService.getScriptLock();
  if (!trava.tryLock(30000)) return;
  try {
    var r = montar_(false);
    if (!r.avisos.length && !r.segunda) return; // nada novo e não é segunda: não envia
    enviar_(r, false);
    var aba = abaEnviados_();
    var agora = new Date().toISOString();
    r.avisos.forEach(function (a) {
      aba.appendRow([a.id, a.dias, a.venceEm, agora, CONFIG.destinatarios]);
    });
  } finally {
    trava.releaseLock();
  }
}

// ----------------------------------------------------------------------------------------------
// Leitura da planilha
// ----------------------------------------------------------------------------------------------
function montar_(teste) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var aba = ss.getSheetByName(ABA_DOCS);
  if (!aba) throw new Error('Aba "' + ABA_DOCS + '" não encontrada.');
  var valores = aba.getDataRange().getValues();
  var cab = valores[0].map(String);
  var col = function (nome) { var i = cab.indexOf(nome); if (i < 0) throw new Error('Coluna "' + nome + '" não encontrada.'); return i; };
  var C = { id: col('id'), item: col('item'), resp: col('responsavel'), status: col('status'), data: col('data_emissao'), dias: col('validade_dias') };
  var linhas = valores.slice(1).filter(function (v) { return String(v[C.id]).trim(); }).map(function (v) {
    return {
      id: String(v[C.id]).replace(/^'+/, ''), item: String(v[C.item]), responsavel: String(v[C.resp]), status: String(v[C.status]),
      dataEmissao: paraIso_(v[C.data]), validadeDias: v[C.dias] === '' || v[C.dias] === null ? '' : Number(v[C.dias]),
    };
  });
  var hoje = Utilities.formatDate(new Date(), CONFIG.fuso, 'yyyy-MM-dd');
  var enviados = teste ? {} : chavesEnviadas_();
  return calcular(linhas, hoje, enviados, CONFIG.marcos);
}

function chavesEnviadas_() {
  var aba = abaEnviados_();
  var v = aba.getDataRange().getValues().slice(1);
  var mapa = {};
  v.forEach(function (l) { mapa[String(l[0]).replace(/^'+/, '') + '|' + Number(l[1]) + '|' + paraIso_(l[2])] = true; });
  return mapa;
}

function abaEnviados_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var aba = ss.getSheetByName(ABA_ENVIADOS);
  if (!aba) {
    aba = ss.insertSheet(ABA_ENVIADOS);
    aba.appendRow(['documento_id', 'marco_dias', 'vence_em', 'enviado_em', 'destinatario']);
  }
  return aba;
}

function paraIso_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, CONFIG.fuso, 'yyyy-MM-dd');
  var s = String(v || '').trim();
  var br = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (br) return br[3] + '-' + br[2] + '-' + br[1];
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : '';
}

// ----------------------------------------------------------------------------------------------
// Regras (função pura — testável fora do Google)
// ----------------------------------------------------------------------------------------------
function calcular(linhas, hoje, enviados, marcos) {
  var DIA = 86400000;
  var utc = function (iso) { var p = iso.split('-').map(Number); return Date.UTC(p[0], p[1] - 1, p[2]); };
  var soma = function (iso, d) { return new Date(utc(iso) + d * DIA).toISOString().slice(0, 10); };
  var avisos = [], vencidos = [], proximos = [], semData = [];
  var total = 0, conformes = 0;

  linhas.forEach(function (d) {
    if (d.status === 'Não se aplica') return;
    total += 1;
    var temPrazo = d.validadeDias !== '' && Number(d.validadeDias) > 0;
    var venceEm = null, dias = null;
    if (temPrazo && d.dataEmissao) {
      venceEm = soma(d.dataEmissao, Number(d.validadeDias));
      dias = Math.round((utc(venceEm) - utc(hoje)) / DIA);
    }
    var x = { id: d.id, item: d.item, responsavel: d.responsavel, status: d.status, venceEm: venceEm, dias: dias };
    if (temPrazo && !d.dataEmissao) semData.push(x);
    if (dias !== null && dias < 0) vencidos.push(x);
    if (dias !== null && dias >= 0 && dias <= 30) proximos.push(x);
    if (dias !== null && marcos.indexOf(dias) >= 0 && !enviados[d.id + '|' + dias + '|' + venceEm]) avisos.push(x);
    var vencido = dias !== null && dias < 0;
    var semDataComPrazo = temPrazo && !d.dataEmissao;
    if (d.status === 'Validado' && !vencido && !semDataComPrazo) conformes += 1;
  });

  var porDias = function (a, b) { return a.dias - b.dias; };
  avisos.sort(porDias); vencidos.sort(porDias); proximos.sort(porDias);
  var diaSemana = new Date(utc(hoje)).getUTCDay(); // 1 = segunda
  return {
    hoje: hoje, segunda: diaSemana === 1, avisos: avisos,
    resumo: { total: total, conformes: conformes, pct: total ? Math.round((conformes / total) * 1000) / 10 : null, vencidos: vencidos, proximos: proximos, semData: semData },
  };
}

// ----------------------------------------------------------------------------------------------
// E-mail
// ----------------------------------------------------------------------------------------------
function enviar_(r, teste) {
  var br = function (iso) { if (!iso) return '—'; var p = iso.split('-'); return p[2] + '/' + p[1] + '/' + p[0]; };
  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
  var quando = function (d) { return d === 0 ? 'vence hoje' : d < 0 ? 'vencido há ' + (-d) + ' dia(s)' : d + ' dia(s)'; };
  var tabela = function (lista, mostrarDias) {
    if (!lista.length) return '<p style="color:#657386;margin:4px 0 12px">Nenhum.</p>';
    var th = 'style="text-align:left;padding:6px 8px;background:#0F2B57;color:#fff;font-size:12px"';
    var td = 'style="padding:6px 8px;border-bottom:1px solid #E3E8F0;font-size:13px;vertical-align:top"';
    var h = '<table style="border-collapse:collapse;width:100%;max-width:720px;margin:4px 0 14px"><tr>'
      + '<th ' + th + '>#</th><th ' + th + '>Documento</th><th ' + th + '>Vence em</th>' + (mostrarDias ? '<th ' + th + '>Prazo</th>' : '') + '<th ' + th + '>Responsável</th></tr>';
    lista.forEach(function (x) {
      h += '<tr><td ' + td + '>' + esc(x.id) + '</td><td ' + td + '>' + esc(x.item) + '</td><td ' + td + '>' + br(x.venceEm) + '</td>'
        + (mostrarDias ? '<td ' + td + '>' + quando(x.dias) + '</td>' : '') + '<td ' + td + '>' + esc(x.responsavel) + '</td></tr>';
    });
    return h + '</table>';
  };

  var dataBr = br(r.hoje);
  var assunto = (teste ? '[TESTE] ' : '') + (r.avisos.length ? '[Licitações] Documentos vencendo — ' + dataBr : '[Licitações] Resumo semanal — ' + dataBr);
  var h2 = 'style="color:#0F2B57;font-size:16px;margin:18px 0 6px"';
  var corpo = '<div style="font-family:Arial,Helvetica,sans-serif;color:#192434">'
    + '<p style="font-size:11px;letter-spacing:.1em;color:#0A85FF;font-weight:bold;margin:0">GIROHUB · CHECKLIST MESTRE DE LICITAÇÕES</p>';

  if (r.avisos.length) {
    corpo += '<h2 ' + h2 + '>Avisos de hoje (30, 15, 7, 1 e 0 dia)</h2>' + tabela(r.avisos, true);
  }
  if (r.segunda || teste) {
    var s = r.resumo;
    corpo += '<h2 ' + h2 + '>Resumo semanal</h2>'
      + '<p style="font-size:14px;margin:4px 0 10px"><b>Conformidade geral: ' + (s.pct === null ? '—' : String(s.pct).replace('.', ',') + '%') + '</b> '
      + '(' + s.conformes + ' de ' + s.total + ' validados e no prazo; "Não se aplica" fica fora da conta)</p>'
      + '<h3 style="font-size:14px;margin:12px 0 4px">Vencidos (' + s.vencidos.length + ')</h3>' + tabela(s.vencidos, true)
      + '<h3 style="font-size:14px;margin:12px 0 4px">Vencem nos próximos 30 dias (' + s.proximos.length + ')</h3>' + tabela(s.proximos, true)
      + '<h3 style="font-size:14px;margin:12px 0 4px">Com validade e sem data de emissão (' + s.semData.length + ')</h3>' + tabela(s.semData, false);
  }
  if (CONFIG.linkSistema) corpo += '<p style="margin-top:16px"><a href="' + CONFIG.linkSistema + '" style="color:#0A85FF">Abrir o sistema</a></p>';
  corpo += '<p style="font-size:11px;color:#657386;margin-top:18px">Datas calculadas pela data de emissão + validade cadastradas no sistema. '
    + 'Confira sempre a data impressa no documento e o prazo que o edital fixar.</p></div>';

  MailApp.sendEmail({ to: CONFIG.destinatarios, subject: assunto, htmlBody: corpo, name: 'Licitações GiroHub' });
}

// Exporta a função pura para testes fora do Google (ignorado no Apps Script).
if (typeof module !== 'undefined') module.exports = { calcular: calcular };
