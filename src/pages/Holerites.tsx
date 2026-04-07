import { FileText, Download, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const holeritesData: { periodo: string; descricao: string }[] = [];

export default function Holerites() {
  return (
    <div className="space-y-6">
      <Card className="border border-primary/20 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold text-foreground">
            Meus Holerites
          </CardTitle>
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
              {holeritesData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-12 text-muted-foreground">
                    Nenhum holerite disponível no momento.
                  </TableCell>
                </TableRow>
              ) : (
                holeritesData.map((item, index) => (
                  <TableRow key={index} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center">
                          <FileText className="h-8 w-8 text-destructive/70" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{item.periodo}</p>
                          <p className="text-sm text-muted-foreground">{item.descricao}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 gap-2">
                        <Download className="h-4 w-4" />
                        Baixar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Paginação */}
          <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Itens por página:</span>
              <Select defaultValue="25">
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <span>0 de 0 itens</span>
            <div className="flex items-center gap-2">
              <span>1 de 1 páginas</span>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
