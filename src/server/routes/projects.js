export function registerProjectRoutes(app, deps) {
  const {
    getAuthSessionFromRequest,
    getAllowedProjectsFromSession,
    getProjectCatalog,
    getProjectCodeFromSession,
    isCatalogWritable,
  } = deps;

  app.get("/api/projects/catalog", async (req, res) => {
    const session = getAuthSessionFromRequest(req);
    if (!session) {
      res.status(401).json({ error: "Nao autenticado. Faca login para continuar." });
      return;
    }

    const allowedProjects = getAllowedProjectsFromSession(session);
    if (!Array.isArray(allowedProjects) || allowedProjects.length === 0) {
      res.status(403).json({ error: "Usuario sem acesso a projetos ativos." });
      return;
    }

    const catalog = await getProjectCatalog(allowedProjects);
    res.json({
      projects: catalog,
      activeProjectCode: getProjectCodeFromSession(session),
      catalogWritable: Boolean(
        typeof isCatalogWritable === "function" ? isCatalogWritable() : false
      ),
    });
  });
}
