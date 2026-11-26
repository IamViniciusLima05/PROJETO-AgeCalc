/* AgeCalc — diferença exata de calendário (anos/meses/dias), aniversário, signos e marcos */

const $ = (s) => document.querySelector(s);
const banco = {
  ler(k, padrao) { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? padrao; } catch { return padrao; } },
  salvar(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sem storage */ } }
};
const num = (n, d = 0) => n.toLocaleString('pt-BR', { maximumFractionDigits: d, minimumFractionDigits: d });
const DIA = 864e5;
const fmtData = (d, opt = { day: '2-digit', month: 'long', year: 'numeric' }) => d.toLocaleDateString('pt-BR', opt);
const plural = (n, s, p) => `${num(n)} ${n === 1 ? s : p}`;
const diasNoMes = (a, m) => new Date(a, m + 1, 0).getDate();
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const lerData = (v) => { const [a, m, d] = v.split('-').map(Number); return new Date(a, m - 1, d); };

// anos, meses e dias "de calendário" (como se conta idade)
function diferenca(de, ate) {
  let dd = de.getDate();
  if (de.getMonth() === 1 && dd === 29 && diasNoMes(ate.getFullYear(), 1) === 28) dd = 28; // 29/02 conta como 28/02
  let a = ate.getFullYear() - de.getFullYear(), m = ate.getMonth() - de.getMonth(), d = ate.getDate() - dd;
  if (d < 0) { m--; d += diasNoMes(ate.getFullYear(), ate.getMonth() - 1); }
  if (m < 0) { a--; m += 12; }
  return { a, m, d };
}
// aniversário em ano não bissexto para quem nasceu em 29/02 → 28/02
function aniversarioEm(nasc, ano) { const d = Math.min(nasc.getDate(), diasNoMes(ano, nasc.getMonth())); return new Date(ano, nasc.getMonth(), d); }

const SIGNOS = [['Capricórnio', '♑', 1, 19], ['Aquário', '♒', 2, 18], ['Peixes', '♓', 3, 20], ['Áries', '♈', 4, 19], ['Touro', '♉', 5, 20], ['Gêmeos', '♊', 6, 20], ['Câncer', '♋', 7, 22], ['Leão', '♌', 8, 22], ['Virgem', '♍', 9, 22], ['Libra', '♎', 10, 22], ['Escorpião', '♏', 11, 21], ['Sagitário', '♐', 12, 21], ['Capricórnio', '♑', 13, 0]];
function signo(d) { const m = d.getMonth() + 1, dia = d.getDate(); const i = SIGNOS.findIndex(([, , mm, lim]) => mm === m) ; const s = dia <= SIGNOS[i][3] ? SIGNOS[i] : SIGNOS[i + 1]; return `${s[1]} ${s[0]}`; }
const CHINES = ['Macaco 🐒', 'Galo 🐓', 'Cão 🐕', 'Porco 🐖', 'Rato 🐀', 'Boi 🐂', 'Tigre 🐅', 'Coelho 🐇', 'Dragão 🐉', 'Serpente 🐍', 'Cavalo 🐎', 'Cabra 🐐'];
function geracao(a) {
  if (a >= 2013) return 'Geração Alpha'; if (a >= 1997) return 'Geração Z'; if (a >= 1981) return 'Millennial (Geração Y)';
  if (a >= 1965) return 'Geração X'; if (a >= 1946) return 'Baby Boomer'; return 'Geração Silenciosa';
}
const ESTACAO_SUL = (m, d) => { const k = m * 100 + d; if (k >= 321 && k < 621) return '🍂 Outono'; if (k >= 621 && k < 923) return '❄️ Inverno'; if (k >= 923 && k < 1221) return '🌸 Primavera'; return '☀️ Verão'; };
const PLANETAS = [['☿ Mercúrio', 0.2408467], ['♀ Vênus', 0.61519726], ['♂ Marte', 1.8808158], ['♃ Júpiter', 11.862615], ['♄ Saturno', 29.447498], ['⛢ Urano', 84.016846], ['♆ Netuno', 164.79132]];

