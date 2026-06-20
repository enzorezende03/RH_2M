import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Eye,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Settings,
  User,
  FileText,
  Calculator,
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CalendarDays,
  Tag,
  X,
  Check,
} from "lucide-react";

import { useColaboradores } from "@/stores/colaboradoresStore";
import ImportadorPage from "@/components/ImportadorPage";
import templateSaldo from "@/assets/importador_config_saldo_ferias.xlsx.asset.json";
import templateSolicitacoes from "@/assets/importador_ferias_e_recesso.xlsx.asset.json";

type Etapa = "Análise Gestor" | "Análise RH" | "Documentação" | "Reprovada" | "Concluída" | "Cancelada";

interface Solicitacao {
  id: string;
  colaborador: string;
  cargo: string;
  gestor: string;
  dataSolicitacao: string;
  inicio: string;
  fim: string;
  etapa: Etapa;
}

const MOCK: Solicitacao[] = [
  // Análise Gestor (3)
  { id: "ag1", colaborador: "LAURA VITÓRIA DE SOUZA ROBERTO", cargo: "Auxiliar", gestor: "ANA CAROLINA BRAGA DE MOURA", dataSolicitacao: "09/06/2026", inicio: "27/07/2026", fim: "31/07/2026", etapa: "Análise Gestor" },
  { id: "ag2", colaborador: "STEPHANY OLIVEIRA", cargo: "Recepcionista I", gestor: "ANA CAROLINA BRAGA DE MOURA", dataSolicitacao: "16/06/2026", inicio: "24/08/2026", fim: "28/08/2026", etapa: "Análise Gestor" },
  { id: "ag3", colaborador: "THALITA ARAUJO DE OLIVEIRA", cargo: "Analista III", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "09/09/2025", inicio: "21/12/2026", fim: "31/12/2026", etapa: "Análise Gestor" },

  // Análise RH (13)
  { id: "rh1", colaborador: "THALITA ARAUJO DE OLIVEIRA", cargo: "Analista III", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "09/09/2025", inicio: "20/07/2026", fim: "24/07/2026", etapa: "Análise RH" },
  { id: "rh2", colaborador: "MARIA EDUARDA COSTA GONÇALVES", cargo: "Assistente", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "25/03/2026", inicio: "27/07/2026", fim: "31/07/2026", etapa: "Análise RH" },
  { id: "rh3", colaborador: "THALITA RODRIGUES GUEDES", cargo: "Auxiliar", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "05/05/2026", inicio: "29/07/2026", fim: "11/08/2026", etapa: "Análise RH" },
  { id: "rh4", colaborador: "GABRIELA CALDEIRA NUNES VERA", cargo: "Assistente", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "10/05/2026", inicio: "03/08/2026", fim: "13/08/2026", etapa: "Análise RH" },
  { id: "rh5", colaborador: "ANA CLÁUDIA ROSSI", cargo: "ANALISTA III - Step 1", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "10/06/2026", inicio: "03/08/2026", fim: "07/08/2026", etapa: "Análise RH" },
  { id: "rh6", colaborador: "JANAINA MARIANI", cargo: "Analista III", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "29/01/2026", inicio: "10/08/2026", fim: "24/08/2026", etapa: "Análise RH" },
  { id: "rh7", colaborador: "STEFANY MELGACO LAVINSKY", cargo: "Analista I", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "14/05/2026", inicio: "10/08/2026", fim: "24/08/2026", etapa: "Análise RH" },
  { id: "rh8", colaborador: "LIVIA GARCIA XAVIER", cargo: "Analista III", gestor: "ANA CAROLINA BRAGA DE MOURA", dataSolicitacao: "07/11/2025", inicio: "17/08/2026", fim: "01/09/2026", etapa: "Análise RH" },
  { id: "rh9", colaborador: "ANDREZA FERNANDA TEIXEIRA DA SILVA", cargo: "Analista I", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "19/01/2026", inicio: "21/09/2026", fim: "30/09/2026", etapa: "Análise RH" },
  { id: "rh10", colaborador: "CAMILA OLIVEIRA MACEDO", cargo: "Analista I", gestor: "LIVIA GARCIA XAVIER", dataSolicitacao: "20/01/2026", inicio: "21/09/2026", fim: "30/09/2026", etapa: "Análise RH" },
  { id: "rh11", colaborador: "BRUNA LOPES PEREIRA", cargo: "Assistente", gestor: "LIVIA GARCIA XAVIER", dataSolicitacao: "11/02/2026", inicio: "05/10/2026", fim: "14/10/2026", etapa: "Análise RH" },
  { id: "rh12", colaborador: "FERNANDA FABIANA DA SILVA", cargo: "Assistente", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "20/02/2026", inicio: "12/10/2026", fim: "26/10/2026", etapa: "Análise RH" },
  { id: "rh13", colaborador: "MAIANE KELLY DIAS", cargo: "Assistente", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "02/03/2026", inicio: "19/10/2026", fim: "28/10/2026", etapa: "Análise RH" },

  // Documentação (1)
  { id: "doc1", colaborador: "SULAMITA BRAS DE OLIVEIRA MACHADO", cargo: "Assistente Financeiro/RH", gestor: "ANA CAROLINA BRAGA DE MOURA", dataSolicitacao: "09/02/2026", inicio: "16/07/2026", fim: "30/07/2026", etapa: "Documentação" },

  // Reprovada (10)
  { id: "rep1", colaborador: "JESSYCA LOPES", cargo: "Analista III", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "10/07/2024", inicio: "29/07/2024", fim: "02/08/2024", etapa: "Reprovada" },
  { id: "rep2", colaborador: "ANA CAROLINA LOURENCO GOMES", cargo: "Analista III", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "27/08/2024", inicio: "16/09/2024", fim: "20/09/2024", etapa: "Reprovada" },
  { id: "rep3", colaborador: "BRUNA LOPES PEREIRA", cargo: "Assistente", gestor: "LIVIA GARCIA XAVIER", dataSolicitacao: "16/01/2025", inicio: "02/01/2025", fim: "09/01/2025", etapa: "Reprovada" },
  { id: "rep4", colaborador: "TATIANA MAGDA DO NASCIMENTO", cargo: "Assistente", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "07/01/2025", inicio: "27/01/2025", fim: "11/02/2025", etapa: "Reprovada" },
  { id: "rep5", colaborador: "ÁGATHA PEREIRA", cargo: "Assistente", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "23/01/2025", inicio: "07/04/2025", fim: "15/04/2025", etapa: "Reprovada" },
  { id: "rep6", colaborador: "STEFANY MELGACO LAVINSKY", cargo: "Analista I", gestor: "LIVIA GARCIA XAVIER", dataSolicitacao: "07/03/2025", inicio: "22/04/2025", fim: "26/04/2025", etapa: "Reprovada" },
  { id: "rep7", colaborador: "FERNANDA FABIANA DA SILVA", cargo: "Assistente", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "16/09/2024", inicio: "12/05/2025", fim: "26/05/2025", etapa: "Reprovada" },
  { id: "rep8", colaborador: "JANAINA MARIANI", cargo: "Analista III", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "24/04/2025", inicio: "16/06/2025", fim: "25/06/2025", etapa: "Reprovada" },
  { id: "rep9", colaborador: "TATIANA MAGDA DO NASCIMENTO", cargo: "Assistente", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "17/01/2025", inicio: "14/07/2025", fim: "27/07/2025", etapa: "Reprovada" },
  { id: "rep10", colaborador: "MAIANE KELLY DIAS", cargo: "Assistente", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "23/01/2025", inicio: "21/07/2025", fim: "31/07/2025", etapa: "Reprovada" },

  // Concluída
  { id: "c1", colaborador: "ERICK VINICIOS BORGES PIRES", cargo: "Auxiliar", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "29/08/2024", inicio: "04/10/2023", fim: "13/10/2023", etapa: "Concluída" },
  { id: "c2", colaborador: "JAMILA SILVEIRA COSTA", cargo: "Analista I", gestor: "LIVIA GARCIA XAVIER", dataSolicitacao: "29/08/2024", inicio: "21/12/2023", fim: "30/12/2023", etapa: "Concluída" },
  { id: "c3", colaborador: "JESSYCA LOPES", cargo: "Analista III", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "29/08/2024", inicio: "21/12/2023", fim: "30/12/2023", etapa: "Concluída" },
  { id: "c4", colaborador: "DANIELLE CAMPOS MILLIOR", cargo: "ANALISTA III - Step 2", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "29/08/2024", inicio: "21/12/2023", fim: "30/12/2023", etapa: "Concluída" },
  { id: "c5", colaborador: "LIVIA GARCIA XAVIER", cargo: "Analista III", gestor: "ANA CAROLINA BRAGA DE MOURA", dataSolicitacao: "29/08/2024", inicio: "21/12/2023", fim: "30/12/2023", etapa: "Concluída" },

  // Cancelada (10)
  { id: "ca1", colaborador: "LORENA CARDOSO DE OLIVEIRA", cargo: "Analista I", gestor: "LIVIA GARCIA XAVIER", dataSolicitacao: "11/04/2024", inicio: "16/04/2024", fim: "15/05/2024", etapa: "Cancelada" },
  { id: "ca2", colaborador: "BRUNA LOPES PEREIRA", cargo: "Assistente", gestor: "ANA CAROLINA BRAGA DE MOURA", dataSolicitacao: "05/04/2024", inicio: "17/07/2024", fim: "29/07/2024", etapa: "Cancelada" },
  { id: "ca3", colaborador: "ISAMARA CRISTINA GOMES PEDRA", cargo: "Analista III", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "21/03/2024", inicio: "18/07/2024", fim: "01/08/2024", etapa: "Cancelada" },
  { id: "ca4", colaborador: "BRUNA LOPES PEREIRA", cargo: "Assistente", gestor: "LIVIA GARCIA XAVIER", dataSolicitacao: "16/04/2024", inicio: "22/07/2024", fim: "26/07/2024", etapa: "Cancelada" },
  { id: "ca5", colaborador: "LIVIA GARCIA XAVIER", cargo: "Analista III", gestor: "ANA CAROLINA BRAGA DE MOURA", dataSolicitacao: "09/04/2024", inicio: "19/08/2024", fim: "01/09/2024", etapa: "Cancelada" },
  { id: "ca6", colaborador: "JESSYCA LOPES", cargo: "Analista III", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "10/07/2024", inicio: "19/09/2024", fim: "02/10/2024", etapa: "Cancelada" },
  { id: "ca7", colaborador: "BRUNA LOPES PEREIRA", cargo: "Assistente", gestor: "LIVIA GARCIA XAVIER", dataSolicitacao: "18/06/2024", inicio: "23/09/2024", fim: "30/09/2024", etapa: "Cancelada" },
  { id: "ca8", colaborador: "CAMILA OLIVEIRA MACEDO", cargo: "Analista I", gestor: "LIVIA GARCIA XAVIER", dataSolicitacao: "18/06/2024", inicio: "23/09/2024", fim: "07/10/2024", etapa: "Cancelada" },
  { id: "ca9", colaborador: "CAMILA OLIVEIRA MACEDO", cargo: "Analista I", gestor: "LIVIA GARCIA XAVIER", dataSolicitacao: "27/08/2024", inicio: "23/09/2024", fim: "27/09/2024", etapa: "Cancelada" },
  { id: "ca10", colaborador: "ERICK VINICIOS BORGES PIRES", cargo: "Auxiliar", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "17/06/2024", inicio: "24/09/2024", fim: "03/10/2024", etapa: "Cancelada" },
];

