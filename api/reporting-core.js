function round2(value) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
}

function isIsoDate(value) {
  if (typeof value !== "string") return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function getPreviousDateIso(dateIso) {
  const previous = new Date(`${dateIso}T00:00:00Z`);
  previous.setUTCDate(previous.getUTCDate() - 1);
  return previous.toISOString().slice(0, 10);
}

function getPeriodoInicio(filters) {
  if (!filters) return null;
  if (filters.dataInicio) return filters.dataInicio;
  if (!filters.ano) return null;
  if (filters.semestre === "S2") return `${filters.ano}-07-01`;
  return `${filters.ano}-01-01`;
}

function buildPriorFilters(filters) {
  if (!filters) return null;
  const periodoInicio = getPeriodoInicio(filters);
  if (!periodoInicio) return null;

  return {
    ...filters,
    ano: undefined,
    semestre: undefined,
    dataInicio: undefined,
    dataFim: getPreviousDateIso(periodoInicio),
  };
}

function classificarStatusOrcamento(percentualExecutado) {
  if (percentualExecutado > 100) {
    return { chave: "alerta", rotulo: "Ultrapassou o orcamento" };
  }
  if (Math.abs(percentualExecutado - 100) < 0.01) {
    return { chave: "limite", rotulo: "No limite do orcamento" };
  }
  if (percentualExecutado >= 90) {
    return { chave: "proximo", rotulo: "Proximo do limite (90%+)" };
  }
  return { chave: "ok", rotulo: "Dentro do orcamento" };
}

export function parseFilters(query) {
  const ano = query.ano ? Number(query.ano) : undefined;
  const semestre = query.semestre === "S1" || query.semestre === "S2" ? query.semestre : undefined;
  const dataInicio = isIsoDate(query.dataInicio) ? query.dataInicio : undefined;
  const dataFim = isIsoDate(query.dataFim) ? query.dataFim : undefined;
  const topicoId =
    typeof query.topicoId === "string" && query.topicoId.length > 0 ? query.topicoId : undefined;

  return {
    ano: Number.isFinite(ano) ? ano : undefined,
    semestre,
    dataInicio,
    dataFim,
    topicoId,
  };
}

export function filtrarLancamentos(lancamentos, filters) {
  return lancamentos.filter((item) => {
    if (filters.ano && item.ano !== filters.ano) return false;
    if (filters.semestre && item.semestre !== filters.semestre) return false;
    if (filters.topicoId && item.topicoId !== filters.topicoId) return false;
    if (filters.dataInicio && item.data < filters.dataInicio) return false;
    if (filters.dataFim && item.data > filters.dataFim) return false;
    return true;
  });
}

export function montarResumo(topicos, todosLancamentos, filters) {
  const periodoLancamentos = filtrarLancamentos(todosLancamentos, filters);
  const priorFilters = buildPriorFilters(filters);
  const anterioresLancamentos = priorFilters
    ? filtrarLancamentos(todosLancamentos, priorFilters)
    : [];
  const topicosResumo = topicos.filter((topico) => topico?.incluirNoResumo !== false);

  const totaisPeriodoPorTopico = new Map();
  const totaisPeriodoS1PorTopico = new Map();
  const totaisPeriodoS2PorTopico = new Map();
  const totaisAnterioresPorTopico = new Map();

  for (const item of periodoLancamentos) {
    totaisPeriodoPorTopico.set(
      item.topicoId,
      (totaisPeriodoPorTopico.get(item.topicoId) ?? 0) + item.valor
    );
    if (item.semestre === "S1") {
      totaisPeriodoS1PorTopico.set(
        item.topicoId,
        (totaisPeriodoS1PorTopico.get(item.topicoId) ?? 0) + item.valor
      );
    } else if (item.semestre === "S2") {
      totaisPeriodoS2PorTopico.set(
        item.topicoId,
        (totaisPeriodoS2PorTopico.get(item.topicoId) ?? 0) + item.valor
      );
    }
  }

  for (const item of anterioresLancamentos) {
    totaisAnterioresPorTopico.set(
      item.topicoId,
      (totaisAnterioresPorTopico.get(item.topicoId) ?? 0) + item.valor
    );
  }

  const rows = topicosResumo.map((topico) => {
    const totalS1 = round2(totaisPeriodoS1PorTopico.get(topico.id) ?? 0);
    const totalS2 = round2(totaisPeriodoS2PorTopico.get(topico.id) ?? 0);
    const totalAno = round2(totalS1 + totalS2);
    const orcamentoProgramaBRL = Number(topico.orcamentoProgramaBRL ?? 0);
    const despesasAnteriores = round2(totaisAnterioresPorTopico.get(topico.id) ?? 0);
    const despesasPeriodo = round2(totaisPeriodoPorTopico.get(topico.id) ?? 0);
    const despesasAteData = round2(despesasAnteriores + despesasPeriodo);
    const saldoRemanescente = round2(orcamentoProgramaBRL - despesasAteData);
    const percentualExecutado =
      orcamentoProgramaBRL > 0
        ? round2((despesasAteData / orcamentoProgramaBRL) * 100)
        : despesasAteData > 0
          ? 999
          : 0;
    const statusExecucao = classificarStatusOrcamento(percentualExecutado);

    return {
      topicoId: topico.id,
      topico: topico.nome,
      grupo: topico.grupo,
      incluirNoResumo: Boolean(topico.incluirNoResumo),
      totalS1,
      totalS2,
      totalAno,
      orcamentoProgramaBRL,
      despesasAnteriores,
      despesasPeriodo,
      despesasAteData,
      saldoRemanescente,
      percentualExecutado,
      statusExecucao,
    };
  });

  const indicadores = {
    orcamentoProgramaBRL: round2(rows.reduce((sum, row) => sum + row.orcamentoProgramaBRL, 0)),
    despesasAnteriores: round2(rows.reduce((sum, row) => sum + row.despesasAnteriores, 0)),
    despesasPeriodo: round2(rows.reduce((sum, row) => sum + row.despesasPeriodo, 0)),
    despesasAteData: round2(rows.reduce((sum, row) => sum + row.despesasAteData, 0)),
    saldoRemanescente: round2(rows.reduce((sum, row) => sum + row.saldoRemanescente, 0)),
    percentualExecutado: 0,
    statusExecucao: { chave: "ok", rotulo: "Dentro do orcamento" },
  };
  indicadores.percentualExecutado =
    indicadores.orcamentoProgramaBRL > 0
      ? round2((indicadores.despesasAteData / indicadores.orcamentoProgramaBRL) * 100)
      : indicadores.despesasAteData > 0
        ? 999
        : 0;
  indicadores.statusExecucao = classificarStatusOrcamento(indicadores.percentualExecutado);

  const totalGeral = indicadores.despesasAteData;
  return { rows, totalGeral, indicadores };
}

export function getPeriodoEfetivo(filters, lancamentosFiltrados = []) {
  let inicio = null;
  let fim = null;

  if (filters?.dataInicio || filters?.dataFim) {
    inicio = filters.dataInicio ?? null;
    fim = filters.dataFim ?? null;
  } else if (filters?.ano) {
    const ano = String(filters.ano);
    if (filters.semestre === "S1") {
      inicio = `${ano}-01-01`;
      fim = `${ano}-06-30`;
    } else if (filters.semestre === "S2") {
      inicio = `${ano}-07-01`;
      fim = `${ano}-12-31`;
    } else {
      inicio = `${ano}-01-01`;
      fim = `${ano}-12-31`;
    }
  } else if (Array.isArray(lancamentosFiltrados) && lancamentosFiltrados.length > 0) {
    const datas = lancamentosFiltrados
      .map((item) => (isIsoDate(item?.data) ? item.data : null))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
    if (datas.length > 0) {
      inicio = datas[0];
      fim = datas[datas.length - 1];
    }
  }

  const label = inicio || fim ? `${inicio ?? "..."} ate ${fim ?? "..."}` : "Todos";
  return { inicio, fim, label };
}