/* ---------- Cálculo ---------- */
function calcular() {
  const vn = $('#nasc').value;
  if (!vn) { $('#resultado').hidden = true; $('#vazio').hidden = false; $('#vazio').textContent = 'Escolha sua data de nascimento para começar.'; return; }
  const nasc = lerData(vn);
  const hoje = new Date(); const ref = $('#ate').value ? lerData($('#ate').value) : new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  if (nasc > ref) { $('#resultado').hidden = true; $('#vazio').hidden = false; $('#vazio').textContent = '🤔 A data de nascimento está depois da data final.'; return; }
  banco.salvar('ac_nasc', vn); banco.salvar('ac_hora', $('#hora').value);
  $('#resultado').hidden = false; $('#vazio').hidden = true;

  const { a, m, d } = diferenca(nasc, ref);
  $('#r-anos').textContent = a; $('#r-meses').textContent = m; $('#r-dias').textContent = d;
  $('#r-anos').nextElementSibling.textContent = a === 1 ? 'ano' : 'anos'; $('#r-meses').nextElementSibling.textContent = m === 1 ? 'mês' : 'meses'; $('#r-dias').nextElementSibling.textContent = d === 1 ? 'dia' : 'dias';
  const ehHoje = ref.getMonth() === nasc.getMonth() && ref.getDate() === aniversarioEm(nasc, ref.getFullYear()).getDate();
  $('#resultado').classList.toggle('festa', ehHoje && a > 0);
  $('#frase').innerHTML = ehHoje && a > 0 ? `🎉 <b>Feliz aniversário!</b> Hoje você completa ${a} anos.` : `Você nasceu ${[0, 6].includes(nasc.getDay()) ? 'num' : 'numa'} <b>${fmtData(nasc, { weekday: 'long' })}</b>, ${fmtData(nasc)}.`;

  // próximo aniversário
  let prox = aniversarioEm(nasc, ref.getFullYear()); if (prox <= ref) prox = aniversarioEm(nasc, ref.getFullYear() + 1);
  const ult = aniversarioEm(nasc, prox.getFullYear() - 1);
  const falta = Math.round((prox - ref) / DIA), dfal = diferenca(ref, prox);
  $('#niver-falta').textContent = ehHoje ? 'É hoje! 🥳' : falta === 1 ? 'Amanhã!' : `${dfal.m ? plural(dfal.m, 'mês', 'meses') + (dfal.d ? ' e ' : '') : ''}${dfal.d ? plural(dfal.d, 'dia', 'dias') : ''}`;
  $('#niver-data').textContent = `${a + (ehHoje ? 0 : 1)} anos em ${fmtData(prox, { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}${ehHoje ? '' : ` · faltam ${plural(falta, 'dia', 'dias')}`}`;
  const pct = ehHoje ? 100 : Math.round(((ref - ult) / (prox - ult)) * 100);
  $('#niver-barra').style.width = pct + '%'; $('#niver-pct').textContent = `${pct}% do caminho até o próximo aniversário`;

  // totais (usa hora se informada)
  const [hh, mm] = ($('#hora').value || '00:00').split(':').map(Number);
  const nascHora = new Date(nasc.getFullYear(), nasc.getMonth(), nasc.getDate(), hh, mm);
  const fim = $('#ate').value ? ref : new Date();
  const ms = Math.max(0, fim - nascHora), dias = Math.floor((ref - nasc) / DIA + 0.5);
  $('#totais').innerHTML = [
    ['Meses', num(a * 12 + m)], ['Semanas', num(Math.floor(dias / 7))], ['Dias', num(dias)],
    ['Horas', num(Math.floor(ms / 36e5))], ['Minutos', num(Math.floor(ms / 6e4))],
    ['Batidas do coração*', '≈ ' + num(Math.round(ms / 6e4 * 80 / 1e6)) + ' milhões'], ['Respirações*', '≈ ' + num(Math.round(ms / 6e4 * 15 / 1e6)) + ' milhões']
  ].map(([k, v]) => `<li><span>${k}</span><b>${v}</b></li>`).join('') + '<li><span style="font-size:12px">* estimativa com 80 bpm e 15 respirações por minuto</span></li>';

  $('#sobre').innerHTML = [
    ['Dia da semana', fmtData(nasc, { weekday: 'long' })], ['Signo', signo(nasc)], ['Horóscopo chinês*', CHINES[nasc.getFullYear() % 12]],
    ['Geração', geracao(nasc.getFullYear())], ['Estação (hemisfério sul)', ESTACAO_SUL(nasc.getMonth() + 1, nasc.getDate())],
    ['Ano bissexto?', (nasc.getFullYear() % 4 === 0 && nasc.getFullYear() % 100 !== 0) || nasc.getFullYear() % 400 === 0 ? 'Sim' : 'Não'],
    ['Aniversários já vividos', num(a)]
  ].map(([k, v]) => `<li><span>${k}</span><b>${v}</b></li>`).join('') + '<li><span style="font-size:12px">* pelo ano civil; o ano chinês começa entre janeiro e fevereiro</span></li>';

  const anosExatos = (ref - nasc) / DIA / 365.2422;
  $('#planetas').innerHTML = PLANETAS.map(([p, per]) => `<li><span>${p}</span><b>${num(anosExatos / per, anosExatos / per < 10 ? 1 : 0)} anos</b></li>`).join('');

  // marcos em dias e idades redondas
  const marcos = [1000, 5000, 10000, 15000, 20000, 25000, 30000].map((n) => ({ t: `${num(n)} dias`, d: new Date(nasc.getTime() + n * DIA) }))
    .concat([18, 30, 50, 60, 80, 100].map((n) => ({ t: `${n} anos`, d: aniversarioEm(nasc, nasc.getFullYear() + n) })))
    .concat([{ t: '1 bilhão de segundos', d: new Date(nascHora.getTime() + 1e9 * 1000) }])
    .sort((x, y) => x.d - y.d);
  const iProx = marcos.findIndex((x) => x.d > ref);
  $('#marcos').innerHTML = marcos.map((x, i) => {
    const dd = Math.round((x.d - ref) / DIA);
    return `<li class="${x.d <= ref ? 'passou' : i === iProx ? 'prox' : ''}"><b>${i === iProx ? '⭐ ' : x.d <= ref ? '✓ ' : ''}${x.t}</b><span>${fmtData(x.d)}${dd > 0 ? ` · em ${plural(dd, 'dia', 'dias')}` : dd === 0 ? ' · hoje!' : ''}</span></li>`;
  }).join('');
  resumo = `Tenho ${a} anos, ${plural(m, 'mês', 'meses')} e ${plural(d, 'dia', 'dias')} — já são ${num(dias)} dias de vida! Próximo aniversário: ${fmtData(prox)}. (AgeCalc)`;
}
let resumo = '';

/* ---------- Eventos ---------- */
['#nasc', '#ate', '#hora'].forEach((s) => $(s).addEventListener('input', calcular));
$('#form').addEventListener('submit', (e) => e.preventDefault());
$('#copiar').addEventListener('click', async () => { try { await navigator.clipboard.writeText(resumo); toast('Resumo copiado!'); } catch { toast('Não foi possível copiar'); } });
let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2200); }

$('#nasc').max = iso(new Date());
$('#nasc').value = banco.ler('ac_nasc', ''); $('#hora').value = banco.ler('ac_hora', '');
calcular();