const etapaCor: Record<Etapa, string> = {
  "Análise Gestor": "bg-orange-100 text-orange-700 hover:bg-orange-100",
  "Análise RH": "bg-blue-100 text-blue-700 hover:bg-blue-100",
  Documentação: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  Reprovada: "bg-red-100 text-red-700 hover:bg-red-100",
  Concluída: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  Cancelada: "bg-gray-200 text-gray-700 hover:bg-gray-200",
};

const DICAS_SALDO = [
  { titulo: "A. E-mail (Obrigatório)", conteudo: "Nesta coluna, coloca-se o e-mail do colaborador." },
  { titulo: "B. Início do primeiro período aquisitivo (Obrigatório)", conteudo: "A data de início do primeiro período aquisitivo do colaborador.\nExemplo: 19/08/2024" },
  { titulo: "C. Tipo de vínculo", conteudo: "Nesta coluna, os itens possíveis são:\n• CLT\n• PJ\n• Estágio\n• Sócio\n• Cooperado\n• Jovem Aprendiz\n• Freelancer" },
];

const DICAS_SOLICITACOES = [
  { titulo: "A. Identificador (Obrigatório)", conteudo: "Nessa coluna, coloca-se o identificador do colaborador cadastrado na plataforma (E-mail ou CPF)." },
  { titulo: "B. Data de início das férias/recesso/descanso (Obrigatório)", conteudo: "Data de início das férias/recesso/descanso.\nExemplo: 19/08/2024" },
  { titulo: "C. Data fim das férias/recesso/descanso (Obrigatório)", conteudo: "Data fim das férias/recesso/descanso.\nExemplo: 19/08/2024" },
  { titulo: "D. Dias vendidos", conteudo: "Número de dias vendidos.\nCampo opcional." },
  { titulo: "E. Adiantamento 13º", conteudo: "Se na solicitação foi feito adiantamento do 13º salário.\nCampo opcional.\nPor padrão receberá o valor 'Não'." },
];

