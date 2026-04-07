import { useState, useMemo } from "react";
import { Search, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Cargo {
  nome: string;
  area?: string;
  missao: string;
  responsabilidades: string;
  requisitosAcademicos: string;
  competenciasComportamentais: string;
  competenciasOrganizacionais: string;
  experiencia: string;
}

const cargosData: Cargo[] = [
  { nome: "ANALISTA CONTÁBIL II - Step 5", area: "Contábil", missao: "-", responsabilidades: "-", requisitosAcademicos: "-", competenciasComportamentais: "-", competenciasOrganizacionais: "-", experiencia: "-" },
  { nome: "ANALISTA CONTÁBIL III - Step 1", area: "Contábil", missao: "-", responsabilidades: "-", requisitosAcademicos: "-", competenciasComportamentais: "-", competenciasOrganizacionais: "-", experiencia: "-" },
  { nome: "ANALISTA CONTÁBIL III - Step 2", area: "Contábil", missao: "-", responsabilidades: "-", requisitosAcademicos: "-", competenciasComportamentais: "-", competenciasOrganizacionais: "-", experiencia: "-" },
  { nome: "ANALISTA CONTÁBIL III - Step 3", area: "Contábil", missao: "-", responsabilidades: "-", requisitosAcademicos: "-", competenciasComportamentais: "-", competenciasOrganizacionais: "-", experiencia: "-" },
  { nome: "ANALISTA CONTÁBIL III - Step 4", area: "Contábil", missao: "-", responsabilidades: "-", requisitosAcademicos: "-", competenciasComportamentais: "-", competenciasOrganizacionais: "-", experiencia: "-" },
  { nome: "ANALISTA CONTÁBIL III - Step 5", area: "Contábil", missao: "-", responsabilidades: "-", requisitosAcademicos: "-", competenciasComportamentais: "-", competenciasOrganizacionais: "-", experiencia: "-" },
  { nome: "ANALISTA FISCAL I - Step 1", area: "Fiscal", missao: "-", responsabilidades: "-", requisitosAcademicos: "-", competenciasComportamentais: "-", competenciasOrganizacionais: "-", experiencia: "-" },
  { nome: "ANALISTA FISCAL I - Step 2", area: "Fiscal", missao: "-", responsabilidades: "-", requisitosAcademicos: "-", competenciasComportamentais: "-", competenciasOrganizacionais: "-", experiencia: "-" },
  { nome: "ANALISTA FISCAL I - Step 3", area: "Fiscal", missao: "-", responsabilidades: "-", requisitosAcademicos: "-", competenciasComportamentais: "-", competenciasOrganizacionais: "-", experiencia: "-" },
  { nome: "ANALISTA FISCAL I - Step 4", area: "Fiscal", missao: "-", responsabilidades: "-", requisitosAcademicos: "-", competenciasComportamentais: "-", competenciasOrganizacionais: "-", experiencia: "-" },
  // Página 2
  { nome: "ANALISTA FISCAL I - Step 5", area: "Fiscal", missao: "-", responsabilidades: "-", requisitosAcademicos: "-", competenciasComportamentais: "-", competenciasOrganizacionais: "-", experiencia: "-" },
  { nome: "ANALISTA I - Step 1", area: "Contábil", missao: "-", responsabilidades: "-", requisitosAcademicos: "-", competenciasComportamentais: "-", competenciasOrganizacionais: "-", experiencia: "-" },
  { nome: "ANALISTA I - Step 2", area: "Contábil", missao: "-", responsabilidades: "-", requisitosAcademicos: "-", competenciasComportamentais: "-", competenciasOrganizacionais: "-", experiencia: "-" },
  { nome: "ANALISTA I - Step 4", area: "Contábil", missao: "-", responsabilidades: "-", requisitosAcademicos: "-", competenciasComportamentais: "-", competenciasOrganizacionais: "-", experiencia: "-" },
  { nome: "ANALISTA I - Step 5", area: "Contábil", missao: "-", responsabilidades: "-", requisitosAcademicos: "-", competenciasComportamentais: "-", competenciasOrganizacionais: "-", experiencia: "-" },
  { nome: "ANALISTA II", area: undefined, missao: "-", responsabilidades: "-", requisitosAcademicos: "-", competenciasComportamentais: "-", competenciasOrganizacionais: "-", experiencia: "-" },
  { nome: "ANALISTA II", area: undefined, missao: "-", responsabilidades: "-", requisitosAcademicos: "-", competenciasComportamentais: "-", competenciasOrganizacionais: "-", experiencia: "-" },
  { nome: "ANALISTA II - Step 1", area: "Contábil", missao: "-", responsabilidades: "-", requisitosAcademicos: "-", competenciasComportamentais: "-", competenciasOrganizacionais: "-", experiencia: "-" },
  { nome: "ANALISTA II - Step 2", area: "Contábil", missao: "-", responsabilidades: "-", requisitosAcademicos: "-", competenciasComportamentais: "-", competenciasOrganizacionais: "-", experiencia: "-" },
  { nome: "ANALISTA II - Step 3", area: "Contábil", missao: "-", responsabilidades: "-", requisitosAcademicos: "-", competenciasComportamentais: "-", competenciasOrganizacionais: "-", experiencia: "-" },
  // Página 3
  { nome: "ANALISTA II - Step 4", area: "Contábil", missao: "-", responsabilidades: "-", requisitosAcademicos: "-", competenciasComportamentais: "-", competenciasOrganizacionais: "-", experiencia: "-" },
  { nome: "ANALISTA II - Step 5", area: undefined, missao: "-", responsabilidades: "-", requisitosAcademicos: "-", competenciasComportamentais: "-", competenciasOrganizacionais: "-", experiencia: "-" },
  { nome: "ANALISTA III", area: undefined, missao: "-", responsabilidades: "-", requisitosAcademicos: "-", competenciasComportamentais: "-", competenciasOrganizacionais: "-", experiencia: "-" },
  { nome: "ANALISTA III", area: undefined, missao: "-", responsabilidades: "-", requisitosAcademicos: "-", competenciasComportamentais: "-", competenciasOrganizacionais: "-", experiencia: "-" },
  { nome: "ANALISTA III", area: undefined, missao: "-", responsabilidades: "-", requisitosAcademicos: "-", competenciasComportamentais: "-", competenciasOrganizacionais: "-", experiencia: "-" },
  { nome: "ASSISTENTE", area: undefined, missao: "-", responsabilidades: "-", requisitosAcademicos: "-", competenciasComportamentais: "-", competenciasOrganizacionais: "-", experiencia: "-" },
  { nome: "ASSISTENTE", area: undefined, missao: "-", responsabilidades: "-", requisitosAcademicos: "-", competenciasComportamentais: "-", competenciasOrganizacionais: "-", experiencia: "-" },
  { nome: "ASSISTENTE", area: undefined, missao: "-", responsabilidades: "-", requisitosAcademicos: "-", competenciasComportamentais: "-", competenciasOrganizacionais: "-", experiencia: "-" },
  { nome: "ASSISTENTE", area: undefined, missao: "-", responsabilidades: "-", requisitosAcademicos: "-", competenciasComportamentais: "-", competenciasOrganizacionais: "-", experiencia: "-" },
  { nome: "Assistente Comercial", area: undefined, missao: "-", responsabilidades: "-", requisitosAcademicos: "-", competenciasComportamentais: "-", competenciasOrganizacionais: "-", experiencia: "-" },
  // Página 4
  { nome: "ASSISTENTE CONTÁBIL - Step 1", area: "Contábil", missao: "-", responsabilidades: "-", requisitosAcademicos: "-", competenciasComportamentais: "-", competenciasOrganizacionais: "-", experiencia: "-" },
  { nome: "ASSISTENTE CONTÁBIL - Step 2", area: "Contábil", missao: "-", responsabilidades: "-", requisitosAcademicos: "-", competenciasComportamentais: "-", competenciasOrganizacionais: "-", experiencia: "-" },
  { nome: "ASSISTENTE CONTÁBIL - Step 3", area: "Contábil", missao: "-", responsabilidades: "-", requisitosAcademicos: "-", competenciasComportamentais: "-", competenciasOrganizacionais: "-", experiencia: "-" },
  { nome: "ASSISTENTE CONTÁBIL - Step 4", area: "Contábil", missao: "-", responsabilidades: "-", requisitosAcademicos: "-", competenciasComportamentais: "-", competenciasOrganizacionais: "-", experiencia: "-" },
  { nome: "ASSISTENTE CONTÁBIL - Step 5", area: "Contábil", missao: "-", responsabilidades: "-", requisitosAcademicos: "-", competenciasComportamentais: "-", competenciasOrganizacionais: "-", experiencia: "-" },
  { nome: "ASSISTENTE FINANCEIRO/RH", area: undefined, missao: "-", responsabilidades: "-", requisitosAcademicos: "-", competenciasComportamentais: "-", competenciasOrganizacionais: "-", experiencia: "-" },
  { nome: "ASSISTENTE FISCAL - Step 1", area: "Fiscal", missao: "-", responsabilidades: "-", requisitosAcademicos: "-", competenciasComportamentais: "-", competenciasOrganizacionais: "-", experiencia: "-" },
  { nome: "ASSISTENTE FISCAL - Step 2", area: "Fiscal", missao: "-", responsabilidades: "-", requisitosAcademicos: "-", competenciasComportamentais: "-", competenciasOrganizacionais: "-", experiencia: "-" },
  { nome: "ASSISTENTE FISCAL - Step 3", area: "Fiscal", missao: "-", responsabilidades: "-", requisitosAcademicos: "-", competenciasComportamentais: "-", competenciasOrganizacionais: "-", experiencia: "-" },
  { nome: "ASSISTENTE FISCAL - Step 4", area: "Fiscal", missao: "-", responsabilidades: "-", requisitosAcademicos: "-", competenciasComportamentais: "-", competenciasOrganizacionais: "-", experiencia: "-" },
  // Página 5
  { nome: "ASSISTENTE FISCAL - Step 5", area: "Fiscal", missao: "-", responsabilidades: "-", requisitosAcademicos: "-", competenciasComportamentais: "-", competenciasOrganizacionais: "-", experiencia: "-" },
  { nome: "AUXILIAR", area: undefined, missao: "-", responsabilidades: "-", requisitosAcademicos: "-", competenciasComportamentais: "-", competenciasOrganizacionais: "-", experiencia: "-" },
  { nome: "AUXILIAR", area: undefined, missao: "-", responsabilidades: "-", requisitosAcademicos: "-", competenciasComportamentais: "-", competenciasOrganizacionais: "-", experiencia: "-" },
  { nome: "AUXILIAR", area: undefined, missao: "-", responsabilidades: "-", requisitosAcademicos: "-", competenciasComportamentais: "-", competenciasOrganizacionais: "-", experiencia: "-" },
  { nome: "AUXILIAR", area: undefined, missao: "-", responsabilidades: "-", requisitosAcademicos: "-", competenciasComportamentais: "-", competenciasOrganizacionais: "-", experiencia: "-" },
  { nome: "COORDENADORA", area: undefined, missao: "-", responsabilidades: "-", requisitosAcademicos: "-", competenciasComportamentais: "-", competenciasOrganizacionais: "-", experiencia: "-" },
  { nome: "DIRETORA", area: undefined, missao: "-", responsabilidades: "-", requisitosAcademicos: "-", competenciasComportamentais: "-", competenciasOrganizacionais: "-", experiencia: "-" },
  { nome: "ESTAGIÁRIO (a)", area: undefined, missao: "-", responsabilidades: "-", requisitosAcademicos: "-", competenciasComportamentais: "-", competenciasOrganizacionais: "-", experiencia: "-" },
  { nome: "MARKETING", area: undefined, missao: "-", responsabilidades: "-", requisitosAcademicos: "-", competenciasComportamentais: "-", competenciasOrganizacionais: "-", experiencia: "-" },
  { nome: "RECEPCIONISTA", area: undefined, missao: "-", responsabilidades: "-", requisitosAcademicos: "-", competenciasComportamentais: "-", competenciasOrganizacionais: "-", experiencia: "-" },
  { nome: "RECEPCIONISTA", area: undefined, missao: "-", responsabilidades: "-", requisitosAcademicos: "-", competenciasComportamentais: "-", competenciasOrganizacionais: "-", experiencia: "-" },
];

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50];

