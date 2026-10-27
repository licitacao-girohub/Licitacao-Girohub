// Gera data/seed.json a partir de data/origem_checklist_v0.1.json (cópia fiel da planilha
// Checklist_Mestre_Licitacoes_GiroHub v0.1). Regras aplicadas, aprovadas em 16/10/2026:
//  - linhas compostas separadas (itens 4, 7 e 12);
//  - coluna Tipo (Obter / Produzir / Conquistar), conforme a apresentação à Diretoria;
//  - pasta do Drive (estrutura 00–11) e atalho de emissão (só links oficiais conhecidos).
// Uso: node data/build-seed.mjs
import fs from 'node:fs';

const src = JSON.parse(fs.readFileSync(new URL('./origem_checklist_v0.1.json', import.meta.url)));

const TIPO = {
  1: 'Obter', 2: 'Obter', 3: 'Obter', 4: 'Obter', 5: 'Obter', 6: 'Obter', 7: 'Obter', 8: 'Obter', 9: 'Obter', 10: 'Obter',
  11: 'Produzir', 12: 'Obter', 13: 'Obter', 14: 'Produzir', 15: 'Obter', 16: 'Produzir', 17: 'Conquistar', 18: 'Conquistar',
  19: 'Conquistar', 20: 'Conquistar', 21: 'Produzir', 22: 'Produzir', 23: 'Produzir', 24: 'Produzir', 25: 'Produzir',
  26: 'Produzir', 27: 'Produzir', 28: 'Produzir', 29: 'Obter', 30: 'Obter', 31: 'Obter', 32: 'Obter',
};
const P = {
  hab: '02_Habilitação_Jurídica_Fiscal', eco: '03_Econômico_Financeira', ate: '04_Atestados',
  tec: '05_Proposta_Técnica', com: '06_Proposta_Comercial', dec: '07_Declarações',
};
const PASTA = (n) => {
  if (n <= 10) return P.hab;
  if (n === 11 || n === 21 || n === 28) return P.dec;
  if (n <= 15) return P.eco;
  if (n <= 20) return P.ate;
  if (n === 22 || n === 23 || n === 32) return P.com;
  if (n <= 27) return P.tec;
  return P.hab; // 29, 30, 31
};
const LINK = {
  1: 'https://www.jucesponline.sp.gov.br/',
  3: 'https://www.jucesponline.sp.gov.br/',
  4: 'https://solucoes.receita.fazenda.gov.br/Servicos/cnpjreva/Cnpjreva_Solicitacao.asp',
  6: 'https://servicos.receitafederal.gov.br/servico/certidoes/#/home',
  9: 'https://consulta-crf.caixa.gov.br/consultacrf/pages/consultaEmpregador.jsf',
  10: 'https://cndt-certidao.tst.jus.br/inicio.faces',
  29: 'https://certidoes-apf.apps.tcu.gov.br/',
  30: 'https://www.gov.br/compras/pt-br',
};
const PILOTO = new Set([11, 14, 16, 21, 22, 23, 24, 26, 27]);
const OBS_PILOTO = 'Minuta v0.1 do piloto CRMV-ES gerada em 16/10/2026 (pasta Certames/CRMV-ES_DE-51-2026).';

const base = (r) => ({
  num: r.num,
  grupo: r.grupo,
  tipo: TIPO[r.num],
  item: r.item,
  base_legal: r.base_legal,
  onde_obter: r.onde_obter,
  validade_tipica: r.validade_tipica,
  responsavel: r.responsavel,
  recorrencia: r.recorrencia,
  status: PILOTO.has(r.num) ? 'Modelo pronto' : r.status,
  data_emissao: '',
  validade_dias: r.validade_dias ?? '',
  arquivo_id: '',
  arquivo_nome: '',
  arquivo_link: '',
  link_emissao: LINK[r.num] || '',
  pasta: PASTA(r.num),
  observacao: [r.observacao, PILOTO.has(r.num) ? OBS_PILOTO : ''].filter(Boolean).join(' '),
  atualizado_por: 'origem v0.1',
  atualizado_em: '2026-10-16',
});

const docs = [];
for (const r of src.checklist) {
  const b = base(r);
  const id = String(r.num).padStart(2, '0');
  if (r.num === 4) {
    docs.push({ ...b, id: '04a', item: 'Comprovante de inscrição no CNPJ – filial (55.055.533/0002-43)' });
    docs.push({ ...b, id: '04b', item: 'Comprovante de inscrição no CNPJ – matriz' });
  } else if (r.num === 7) {
    docs.push({ ...b, id: '07a', item: 'CND estadual – Bahia (filial)', onde_obter: 'SEFAZ-BA', link_emissao: 'https://www.sefaz.ba.gov.br/' });
    docs.push({ ...b, id: '07b', item: 'CND estadual – São Paulo (sede), se exigido', onde_obter: 'Fazenda / PGE de São Paulo' });
  } else if (r.num === 12) {
    docs.push({ ...b, id: '12a', item: 'Certidão negativa de falência e recuperação judicial – TJSP (sede)', onde_obter: 'TJSP (e-SAJ)', link_emissao: 'https://esaj.tjsp.jus.br/sco/abrirCadastro.do' });
    docs.push({ ...b, id: '12b', item: 'Certidão negativa de falência e recuperação judicial – TJBA (por cautela)', onde_obter: 'TJBA', link_emissao: 'https://www.tjba.jus.br/' });
  } else {
    docs.push({ ...b, id });
  }
}

const header = src.editais[0];
const editais = src.editais.slice(1).map((row) => Object.fromEntries(header.map((h, i) => [h, row[i] ?? ''])));

fs.writeFileSync(new URL('./seed.json', import.meta.url), JSON.stringify({ versao: '0.2 (sistema)', origem: 'Checklist_Mestre_Licitacoes_GiroHub v0.1 · 16/10/2026', documentos: docs, editais }, null, 1));
console.log(`seed.json: ${docs.length} documentos, ${editais.length} editais`);
