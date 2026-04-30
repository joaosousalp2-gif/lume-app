import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Loader2, TrendingUp, DollarSign, Target, Zap } from "lucide-react";

export default function AdvancedAnalytics() {
  const { user, isAuthenticated } = useAuth();
  const { data: launches, isLoading } = trpc.launches.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Por favor, faça login para acessar análises avançadas.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  // Calcular estatísticas
  const totalReceitas = launches?.reduce((sum, l) => l.type === "receita" ? sum + parseFloat(l.value) : sum, 0) || 0;
  const totalDespesas = launches?.reduce((sum, l) => l.type === "despesa" ? sum + parseFloat(l.value) : sum, 0) || 0;
  const saldo = totalReceitas - totalDespesas;
  const taxaPoupanca = totalReceitas > 0 ? ((saldo / totalReceitas) * 100).toFixed(2) : 0;

  // Dados para gráficos
  const despesasPorCategoria = launches?.reduce((acc, l) => {
    if (l.type === "despesa") {
      const existing = acc.find(item => item.name === l.category);
      if (existing) {
        existing.value += parseFloat(l.value);
      } else {
        acc.push({ name: l.category, value: parseFloat(l.value) });
      }
    }
    return acc;
  }, [] as Array<{ name: string; value: number }>) || [];

  const receitasPorCategoria = launches?.reduce((acc, l) => {
    if (l.type === "receita") {
      const existing = acc.find(item => item.name === l.category);
      if (existing) {
        existing.value += parseFloat(l.value);
      } else {
        acc.push({ name: l.category, value: parseFloat(l.value) });
      }
    }
    return acc;
  }, [] as Array<{ name: string; value: number }>) || [];

  const COLORS = ["#2563EB", "#22C55E", "#FACC15", "#7C3AED", "#EF4444", "#F97316"];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Análise Avançada com IA</h1>
        <p className="text-muted-foreground mb-8">Dashboard inteligente com insights e previsões</p>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Receitas Totais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">R$ {totalReceitas.toFixed(2)}</div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Despesas Totais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">R$ {totalDespesas.toFixed(2)}</div>
                <TrendingUp className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Saldo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className={`text-2xl font-bold ${saldo >= 0 ? "text-green-600" : "text-red-600"}`}>
                  R$ {saldo.toFixed(2)}
                </div>
                <Target className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Poupança</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{taxaPoupanca}%</div>
                <Zap className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <Tabs defaultValue="distribuicao" className="mb-8">
          <TabsList>
            <TabsTrigger value="distribuicao">Distribuição</TabsTrigger>
            <TabsTrigger value="comparacao">Comparação</TabsTrigger>
            <TabsTrigger value="insights">Insights IA</TabsTrigger>
          </TabsList>

          <TabsContent value="distribuicao" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Despesas por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={despesasPorCategoria} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: R$ ${value.toFixed(0)}`} outerRadius={80} fill="#8884d8" dataKey="value">
                        {despesasPorCategoria.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Receitas por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={receitasPorCategoria} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: R$ ${value.toFixed(0)}`} outerRadius={80} fill="#8884d8" dataKey="value">
                        {receitasPorCategoria.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="comparacao">
            <Card>
              <CardHeader>
                <CardTitle>Receitas vs Despesas</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: "Receitas", value: totalReceitas },
                    { name: "Despesas", value: totalDespesas },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#2563EB" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights">
            <Card>
              <CardHeader>
                <CardTitle>Insights Inteligentes</CardTitle>
                <CardDescription>Análise automática com IA</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2">💡 Análise de Gastos</h3>
                  <p className="text-blue-800 text-sm">
                    Sua maior categoria de despesa é <strong>{despesasPorCategoria[0]?.name || "N/A"}</strong> com R$ {(despesasPorCategoria[0]?.value || 0).toFixed(2)}. 
                    Considere revisar se há oportunidades de economia nesta área.
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-900 mb-2">✅ Taxa de Poupança</h3>
                  <p className="text-green-800 text-sm">
                    Sua taxa de poupança é de <strong>{taxaPoupanca}%</strong>. 
                    {typeof taxaPoupanca === 'number' && taxaPoupanca > 20 ? "Excelente! Você está economizando bem." : "Tente aumentar sua poupança reduzindo despesas desnecessárias."}
                  </p>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h3 className="font-semibold text-yellow-900 mb-2">📊 Recomendação</h3>
                  <p className="text-yellow-800 text-sm">
                    Com base em seus padrões, recomendamos manter uma reserva de emergência equivalente a 3-6 meses de despesas. 
                    Seu valor seria de R$ {typeof totalDespesas === 'number' ? (totalDespesas * 3).toFixed(2) : '0.00'} a R$ {typeof totalDespesas === 'number' ? (totalDespesas * 6).toFixed(2) : '0.00'}.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Tabela de Lançamentos */}
        <Card>
          <CardHeader>
            <CardTitle>Últimos Lançamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Data</th>
                    <th className="text-left py-2 px-2">Categoria</th>
                    <th className="text-left py-2 px-2">Descrição</th>
                    <th className="text-left py-2 px-2">Tipo</th>
                    <th className="text-right py-2 px-2">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {launches?.slice(0, 10).map((launch) => (
                    <tr key={launch.id} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-2">{launch.date}</td>
                      <td className="py-2 px-2">{launch.category}</td>
                      <td className="py-2 px-2">{launch.description || "-"}</td>
                      <td className="py-2 px-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${launch.type === "receita" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                          {launch.type === "receita" ? "Receita" : "Despesa"}
                        </span>
                      </td>
                      <td className="text-right py-2 px-2 font-semibold">
                        {launch.type === "receita" ? "+" : "-"}R$ {parseFloat(launch.value).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