type ImportView = "none" | "saldo" | "solicitacoes";

interface SaldoRow {
  id: string;
  colaborador: string;
  cargo: string;
  gestor: string;
  vinculo: string;
  periodoAquisitivo: string;
  saldo: number;
  dataLimite: string;
  aVencerDias: number;
  cadastroIncompleto?: boolean;
  emDobro?: boolean;
}

const MOCK_SALDOS: SaldoRow[] = [
  { id: "s1", colaborador: "DANIELA NASCIMENTO COSTA BICALHO", cargo: "Coordenadora", gestor: "ANA CAROLINA BRAGA DE MOURA", vinculo: "CLT", periodoAquisitivo: "2024/2025", saldo: 16, dataLimite: "15/10/2026", aVencerDias: 117 },
  { id: "s2", colaborador: "JESSYCA LOPES", cargo: "Analista III", gestor: "DANIELA NASCIMENTO COSTA BICALHO", vinculo: "CLT", periodoAquisitivo: "2024/2025", saldo: 5, dataLimite: "19/11/2026", aVencerDias: 152 },
  { id: "s3", colaborador: "DANIELLE CAMPOS MILLIOR", cargo: "ANALISTA III - Step 2", gestor: "DANIELA NASCIMENTO COSTA BICALHO", vinculo: "CLT", periodoAquisitivo: "2024/2025", saldo: 11, dataLimite: "20/11/2026", aVencerDias: 153 },
  { id: "s4", colaborador: "EVELYN CRISTINA MAGALHÃES SILVA", cargo: "Assistente", gestor: "DANIELA NASCIMENTO COSTA BICALHO", vinculo: "CLT", periodoAquisitivo: "2024/2025", saldo: 16, dataLimite: "03/12/2026", aVencerDias: 166 },
  { id: "s5", colaborador: "FERNANDA FABIANA DA SILVA", cargo: "Assistente", gestor: "DANIELA NASCIMENTO COSTA BICALHO", vinculo: "CLT", periodoAquisitivo: "2024/2025", saldo: 16, dataLimite: "04/12/2026", aVencerDias: 167 },
  { id: "s6", colaborador: "SULAMITA BRAS DE OLIVEIRA MACHADO", cargo: "Assistente Financeiro/RH", gestor: "ANA CAROLINA BRAGA DE MOURA", vinculo: "CLT", periodoAquisitivo: "2024/2025", saldo: 10, dataLimite: "07/12/2026", aVencerDias: 170 },
  { id: "s7", colaborador: "DAIANE MATOS BRITO", cargo: "Analista I", gestor: "DANIELA NASCIMENTO COSTA BICALHO", vinculo: "CLT", periodoAquisitivo: "2024/2025", saldo: 15, dataLimite: "10/12/2026", aVencerDias: 173 },
  { id: "s8", colaborador: "ANA CLÁUDIA ROSSI", cargo: "ANALISTA III - Step 1", gestor: "DANIELA NASCIMENTO COSTA BICALHO", vinculo: "CLT", periodoAquisitivo: "2024/2025", saldo: 11, dataLimite: "10/12/2026", aVencerDias: 173 },
  { id: "s9", colaborador: "MARTA TEODORO DE SOUZA CARDOSO", cargo: "Serviços Gerais", gestor: "ANA CAROLINA BRAGA DE MOURA", vinculo: "CLT", periodoAquisitivo: "2025/2026", saldo: 16, dataLimite: "18/12/2026", aVencerDias: 181, cadastroIncompleto: true },
  { id: "s10", colaborador: "LAURA VITÓRIA DE SOUZA ROBERTO", cargo: "Auxiliar", gestor: "ANA CAROLINA BRAGA DE MOURA", vinculo: "CLT", periodoAquisitivo: "2025/2026", saldo: 11, dataLimite: "04/01/2027", aVencerDias: 198 },
  // A vencer 60 a 90 dias
  { id: "s11", colaborador: "BRUNA LOPES SILVA", cargo: "Analista II", gestor: "DANIELA NASCIMENTO COSTA BICALHO", vinculo: "CLT", periodoAquisitivo: "2024/2025", saldo: 18, dataLimite: "20/08/2026", aVencerDias: 61 },
  { id: "s12", colaborador: "CAMILA OLIVEIRA SANTOS", cargo: "Coordenadora", gestor: "ANA CAROLINA BRAGA DE MOURA", vinculo: "CLT", periodoAquisitivo: "2024/2025", saldo: 12, dataLimite: "05/09/2026", aVencerDias: 77 },
  { id: "s13", colaborador: "STEPHANY OLIVEIRA", cargo: "Assistente", gestor: "DANIELA NASCIMENTO COSTA BICALHO", vinculo: "CLT", periodoAquisitivo: "2024/2025", saldo: 20, dataLimite: "18/09/2026", aVencerDias: 90 },
  // A vencer 30 a 59 dias
  { id: "s14", colaborador: "THALITA ARAUJO", cargo: "Analista I", gestor: "DANIELA NASCIMENTO COSTA BICALHO", vinculo: "CLT", periodoAquisitivo: "2024/2025", saldo: 14, dataLimite: "20/07/2026", aVencerDias: 30 },
  { id: "s15", colaborador: "MARIA EDUARDA COSTA", cargo: "Assistente", gestor: "ANA CAROLINA BRAGA DE MOURA", vinculo: "CLT", periodoAquisitivo: "2024/2025", saldo: 9, dataLimite: "05/08/2026", aVencerDias: 46 },
  { id: "s16", colaborador: "JANAINA MARIANI", cargo: "Analista II", gestor: "DANIELA NASCIMENTO COSTA BICALHO", vinculo: "CLT", periodoAquisitivo: "2024/2025", saldo: 17, dataLimite: "18/08/2026", aVencerDias: 59 },
  // A vencer 1 a 29 dias
  { id: "s17", colaborador: "ERICK VINICIOS SOUZA", cargo: "Estagiário", gestor: "DANIELA NASCIMENTO COSTA BICALHO", vinculo: "CLT", periodoAquisitivo: "2023/2024", saldo: 7, dataLimite: "25/06/2026", aVencerDias: 5 },
  { id: "s18", colaborador: "JAMILA SANTOS", cargo: "Analista III", gestor: "ANA CAROLINA BRAGA DE MOURA", vinculo: "CLT", periodoAquisitivo: "2023/2024", saldo: 22, dataLimite: "05/07/2026", aVencerDias: 15 },
  { id: "s19", colaborador: "GABRIELA CALDEIRA", cargo: "Assistente", gestor: "DANIELA NASCIMENTO COSTA BICALHO", vinculo: "CLT", periodoAquisitivo: "2023/2024", saldo: 13, dataLimite: "19/07/2026", aVencerDias: 29 },
  // Em dobro
  { id: "s20", colaborador: "TATIANE PEREIRA", cargo: "Analista I", gestor: "DANIELA NASCIMENTO COSTA BICALHO", vinculo: "CLT", periodoAquisitivo: "2022/2023", saldo: 30, dataLimite: "10/03/2026", aVencerDias: -101, emDobro: true },
  { id: "s21", colaborador: "ÁGATHA RODRIGUES", cargo: "Assistente", gestor: "ANA CAROLINA BRAGA DE MOURA", vinculo: "CLT", periodoAquisitivo: "2022/2023", saldo: 30, dataLimite: "22/02/2026", aVencerDias: -117, emDobro: true },
  { id: "s22", colaborador: "LIVIA GARCIA XAVIER", cargo: "Analista II", gestor: "DANIELA NASCIMENTO COSTA BICALHO", vinculo: "CLT", periodoAquisitivo: "2022/2023", saldo: 30, dataLimite: "15/01/2026", aVencerDias: -155, emDobro: true },
];

