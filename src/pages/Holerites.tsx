import { FileText, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { downloadFile } from "@/lib/download";
import { useCurrentColaborador } from "@/hooks/useCurrentColaborador";

const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

export default function Holerites() {
  const { colaborador } = useCurrentColaborador();
  const [perPage, setPerPage] = useState("25");
  const [lista, setLista] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!colaborador?.id) { setLista([]); setLoading(false); return; }
    (async () => {
      setLoading(true);
      const { data } = await supabase.from("holerites").select("*").eq("colaborador_id", colaborador.id).order("ano", { ascending: false }).order("mes", { ascending: false });
      setLista(data ?? []);
      setLoading(false);
    })();
  }, [colaborador?.id]);

  const handleDownload = async (path: string) => {
    if (!path) { toast({ title: "Arquivo não disponível", variant: "destructive" }); return; }
    const { data, error } = await supabase.storage.from("holerites").createSignedUrl(path, 60);
    if (error || !data) { toast({ title: "Erro ao gerar link", description: error?.message, variant: "destructive" }); return; }
    try {
      await downloadFile(data.signedUrl, path.split("/").pop() || "holerite.pdf");
      toast({ title: "Download iniciado" });
    } catch { toast({ title: "Erro ao baixar o arquivo", variant: "destructive" }); }
  };

  return (
    <div className="space-y-6">
      <Card className="border border-primary/20 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold text-foreground">Meus Holerites</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b-2 border-primary/40">
                <TableHead className="text-foreground font-semibold">Período</TableHead>
                <TableHead className="text-right text-foreground font-semibold">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={2} className="text-center py-12 text-muted-foreground">Carregando…</TableCell></TableRow>
              ) : lista.length === 0 ? (
                <TableRow><TableCell colSpan={2} className="text-center py-12 text-muted-foreground">Nenhum holerite disponível no momento.</TableCell></TableRow>
              ) : (
                lista.map((item) => {
                  const periodoNome = item.dados?.periodo_nome || `${MESES[(item.mes ?? 1) - 1]} ${item.ano}`;
                  const descricao = item.dados?.descricao || (item.tipo === "13" ? "13º Salário" : item.tipo === "ferias" ? "Férias" : "");
                  return (
                    <TableRow key={item.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center">
                            <FileText className="h-8 w-8 text-destructive/70" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{periodoNome}</p>
                            {descricao && <p className="text-sm text-muted-foreground">{descricao}</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 gap-2" onClick={() => handleDownload(item.arquivo_path)}>
                          <Download className="h-4 w-4" /> Baixar
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Itens por página:</span>
              <Select value={perPage} onValueChange={setPerPage}>
                <SelectTrigger className="h-8 w-[70px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <span>{lista.length} de {lista.length} itens</span>
            <div className="flex items-center gap-2">
              <span>1 de 1 páginas</span>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
