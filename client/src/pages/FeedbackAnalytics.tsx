import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Loader2, TrendingUp, MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react";

export default function FeedbackAnalytics() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get feedback stats
  const statsQuery = (trpc as any).chatFeedback.getStats.useQuery(undefined, {
    enabled: !!user,
  });

  // Get recent feedback
  const recentQuery = (trpc as any).chatFeedback.getRecent.useQuery(
    { limit: 100 },
    { enabled: !!user }
  );

  useEffect(() => {
    if (statsQuery.isLoading || recentQuery.isLoading) {
      setLoading(true);
      return;
    }

    if (statsQuery.error || recentQuery.error) {
      setError("Erro ao carregar dados de feedback");
      setLoading(false);
      return;
    }

    if (!statsQuery.data || statsQuery.data.length === 0) {
      setStats(null);
      setTrends([]);
      setLoading(false);
      return;
    }

    try {
      // statsQuery.data is an array of feedback records
      const feedbackArray = statsQuery.data;
      const useful = feedbackArray.filter((f: any) => f.rating === "useful").length;
      const notUseful = feedbackArray.filter((f: any) => f.rating === "not_useful").length;
      const total = useful + notUseful;

      setStats({
        totalFeedback: total,
        usefulCount: useful,
        notUsefulCount: notUseful,
        usefulPercentage: total > 0 ? Math.round((useful / total) * 100) : 0,
        notUsefulPercentage: total > 0 ? Math.round((notUseful / total) * 100) : 0,
        avgResponseQuality: total > 0 ? Math.round((useful / total) * 100) : 0,
      });

      // Calculate trends (last 7 days)
      const trendMap = new Map<string, { useful: number; notUseful: number }>();
      const now = new Date();

      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        trendMap.set(dateStr, { useful: 0, notUseful: 0 });
      }

      feedbackArray.forEach((feedback: any) => {
        const feedbackDate = new Date(feedback.createdAt).toISOString().split("T")[0];
        const trend = trendMap.get(feedbackDate);
        if (trend) {
          if (feedback.rating === "useful") {
            trend.useful++;
          } else {
            trend.notUseful++;
          }
        }
      });

      const trendArray = Array.from(trendMap.entries()).map(([date, data]) => ({
        date: new Date(date).toLocaleDateString("pt-BR", { month: "short", day: "numeric" }),
        useful: data.useful,
        notUseful: data.notUseful,
        total: data.useful + data.notUseful,
      }));

      setTrends(trendArray);
      setError(null);
    } catch (err) {
      console.error("Error processing feedback data:", err);
      setError("Erro ao processar dados de feedback");
    } finally {
      setLoading(false);
    }
  }, [statsQuery.data, statsQuery.isLoading, statsQuery.error, recentQuery.isLoading, recentQuery.error]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Acesso Restrito</h2>
          <p className="text-gray-600">Você precisa estar autenticado para visualizar análises de feedback.</p>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Carregando análises...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erro</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700 text-white">
            Tentar Novamente
          </Button>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Sem Dados</h2>
          <p className="text-gray-600">Nenhum feedback disponível para análise. Comece a usar o Agente Financeiro!</p>
        </Card>
      </div>
    );
  }

  const pieData = [
    { name: "Útil", value: stats.usefulPercentage, color: "#10b981" },
    { name: "Não Útil", value: stats.notUsefulPercentage, color: "#ef4444" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Análise de Feedback</h1>
          <p className="text-gray-600">Acompanhe a qualidade das respostas do Agente Financeiro</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total de Avaliações</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalFeedback}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-600 opacity-50" />
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Respostas Úteis</p>
                <p className="text-3xl font-bold text-green-600">{stats.usefulCount}</p>
                <p className="text-xs text-gray-500 mt-1">{stats.usefulPercentage}%</p>
              </div>
              <ThumbsUp className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Respostas Não Úteis</p>
                <p className="text-3xl font-bold text-red-600">{stats.notUsefulCount}</p>
                <p className="text-xs text-gray-500 mt-1">{stats.notUsefulPercentage}%</p>
              </div>
              <ThumbsDown className="w-8 h-8 text-red-600 opacity-50" />
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Qualidade Média</p>
                <p className="text-3xl font-bold text-blue-600">{stats.avgResponseQuality}%</p>
                <p className="text-xs text-gray-500 mt-1">Taxa de satisfação</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600 opacity-50" />
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Trend Chart */}
          <Card className="p-6 bg-white shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Tendência (Últimos 7 dias)</h2>
            {trends.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="useful"
                    stroke="#10b981"
                    name="Útil"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="notUseful"
                    stroke="#ef4444"
                    name="Não Útil"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-600 text-center py-8">Sem dados de tendência</p>
            )}
          </Card>

          {/* Pie Chart */}
          <Card className="p-6 bg-white shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Distribuição de Feedback</h2>
            {stats.totalFeedback > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-600 text-center py-8">Sem dados para exibir</p>
            )}
          </Card>
        </div>

        {/* Bar Chart */}
        <Card className="p-6 bg-white shadow-sm mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Volume Diário de Avaliações</h2>
          {trends.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="useful" stackId="a" fill="#10b981" name="Útil" />
                <Bar dataKey="notUseful" stackId="a" fill="#ef4444" name="Não Útil" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-600 text-center py-8">Sem dados de volume</p>
          )}
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Atualizar Dados
          </Button>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
          >
            Voltar
          </Button>
        </div>
      </div>
    </div>
  );
}