const CADASTRO_INCOMPLETO_COUNT = 16;


export default function FeriasRecessoRH() {
  const { colaboradores } = useColaboradores();
  const [tab, setTab] = useState("solicitacoes");
  const [etapaFiltro, setEtapaFiltro] = useState<string>("todas");
  const [busca, setBusca] = useState("");
  const [gestorFiltro, setGestorFiltro] = useState("todos");
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);

  // Importação
  const [importView, setImportView] = useState<ImportView>("none");

  // Criar solicitação - dialog em 3 etapas
  const [criarOpen, setCriarOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [colabSel, setColabSel] = useState<string>("");
  const [periodoVinc, setPeriodoVinc] = useState<string>("28/01/2026 - 27/01/2027 (30 dias disponíveis)");
  const [criarComoConcluida, setCriarComoConcluida] = useState(false);
  const [recessoInicio, setRecessoInicio] = useState("");
  const [recessoFim, setRecessoFim] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const gestores = useMemo(() => {
    const set = new Set<string>();
    colaboradores.forEach((c) => {
      if (c.gestorDireto) set.add(c.gestorDireto);
    });
    MOCK.forEach((s) => {
      if (s.gestor) set.add(s.gestor);
    });
    return Array.from(set).sort();
  }, [colaboradores]);

  // Saldos
  const [saldoTab, setSaldoTab] = useState<"todos" | "1-29" | "30-59" | "60-90">("todos");
  const [saldoBusca, setSaldoBusca] = useState("");
  const [saldoGestor, setSaldoGestor] = useState("todos");
  const [saldoStatus, setSaldoStatus] = useState<"tudo" | "incompleto">("tudo");
  const [saldoPerPage, setSaldoPerPage] = useState(10);
  const [saldoPage, setSaldoPage] = useState(1);




  const [verItem, setVerItem] = useState<Solicitacao | null>(null);

  const [verVende, setVerVende] = useState<"nao" | "sim">("nao");
  const [verAdianta, setVerAdianta] = useState<"nao" | "sim">("nao");
  const [verObs, setVerObs] = useState("ajuste");

  const [etiquetaItem, setEtiquetaItem] = useState<Solicitacao | null>(null);
  const [etiquetaValor, setEtiquetaValor] = useState<string>("");
  const [etiquetaErro, setEtiquetaErro] = useState(false);

  const counts = useMemo(() => {
    return { todas: MOCK.length, "Análise Gestor": 3, "Análise RH": 13, Documentação: 1, Reprovada: 24, Concluída: 156, Cancelada: 56 } as Record<string, number>;
  }, []);

  const filtrada = useMemo(() => {
    return MOCK.filter((s) => {
      if (etapaFiltro !== "todas" && s.etapa !== etapaFiltro) return false;
      if (busca && !s.colaborador.toLowerCase().includes(busca.toLowerCase())) return false;
      if (gestorFiltro && gestorFiltro !== "todos" && s.gestor !== gestorFiltro) return false;
      return true;
    });
  }, [etapaFiltro, busca, gestorFiltro]);

  const totalPages = Math.max(1, Math.ceil(filtrada.length / perPage));
  const pageItems = filtrada.slice((page - 1) * perPage, page * perPage);

  const etapas: { key: string; label: string }[] = [
    { key: "todas", label: `Todas (${counts.todas})` },
    { key: "Análise Gestor", label: `Análise Gestor (${counts["Análise Gestor"]})` },
    { key: "Análise RH", label: `Análise RH (${counts["Análise RH"]})` },
    { key: "Documentação", label: `Documentação (${counts.Documentação})` },
    { key: "Reprovada", label: `Reprovada (${counts.Reprovada})` },
    { key: "Concluída", label: `Concluída (${counts.Concluída})` },
    { key: "Cancelada", label: `Cancelada (${counts.Cancelada})` },
  ];

  const colabSelObj = colaboradores.find((c) => c.id === colabSel);
  const gestorDoColab = colabSelObj?.gestorDireto;

  function resetCriar() {
    setStep(1);
    setColabSel("");
    setCriarComoConcluida(false);
    setRecessoInicio("");
    setRecessoFim("");
    setObservacoes("");
  }

  function fecharCriar() {
    setCriarOpen(false);
    setTimeout(resetCriar, 200);
  }

  const podeSolicitar = recessoInicio && recessoFim;

  if (importView === "saldo") {
    return (
      <ImportadorPage
        titulo="Importar dados em massa para cálculo de saldo de Férias/Recesso"
        descricao="Este importador faz o cadastro das datas do 1° período aquisitivo para calcular saldo de Férias/Recesso."
        dicas={DICAS_SALDO}
        onBack={() => setImportView("none")}
        templateUrl={templateSaldo.url}
      />
    );
  }

  if (importView === "solicitacoes") {
    return (
      <ImportadorPage
        titulo="Importador de solicitações de Férias & Recesso"
        descricao="Ao importar as solicitações de períodos históricos, vigentes ou agendamentos futuros, serão considerados tipo de vínculo e gestor atuais do colaborador."
        dicas={DICAS_SOLICITACOES}
        onBack={() => setImportView("none")}
        templateUrl={templateSolicitacoes.url}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestão de Férias & Recesso</h1>
            <p className="text-sm text-muted-foreground">Gerencie as solicitações de férias dos colaboradores.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => { resetCriar(); setCriarOpen(true); }}>Criar solicitação</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Importar <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setImportView("saldo")}>
                  Importar dados em massa para cálculo de saldo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setImportView("solicitacoes")}>
                  Importar solicitações de férias e recesso
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setConfigFeriasOpen(true)}>
                  Configuração de Férias
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setControleSaldoOpen(true)}>
                  Controle de visualização de Saldos
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="mt-6">
          <TabsList>
            <TabsTrigger value="solicitacoes" className="gap-2">
              <FileText className="h-4 w-4" /> Solicitações
            </TabsTrigger>
            <TabsTrigger value="saldos" className="gap-2">
              <Calculator className="h-4 w-4" /> Saldos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="solicitacoes" className="mt-4 space-y-4">
            <div className="flex items-center gap-3 border-b pb-2 overflow-x-auto">
              {etapas.map((e) => (
                <button
                  key={e.key}
                  onClick={() => { setEtapaFiltro(e.key); setPage(1); }}
                  className={`text-sm whitespace-nowrap pb-2 border-b-2 transition-colors ${
                    etapaFiltro === e.key ? "border-primary text-primary font-medium" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {e.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Pesquise colaboradores pelo nome" className="pl-9" value={busca} onChange={(e) => setBusca(e.target.value)} />
              </div>
              <Select value={gestorFiltro} onValueChange={setGestorFiltro}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o gestor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os gestores</SelectItem>
                  {gestores.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Gestor Direto</TableHead>
                  <TableHead>Data da Solicitação</TableHead>
                  <TableHead>Período Solicitado</TableHead>
                  <TableHead>Etapa</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-muted text-muted-foreground"><User className="h-4 w-4" /></AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-semibold">{s.colaborador}</div>
                          <div className="text-xs text-muted-foreground">{s.cargo}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{s.gestor}</TableCell>
                    <TableCell className="text-sm">{s.dataSolicitacao}</TableCell>
                    <TableCell className="text-sm">
                      <div><span className="font-semibold">De:</span> {s.inicio}</div>
                      <div><span className="font-semibold">Até:</span> {s.fim}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={etapaCor[s.etapa]} variant="secondary">{s.etapa}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {(s.etapa === "Análise RH" || s.etapa === "Documentação") && (
                          <Button variant="outline" size="icon" className="h-8 w-8 border-primary/30 text-primary hover:bg-primary/5" title="Adicionar etiqueta" onClick={() => { setEtiquetaItem(s); setEtiquetaValor(""); setEtiquetaErro(false); }}>
                            <Tag className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="outline" size="icon" className="h-8 w-8 border-primary/30 text-primary hover:bg-primary/5" onClick={() => { setVerItem(s); setVerVende("nao"); setVerAdianta("nao"); setVerObs(""); }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between pt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>Itens por página:</span>
                <Select value={String(perPage)} onValueChange={(v) => { setPerPage(Number(v)); setPage(1); }}>
                  <SelectTrigger className="w-20 h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[10, 25, 50].map((n) => (<SelectItem key={n} value={String(n)}>{n}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>{filtrada.length === 0 ? 0 : (page - 1) * perPage + 1} - {Math.min(page * perPage, filtrada.length)} de {filtrada.length} itens</div>
              <div className="flex items-center gap-2">
                <span>{page} de {totalPages} páginas</span>
                <Button variant="ghost" size="icon" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="saldos" className="mt-4 space-y-4">
            {/* Alerta amarelo */}
            <div className="flex items-center justify-between gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-amber-900">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <span>
                  Você possui <strong>{CADASTRO_INCOMPLETO_COUNT} colaboradores</strong> com cadastro incompleto para cálculo de saldos.
                </span>
              </div>
              <button
                className="text-sm font-medium text-amber-900 underline hover:text-amber-700"
                onClick={() => { setSaldoTab("todos"); setSaldoStatus("incompleto"); setSaldoPage(1); }}
              >
                Filtrar lista
              </button>
            </div>

            {/* Sub-tabs */}
            <div className="flex items-center gap-1 border-b overflow-x-auto">
              {([
                { key: "todos", label: "Todos" },
                { key: "1-29", label: "A vencer 1 a 29 dias" },
                { key: "30-59", label: "A vencer 30 a 59 dias" },
                { key: "60-90", label: "A vencer 60 a 90 dias" },
              ] as const).map((t) => (
                <button
                  key={t.key}
                  onClick={() => { setSaldoTab(t.key); setSaldoPage(1); }}
                  className={`text-sm whitespace-nowrap px-3 py-2 -mb-px border-b-2 transition-colors ${
                    saldoTab === t.key ? "border-primary text-primary font-medium" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Filtros */}
            <div className={`grid grid-cols-1 ${saldoTab === "todos" ? "md:grid-cols-3" : "md:grid-cols-2"} gap-3`}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Pesquise colaboradores pelo nome" className="pl-9" value={saldoBusca} onChange={(e) => setSaldoBusca(e.target.value)} />
              </div>
              <Select value={saldoGestor} onValueChange={setSaldoGestor}>
                <SelectTrigger><SelectValue placeholder="Selecione o gestor" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os gestores</SelectItem>
                  {gestores.map((g) => (<SelectItem key={g} value={g}>{g}</SelectItem>))}
                </SelectContent>
              </Select>
              {saldoTab === "todos" && (
                <Select value={saldoStatus} onValueChange={(v) => setSaldoStatus(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tudo">Tudo</SelectItem>
                    <SelectItem value="incompleto">Cadastro Incompleto</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            {(() => {
              const filtradoSaldos = MOCK_SALDOS.filter((s) => {
                if (saldoBusca && !s.colaborador.toLowerCase().includes(saldoBusca.toLowerCase())) return false;
                if (saldoGestor !== "todos" && s.gestor !== saldoGestor) return false;
                if (saldoTab === "todos") {
                  if (saldoStatus === "incompleto" && !s.cadastroIncompleto) return false;
                } else if (saldoTab === "1-29") {
                  if (s.aVencerDias < 1 || s.aVencerDias > 29) return false;
                } else if (saldoTab === "30-59") {
                  if (s.aVencerDias < 30 || s.aVencerDias > 59) return false;
                } else if (saldoTab === "60-90") {
                  if (s.aVencerDias < 60 || s.aVencerDias > 90) return false;
                }
                return true;
              });
              const totalP = Math.max(1, Math.ceil(filtradoSaldos.length / saldoPerPage));
              const items = filtradoSaldos.slice((saldoPage - 1) * saldoPerPage, saldoPage * saldoPerPage);

              return (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Colaborador</TableHead>
                        <TableHead>Gestor direto</TableHead>
                        <TableHead>Vínculo</TableHead>
                        <TableHead>Período aquisitivo</TableHead>
                        <TableHead>Saldo</TableHead>
                        <TableHead>Data limite</TableHead>
                        <TableHead>A vencer</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-10">
                            <div className="flex flex-col items-center gap-1">
                              <span className="font-medium text-foreground">Tudo certo por aqui!</span>
                              <span>Nenhum registro nesta situação</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                      {items.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8"><AvatarFallback className="bg-muted text-muted-foreground"><User className="h-4 w-4" /></AvatarFallback></Avatar>
                              <div>
                                <div className="text-sm font-semibold">{s.colaborador}</div>
                                <div className="text-xs text-muted-foreground">{s.cargo}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{s.gestor}</TableCell>
                          <TableCell className="text-sm">{s.vinculo}</TableCell>
                          <TableCell className="text-sm">{s.periodoAquisitivo}</TableCell>
                          <TableCell className="text-sm">{s.saldo}</TableCell>
                          <TableCell className="text-sm">{s.dataLimite}</TableCell>
                          <TableCell className="text-sm">
                            {s.emDobro ? (
                              <Badge variant="destructive">Em dobro</Badge>
                            ) : (
                              `${s.aVencerDias} dias`
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="outline" size="icon" className="h-8 w-8"><CalendarDays className="h-4 w-4" /></Button>
                              <Button variant="outline" size="sm">Detalhes</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="flex items-center justify-between pt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span>Itens por página:</span>
                      <Select value={String(saldoPerPage)} onValueChange={(v) => { setSaldoPerPage(Number(v)); setSaldoPage(1); }}>
                        <SelectTrigger className="w-20 h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {[10, 25, 50].map((n) => (<SelectItem key={n} value={String(n)}>{n}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>{filtradoSaldos.length === 0 ? 0 : (saldoPage - 1) * saldoPerPage + 1} - {Math.min(saldoPage * saldoPerPage, filtradoSaldos.length)} de {filtradoSaldos.length} itens</div>
                    <div className="flex items-center gap-2">
                      <span>{saldoPage} de {totalP} páginas</span>
                      <Button variant="ghost" size="icon" disabled={saldoPage <= 1} onClick={() => setSaldoPage((p) => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" disabled={saldoPage >= totalP} onClick={() => setSaldoPage((p) => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </>
              );
            })()}
          </TabsContent>

        </Tabs>
      </Card>

      {/* Dialog Criar Solicitação - multi step */}
      <Dialog open={criarOpen} onOpenChange={(o) => { if (!o) fecharCriar(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar solicitação para um colaborador</DialogTitle>
            <DialogDescription>Crie como RH, uma solicitação de férias para seu colaborador.</DialogDescription>
          </DialogHeader>

          {step === 1 && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Colaborador *</Label>
                <Select value={colabSel} onValueChange={setColabSel}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {colaboradores.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.nomeCompleto}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {colabSel && (
                <div className="space-y-2">
                  <Label>Período de vínculo para esta solicitação *</Label>
                  <Select value={periodoVinc} onValueChange={setPeriodoVinc}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="28/01/2026 - 27/01/2027 (30 dias disponíveis)">
                        28/01/2026 - 27/01/2027 (30 dias disponíveis)
                      </SelectItem>
                      <SelectItem value="28/01/2025 - 27/01/2026 (0 dias disponíveis)">
                        28/01/2025 - 27/01/2026 (0 dias disponíveis)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {step === 2 && colabSelObj && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Colaborador</p>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-9 w-9"><AvatarFallback><User className="h-4 w-4" /></AvatarFallback></Avatar>
                    <div>
                      <div className="text-sm font-semibold">{colabSelObj.nomeCompleto}</div>
                      <div className="text-xs text-muted-foreground">{colabSelObj.cargo}</div>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Gestor</p>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-9 w-9"><AvatarFallback><User className="h-4 w-4" /></AvatarFallback></Avatar>
                    <div>
                      <div className="text-sm font-semibold">{gestorDoColab || "-"}</div>
                      <div className="text-xs text-muted-foreground">{colabSelObj.gestorCargo || ""}</div>
                    </div>
                  </div>
                </div>
              </div>

              <button className="text-sm text-primary underline">Detalhes de saldo do colaborador</button>

              <div className="border rounded-lg p-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">Solicitação referente ao período aquisitivo</div>
                  <div className="font-semibold">2026 - 2027</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Saldo</div>
                  <div className="font-semibold">30 dias</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Direito de férias a partir de</div>
                  <div className="font-semibold">28/01/2027</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Data limite para início</div>
                  <div className="font-semibold">29/12/2027</div>
                </div>
              </div>

              <div>
                <Label>Período de Recesso *</Label>
                <p className="text-xs text-muted-foreground mb-2">Defina o período de descanso. <span className="text-primary underline cursor-pointer">Ver regras de solicitação</span></p>
                <div className="flex items-center gap-2">
                  <Input type="date" value={recessoInicio} onChange={(e) => setRecessoInicio(e.target.value)} />
                  <span className="text-sm text-muted-foreground">até</span>
                  <Input type="date" value={recessoFim} onChange={(e) => setRecessoFim(e.target.value)} />
                </div>
              </div>

              <div>
                <Label>Observações <span className="text-xs text-primary">(opcional)</span></Label>
                <Textarea
                  placeholder="Insira uma descrição para a ação"
                  value={observacoes}
                  maxLength={250}
                  onChange={(e) => setObservacoes(e.target.value)}
                />
                <div className="text-right text-xs text-muted-foreground">{observacoes.length}/250</div>
              </div>

              <div>
                <Label>Documento de Recesso <span className="text-xs text-primary">(opcional)</span></Label>
                <p className="text-xs text-muted-foreground mb-2">Os documentos inseridos aqui também serão visíveis no cadastro do colaborador</p>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-primary mb-2" />
                  <p className="text-sm text-primary font-medium">Clique aqui ou arraste e solte o arquivo nesta área para realizar o upload</p>
                  <p className="text-xs text-muted-foreground mt-1">Aceitamos arquivo em formato .PDF, .PNG e .JPEG de no máximo 50MB.</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t mt-2">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={criarComoConcluida} onCheckedChange={(v) => setCriarComoConcluida(!!v)} />
              <span>Criar solicitação como</span>
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100" variant="secondary">Concluída</Badge>
            </label>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => step === 2 ? setStep(1) : fecharCriar()}>
                {step === 2 ? "Voltar" : "Cancelar"}
              </Button>
              {step === 1 ? (
                <Button disabled={!colabSel} onClick={() => setStep(2)}>Avançar</Button>
              ) : (
                <Button disabled={!podeSolicitar} onClick={fecharCriar}>Solicitar Recesso</Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Detalhes da solicitação */}
      <Dialog open={!!verItem} onOpenChange={(o) => { if (!o) setVerItem(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da solicitação</DialogTitle>
          </DialogHeader>
          {verItem && (
            <div className="space-y-5 py-2">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-semibold">Status da Solicitação</span>
                  <Badge className={etapaCor[verItem.etapa]} variant="secondary">{verItem.etapa}</Badge>
                </div>
                {(() => {
                  const steps = ["Em Análise do Gestor", "Em Análise do RH", "Aguardando documentação", "Concluída"];
                  const etapa = verItem.etapa;
                  // doneIdx: index of last completed step; activeIdx: currently active step
                  // failIdx: step displayed as red X (for Reprovada / Cancelada)
                  let doneIdx = -1, activeIdx = -1, failIdx = -1;
                  if (etapa === "Análise Gestor") { activeIdx = 0; }
                  else if (etapa === "Análise RH") { doneIdx = 0; activeIdx = 1; }
                  else if (etapa === "Documentação") { doneIdx = 1; activeIdx = 2; }
                  else if (etapa === "Concluída") { doneIdx = 3; }
                  else if (etapa === "Reprovada") { doneIdx = 0; failIdx = 1; }
                  else if (etapa === "Cancelada") { doneIdx = 1; failIdx = 2; }
                  return (
                    <div className="flex items-center justify-between">
                      {steps.map((s, i, arr) => {
                        const isDone = i <= doneIdx;
                        const isActive = i === activeIdx;
                        const isFail = i === failIdx;
                        const labelCls = isFail ? "text-red-600 font-semibold" : isActive ? "text-primary font-semibold" : isDone ? "text-foreground" : "text-muted-foreground";
                        const circleCls = isFail
                          ? "bg-red-500 text-white border-red-500"
                          : isDone
                          ? "bg-primary text-primary-foreground border-primary"
                          : isActive
                          ? "bg-background text-primary border-primary"
                          : "bg-background text-muted-foreground border-muted";
                        const lineCls = i < doneIdx || (i === doneIdx && (failIdx > i || activeIdx > i)) ? "bg-primary" : "bg-muted";
                        return (
                          <div key={s} className="flex-1 flex items-center">
                            <div className="flex flex-col items-center">
                              <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center text-xs ${circleCls}`}>
                                {isFail ? <X className="h-3 w-3" /> : isDone ? <Check className="h-3 w-3" /> : ""}
                              </div>
                              <div className={`text-[10px] text-center mt-1 max-w-[80px] leading-tight ${labelCls}`}>{s}</div>
                            </div>
                            {i < arr.length - 1 && <div className={`flex-1 h-0.5 mx-1 ${lineCls}`} />}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {verItem.etapa === "Reprovada" && (
                <div>
                  <Label className="text-sm font-semibold">Motivo da Reprovação</Label>
                  <Textarea readOnly value="alterado para nova data" className="mt-1 bg-muted/30" rows={3} />
                </div>
              )}
              {verItem.etapa === "Cancelada" && (
                <div>
                  <Label className="text-sm font-semibold">Motivo do Cancelamento</Label>
                  <Textarea readOnly value="Data errada" className="mt-1 bg-muted/30" rows={3} />
                </div>
              )}

              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold mb-3">Informações da Solicitação</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Colaborador</p>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-9 w-9"><AvatarFallback><User className="h-4 w-4" /></AvatarFallback></Avatar>
                      <div>
                        <div className="text-sm font-semibold">{verItem.colaborador}</div>
                        <div className="text-xs text-muted-foreground">{verItem.cargo}</div>
                        <button className="text-xs text-primary underline">Detalhes de saldo do colaborador</button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Gestor</p>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-9 w-9"><AvatarFallback><User className="h-4 w-4" /></AvatarFallback></Avatar>
                      <div>
                        <div className="text-sm font-semibold">{verItem.gestor}</div>
                        <div className="text-xs text-muted-foreground">Coordenadora</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">Solicitação referente ao período aquisitivo</div>
                  <div className="font-semibold">2022 - 2023</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Total de dias solicitados</div>
                  <div className="font-semibold">10</div>
                </div>
              </div>

              <div>
                <Label>Período de Recesso *</Label>
                <p className="text-xs text-muted-foreground mb-2">Defina o período de descanso.</p>
                <div className="flex items-center gap-2">
                  <Input type="text" value={verItem.inicio} readOnly />
                  <span className="text-sm text-muted-foreground">até</span>
                  <Input type="text" value={verItem.fim} readOnly />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Vender Recesso?</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="radio" name="vende" checked={verVende === "nao"} onChange={() => setVerVende("nao")} /> Não
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="radio" name="vende" checked={verVende === "sim"} onChange={() => setVerVende("sim")} /> Sim
                    </label>
                    {verVende === "sim" && <Input className="w-16 h-8" defaultValue="0" />}
                  </div>
                </div>
                <div>
                  <Label>Adiantar 1ª Parcela do 13º?</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="radio" name="adianta" checked={verAdianta === "nao"} onChange={() => setVerAdianta("nao")} /> Não
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="radio" name="adianta" checked={verAdianta === "sim"} onChange={() => setVerAdianta("sim")} /> Sim
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <Label>Observações <span className="text-xs text-primary">(opcional)</span></Label>
                <Textarea value={verObs} maxLength={250} onChange={(e) => setVerObs(e.target.value)} />
                <div className="text-right text-xs text-muted-foreground">{verObs.length}/250</div>
              </div>

              <div>
                <Label>Documento de Recesso <span className="text-xs text-primary">(opcional)</span></Label>
                <p className="text-xs text-muted-foreground mb-2">Os documentos inseridos aqui também serão visíveis no cadastro do colaborador</p>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-primary mb-2" />
                  <p className="text-sm text-primary font-medium">Clique aqui ou arraste e solte o arquivo nesta área para realizar o upload</p>
                  <p className="text-xs text-muted-foreground mt-1">Aceitamos arquivo em formato .PDF, .PNG e .JPEG de no máximo 50MB.</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="border-t pt-4">
            {verItem && verItem.etapa === "Análise Gestor" && (
              <>
                <Button variant="outline" onClick={() => setVerItem(null)}>Cancelar</Button>
                <Button onClick={() => setVerItem(null)}>Pular Aprovação do Gestor</Button>
              </>
            )}
            {verItem && verItem.etapa === "Análise RH" && (
              <>
                <Button variant="outline" onClick={() => setVerItem(null)}>Cancelar</Button>
                <Button variant="outline" className="bg-red-100 text-red-700 border-red-200 hover:bg-red-200" onClick={() => setVerItem(null)}>Reprovar</Button>
                <Button onClick={() => setVerItem(null)}>Aprovar</Button>
              </>
            )}
            {verItem && verItem.etapa === "Documentação" && (
              <>
                <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50 mr-auto" onClick={() => setVerItem(null)}>Cancelar Solicitação</Button>
                <Button variant="outline" onClick={() => setVerItem(null)}>Cancelar</Button>
                <Button onClick={() => setVerItem(null)}>Concluir Solicitação</Button>
              </>
            )}
            {verItem && (verItem.etapa === "Reprovada" || verItem.etapa === "Cancelada" || verItem.etapa === "Concluída") && (
              <Button variant="outline" onClick={() => setVerItem(null)}>Cancelar</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Etiqueta */}
      <Dialog open={!!etiquetaItem} onOpenChange={(o) => { if (!o) { setEtiquetaItem(null); setEtiquetaErro(false); } }}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Etiqueta</DialogTitle>
            <DialogDescription>Selecione a Etiqueta correspondente à etapa do seu processo.</DialogDescription>
          </DialogHeader>
          <div className="py-2 border-t border-b">
            <div className="py-4">
              <Select value={etiquetaValor} onValueChange={(v) => { setEtiquetaValor(v); setEtiquetaErro(false); }}>
                <SelectTrigger className={etiquetaErro ? "border-red-500 ring-1 ring-red-500" : ""}>
                  <SelectValue placeholder="Selecione a etiqueta" />
                </SelectTrigger>
                <SelectContent>
                  {etiquetaItem?.etapa === "Análise RH" && (
                    <SelectItem value="Contabilidade">Contabilidade</SelectItem>
                  )}
                  {etiquetaItem?.etapa === "Documentação" && (
                    <>
                      <SelectItem value="Assinatura Ao Vivo">Assinatura Ao Vivo</SelectItem>
                      <SelectItem value="Pagamento">Pagamento</SelectItem>
                      <SelectItem value="Assinatura do Recibo">Assinatura do Recibo</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              {etiquetaErro && <p className="text-xs text-red-600 mt-1">Selecione uma etiqueta</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEtiquetaItem(null); setEtiquetaErro(false); }}>Cancelar</Button>
            <Button onClick={() => { if (!etiquetaValor) { setEtiquetaErro(true); return; } setEtiquetaItem(null); setEtiquetaErro(false); }}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