function CargoItem({ cargo }: { cargo: Cargo }) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button
          className={`w-full flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors hover:bg-muted/30 ${
            cargo.area ? "border-primary/30 bg-primary/5" : "border-border"
          }`}
        >
          <div className="flex flex-col gap-1">
            <span className="font-medium text-sm text-foreground">{cargo.nome}</span>
            {cargo.area && (
              <Badge variant="secondary" className="w-fit text-xs bg-primary/15 text-primary border-0">
                {cargo.area}
              </Badge>
            )}
          </div>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 pb-4 pt-2 space-y-3 border border-t-0 rounded-b-lg border-border -mt-1 bg-card">
        {[
          { label: "Missão", value: cargo.missao },
          { label: "Responsabilidades", value: cargo.responsabilidades },
          { label: "Requisitos acadêmicos", value: cargo.requisitosAcademicos },
          { label: "Competências comportamentais", value: cargo.competenciasComportamentais },
          { label: "Competências organizacionais", value: cargo.competenciasOrganizacionais },
          { label: "Experiência", value: cargo.experiencia },
        ].map((item) => (
          <div key={item.label}>
            <h4 className="text-sm font-semibold text-primary">{item.label}</h4>
            <p className="text-sm text-muted-foreground">{item.value}</p>
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function MinhaCarreira() {
  const [search, setSearch] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(
    () =>
      cargosData.filter((c) =>
        c.nome.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Reset to page 1 when search or items per page changes
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Minha carreira</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Acompanhe sua carreira e quais próximos passos dar para avançar.
        </p>
      </div>

      {/* Cargo atual */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">Cargo atual</label>
        <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
          <span className="text-sm text-foreground">ESTAGIÁRIO (a)</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Demais cargos */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-foreground">Demais cargos</label>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Busque pelo cargo"
            className="pl-9"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          {paginated.map((cargo, index) => (
            <CargoItem key={`${cargo.nome}-${startIndex + index}`} cargo={cargo} />
          ))}
        </div>

        {/* Paginação */}
        <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
          <div className="flex items-center gap-2">
            <span>Itens por página:</span>
            <Select
              value={String(itemsPerPage)}
              onValueChange={handleItemsPerPageChange}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ITEMS_PER_PAGE_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={String(opt)}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <span>
            {filtered.length === 0
              ? "0 de 0 itens"
              : `${startIndex + 1} - ${Math.min(startIndex + itemsPerPage, filtered.length)} de ${filtered.length} itens`}
          </span>
          <div className="flex items-center gap-2">
            <span>
              {currentPage} de {totalPages} páginas
            </span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
