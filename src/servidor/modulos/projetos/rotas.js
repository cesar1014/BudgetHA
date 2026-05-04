export function registerProjectRoutes(app, deps) {
  const {
    getAuthSessionFromRequest,
    getAccessContextFromRequest,
    getAllowedProjectsFromSession,
    getProjectCatalog,
    getProjectCodeFromSession,
    isCatalogWritable,
  } = deps;

  app.get("/api/projects/catalog", async (req, res) => {
    const accessContext =
      typeof getAccessContextFromRequest === "function"
        ? getAccessContextFromRequest(req)
        : null;
    const session = accessContext?.session ?? getAuthSessionFromRequest(req);
    if (!session) {
      res.status(401).json({ error: "Nao autenticado. Faca login para continuar." });
      return;
    }

    const allowedProjects = accessContext?.allowedProjects ?? getAllowedProjectsFromSession(session);
    if (!Array.isArray(allowedProjects) || allowedProjects.length === 0) {
      res.status(403).json({ error: "Usuario sem acesso a projetos ativos." });
      return;
    }

    const projectAccessByCode = new Map(
      (Array.isArray(accessContext?.projectAccess) ? accessContext.projectAccess : []).map(
        (entry) => [String(entry?.projectCode ?? ""), entry]
      )
    );
    const catalog = (await getProjectCatalog(allowedProjects)).map((project) => ({
      ...project,
      access: projectAccessByCode.get(String(project?.code ?? "")) ?? null,
    }));
    res.json({
      projects: catalog,
      activeProjectCode: accessContext?.activeProjectCode ?? getProjectCodeFromSession(session),
      catalogWritable: Boolean(
        typeof isCatalogWritable === "function" ? isCatalogWritable() : false
      ),
    });
  });
}
