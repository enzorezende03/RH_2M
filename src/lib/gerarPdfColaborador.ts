import jsPDF from "jspdf";

type Campo = { label: string; valor?: string | null };

export type DadosColaboradorPdf = {
  nomeCompleto: string;
  cargoVisivel?: string;
  dados: Record<string, string | number | null | undefined>;
  dependentes?: Array<Record<string, string>>;
};

const PAGE_W = 595.28; // A4 pt
const PAGE_H = 841.89;
const MARGIN_X = 36;
const MARGIN_TOP = 40;
const MARGIN_BOTTOM = 50;
const COLS = 5;
const COL_GAP = 10;
const ROW_H_LABEL = 11;
const ROW_H_VALUE_LINE = 11;
const SECTION_GAP = 14;

function v(d: DadosColaboradorPdf["dados"], key: string): string {
  const raw = d[key];
  if (raw === undefined || raw === null || raw === "") return "-";
  return String(raw);
}

export function gerarPdfColaborador(c: DadosColaboradorPdf): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const usableW = PAGE_W - MARGIN_X * 2;
  const colW = (usableW - COL_GAP * (COLS - 1)) / COLS;

  let cursorY = MARGIN_TOP;
  let pageNum = 1;
  const totalPagesPlaceholder = { current: 1 };
  const dataRef = new Date().toLocaleString("pt-BR");

  const drawHeader = () => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(20, 20, 20);
    doc.text(c.nomeCompleto.toUpperCase(), MARGIN_X, MARGIN_TOP);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(90, 90, 90);
    doc.text(c.cargoVisivel || "-", MARGIN_X, MARGIN_TOP + 14);

    // Marca 2M no canto direito
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(40, 80, 140);
    doc.text("2M", PAGE_W - MARGIN_X - 24, MARGIN_TOP);

    cursorY = MARGIN_TOP + 36;
  };

  const drawFooter = () => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`Data de referência: ${dataRef}`, MARGIN_X, PAGE_H - 24);
    doc.text(
      `${pageNum} de ${totalPagesPlaceholder.current} páginas`,
      PAGE_W - MARGIN_X,
      PAGE_H - 24,
      { align: "right" },
    );
  };

  const newPage = () => {
    drawFooter();
    doc.addPage();
    pageNum += 1;
    drawHeader();
  };

  const ensureSpace = (needed: number) => {
    if (cursorY + needed > PAGE_H - MARGIN_BOTTOM) newPage();
  };

  const drawSectionTitle = (title: string) => {
    ensureSpace(28);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    doc.text(title, MARGIN_X, cursorY);
    cursorY += 6;
    doc.setDrawColor(220, 220, 220);
    doc.line(MARGIN_X, cursorY, PAGE_W - MARGIN_X, cursorY);
    cursorY += 10;
  };

  const drawFields = (campos: Campo[]) => {
    for (let i = 0; i < campos.length; i += COLS) {
      const linha = campos.slice(i, i + COLS);

      // Calcula altura desta linha (maior valor com wrap)
      const valoresQuebrados = linha.map((f) => {
        const txt = (f.valor && f.valor.trim()) ? f.valor : "-";
        return doc.splitTextToSize(txt, colW);
      });
      const maxLinhas = Math.max(1, ...valoresQuebrados.map((l) => l.length));
      const alturaLinha = ROW_H_LABEL + maxLinhas * ROW_H_VALUE_LINE + 6;

      ensureSpace(alturaLinha);

      linha.forEach((f, idx) => {
        const x = MARGIN_X + idx * (colW + COL_GAP);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(50, 50, 50);
        doc.text(f.label, x, cursorY);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(20, 20, 20);
        doc.text(valoresQuebrados[idx], x, cursorY + ROW_H_LABEL);
      });

      cursorY += alturaLinha;
    }
    cursorY += SECTION_GAP - 6;
  };

  drawHeader();

  // ===== Dados Pessoais =====
  drawSectionTitle("Dados Pessoais");
  drawFields([
    { label: "Nome visível", valor: v(c.dados, "Nome visível") !== "-" ? v(c.dados, "Nome visível") : c.nomeCompleto },
    { label: "E-mail pessoal", valor: v(c.dados, "E-mail pessoal") },
    { label: "Celular", valor: v(c.dados, "Celular") },
    { label: "CPF", valor: v(c.dados, "CPF") },
    { label: "Nome da Mãe", valor: v(c.dados, "Nome da Mãe") },
    { label: "RG", valor: v(c.dados, "RG") },
    { label: "UF do RG", valor: v(c.dados, "UF do RG") },
    { label: "Sexo", valor: v(c.dados, "Sexo") },
    { label: "Gênero", valor: v(c.dados, "Gênero") },
    { label: "Etnia", valor: v(c.dados, "Etnia") },
    { label: "Sexualidade", valor: v(c.dados, "Sexualidade") },
    { label: "Grau de Instrução", valor: v(c.dados, "Grau de Instrução") },
    { label: "Estado Civil", valor: v(c.dados, "Estado Civil") },
    { label: "Data de Cadastro", valor: v(c.dados, "Data de Cadastro") },
    { label: "Data de Nascimento", valor: v(c.dados, "Data de Nascimento") },
  ]);

  // ===== Contato de emergência =====
  drawSectionTitle("Contato de emergência");
  drawFields([
    { label: "Tipo do Contato de Emergência", valor: v(c.dados, "Tipo do Contato de Emergência") },
    { label: "Nome do Contato de Emergência", valor: v(c.dados, "Nome do Contato de Emergência") },
    { label: "Telefone do Contato de Emergência", valor: v(c.dados, "Telefone do Contato de Emergência") },
  ]);

  // ===== Residência =====
  drawSectionTitle("Residência");
  drawFields([
    { label: "CEP", valor: v(c.dados, "CEP") },
    { label: "Endereço", valor: v(c.dados, "Endereço") },
    { label: "Número", valor: v(c.dados, "Número") },
    { label: "Complemento", valor: v(c.dados, "Complemento") },
    { label: "Bairro", valor: v(c.dados, "Bairro") },
    { label: "Município", valor: v(c.dados, "Município") },
    { label: "UF", valor: v(c.dados, "UF") },
  ]);

  // ===== Dependentes =====
  if (c.dependentes && c.dependentes.length > 0) {
    drawSectionTitle("Dependentes");
    c.dependentes.forEach((dep, idx) => {
      drawFields([
        { label: "Nome", valor: dep.nome || "-" },
        { label: "CPF", valor: dep.cpf || "-" },
        { label: "Data de Nascimento", valor: dep.dataNascimento || "-" },
        { label: "Tipo de Dependente", valor: dep.tipo || "-" },
        { label: "Dedução IRRF", valor: dep.deducaoIRRF || "-" },
        { label: "Salário Família", valor: dep.salarioFamilia || "-" },
        { label: "Deficiência", valor: dep.deficiencia || "-" },
      ]);
      if (idx < c.dependentes!.length - 1) cursorY += 4;
    });
  }

  // ===== Contrato =====
  drawSectionTitle("Contrato");
  drawFields([
    { label: "E-mail", valor: v(c.dados, "E-mail") },
    { label: "Data de admissão", valor: v(c.dados, "Data de admissão") },
    { label: "Matrícula", valor: v(c.dados, "Matrícula") },
    { label: "Tipo de vínculo", valor: v(c.dados, "Tipo de vínculo") },
    { label: "Observações", valor: v(c.dados, "Observações") },
    { label: "Jornada de trabalho", valor: v(c.dados, "Jornada de trabalho") },
  ]);

  // ===== Cargo =====
  drawSectionTitle("Cargo");
  drawFields([
    { label: "Cargo", valor: v(c.dados, "Cargo") },
    { label: "Cargo visível", valor: c.cargoVisivel || v(c.dados, "Cargo") },
    { label: "CBO", valor: v(c.dados, "CBO") },
    { label: "Nível Hierárquico", valor: v(c.dados, "Nível Hierárquico") },
    { label: "Nível salarial", valor: v(c.dados, "Nível salarial") },
    { label: "Departamento", valor: v(c.dados, "Departamento") },
    { label: "Unidade", valor: v(c.dados, "Unidade") },
    { label: "Gestor direto", valor: v(c.dados, "Gestor direto") },
    { label: "Grupos", valor: v(c.dados, "Grupos") },
  ]);

  // ===== CLT =====
  drawSectionTitle("CLT - Celetista");
  drawFields([
    { label: "Número da CTPS", valor: v(c.dados, "Número da CTPS") },
    { label: "Série da CTPS", valor: v(c.dados, "Série da CTPS") },
    { label: "Primeiro emprego", valor: v(c.dados, "Primeiro emprego") },
    { label: "PIS / PASEP", valor: v(c.dados, "PIS / PASEP") },
  ]);

  // ===== PJ =====
  drawSectionTitle("PJ - Pessoa Jurídica");
  drawFields([
    { label: "Razão Social", valor: v(c.dados, "PJ - Razão Social") },
    { label: "CNPJ", valor: v(c.dados, "PJ - CNPJ") },
    { label: "Nome fantasia", valor: v(c.dados, "PJ - Nome fantasia") },
    { label: "Inscrição Municipal", valor: v(c.dados, "PJ - Inscrição Municipal") },
    { label: "CEP", valor: v(c.dados, "PJ - CEP") },
    { label: "Endereço", valor: v(c.dados, "PJ - Endereço") },
    { label: "Número", valor: v(c.dados, "PJ - Número") },
    { label: "Complemento", valor: v(c.dados, "PJ - Complemento") },
    { label: "Bairro", valor: v(c.dados, "PJ - Bairro") },
    { label: "Município", valor: v(c.dados, "PJ - Município") },
    { label: "UF", valor: v(c.dados, "PJ - UF") },
  ]);

  // ===== Dados Bancários =====
  drawSectionTitle("Dados Bancários");
  drawFields([
    { label: "Banco", valor: v(c.dados, "Banco") },
    { label: "Tipo de Conta", valor: v(c.dados, "Tipo de Conta") },
    { label: "Número da Conta", valor: v(c.dados, "Número da Conta") },
    { label: "Dígito", valor: v(c.dados, "Dígito da Conta") },
    { label: "Número da Agência", valor: v(c.dados, "Número da Agência") },
    { label: "Dígito", valor: v(c.dados, "Dígito da Agência") },
    { label: "Chave Pix", valor: v(c.dados, "Chave Pix") },
  ]);

  // Atualiza total de páginas e redesenha rodapés
  totalPagesPlaceholder.current = pageNum;
  const total = pageNum;
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    // Sobrescreve rodapé com total correto
    doc.setFillColor(255, 255, 255);
    doc.rect(0, PAGE_H - 36, PAGE_W, 36, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`Data de referência: ${dataRef}`, MARGIN_X, PAGE_H - 24);
    doc.text(`${p} de ${total} páginas`, PAGE_W - MARGIN_X, PAGE_H - 24, { align: "right" });
  }

  return doc;
}

export function baixarPdfColaborador(c: DadosColaboradorPdf) {
  const doc = gerarPdfColaborador(c);
  const fileName = `${c.nomeCompleto.toUpperCase().replace(/\s+/g, "_")}.pdf`;
  doc.save(fileName);
}
