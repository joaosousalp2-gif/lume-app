import express, { Request, Response } from "express";

const router = express.Router();

// Simulação de banco de dados em memória (em produção, usar banco de dados real)
const launchesDatabase: { [userId: string]: any[] } = {};

/**
 * GET /api/launches/:userId
 * Recupera todos os lançamentos do usuário
 */
router.get("/:userId", (req: Request, res: Response) => {
  const { userId } = req.params;
  const launches = launchesDatabase[userId] || [];
  res.json({ success: true, data: launches });
});

/**
 * POST /api/launches/:userId
 * Adiciona um novo lançamento
 */
router.post("/:userId", (req: Request, res: Response) => {
  const { userId } = req.params;
  const launch = req.body;

  if (!launchesDatabase[userId]) {
    launchesDatabase[userId] = [];
  }

  const newLaunch = {
    ...launch,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
  };

  launchesDatabase[userId].push(newLaunch);
  res.json({ success: true, data: newLaunch });
});

/**
 * PUT /api/launches/:userId/:launchId
 * Atualiza um lançamento existente
 */
router.put("/:userId/:launchId", (req: Request, res: Response) => {
  const { userId, launchId } = req.params;
  const updatedLaunch = req.body;

  if (!launchesDatabase[userId]) {
    return res.status(404).json({ success: false, message: "Usuário não encontrado" });
  }

  const index = launchesDatabase[userId].findIndex((l) => l.id === launchId);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Lançamento não encontrado" });
  }

  launchesDatabase[userId][index] = { ...launchesDatabase[userId][index], ...updatedLaunch };
  res.json({ success: true, data: launchesDatabase[userId][index] });
});

/**
 * DELETE /api/launches/:userId/:launchId
 * Deleta um lançamento
 */
router.delete("/:userId/:launchId", (req: Request, res: Response) => {
  const { userId, launchId } = req.params;

  if (!launchesDatabase[userId]) {
    return res.status(404).json({ success: false, message: "Usuário não encontrado" });
  }

  const index = launchesDatabase[userId].findIndex((l) => l.id === launchId);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Lançamento não encontrado" });
  }

  const deletedLaunch = launchesDatabase[userId].splice(index, 1);
  res.json({ success: true, data: deletedLaunch[0] });
});

/**
 * POST /api/launches/:userId/sync
 * Sincroniza múltiplos lançamentos de uma vez
 */
router.post("/:userId/sync", (req: Request, res: Response) => {
  const { userId } = req.params;
  const { launches } = req.body;

  if (!Array.isArray(launches)) {
    return res.status(400).json({ success: false, message: "Formato inválido" });
  }

  launchesDatabase[userId] = launches.map((launch) => ({
    ...launch,
    timestamp: launch.timestamp || new Date().toISOString(),
  }));

  res.json({ success: true, data: launchesDatabase[userId] });
});

export default router;
