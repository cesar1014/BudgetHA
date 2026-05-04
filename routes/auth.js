export function registerAuthRoutes(app, deps) {
  const {
    sendLoginFile,
    getAuthSessionFromRequest,
    getRolePermissions,
    getAllowedProjectsFromSession,
    getProjectCodeFromSession,
    getProjectSummaries,
    isProjectSelectionRequired,
    getProjectName,
    getProjectBrandName,
    parseJsonBody,
    isLoginRateLimited,
    authenticateUser,
    registerLoginAttempt,
    createAuthSession,
    setActiveProjectForSession,
    setAuthCookie,
    writeAuditLog,
    removeAuthSessionByRequest,
    clearAuthCookie,
    getAuthUserByUsername: getAuthUserByUsernameFn,
    authUsers: getAuthUsersFn,
    setAuthUsers: setAuthUsersFn,
    schedulePersistAuthUsers: schedulePersistAuthUsersFn,
    synchronizeAuthSessionsForUser: synchronizeAuthSessionsForUserFn,
    normalizeLoginIdentifier: normalizeLoginIdentifierFn,
    normalizeAuthUserDefinition: normalizeAuthUserDefinitionFn,
    validateBoundedString: validateBoundedStringFn,
    validateAuthUserPasswordInput: validateAuthUserPasswordInputFn,
    createPbkdf2Credential: createPbkdf2CredentialFn,
  } = deps;

  function buildAuthResponse(session, extra = {}) {
    const user = getAuthUserByUsernameFn?.(session?.username);
    const isSuperAdmin = user?.isSuperAdmin === true;
    const accountType =
      String(user?.accountType ?? "user")
        .trim()
        .toLowerCase() === "project"
        ? "project"
        : "user";
    const permissions = getRolePermissions(session?.role, { isSuperAdmin });
    const activeProjectCode = getProjectCodeFromSession(session);
    const requiresProjectSelection = isProjectSelectionRequired(session);
    const allowedProjects = getProjectSummaries(getAllowedProjectsFromSession(session));

    return {
      authenticated: true,
      username: String(session?.username ?? ""),
      role: permissions.role,
      isSuperAdmin,
      accountType,
      permissions,
      allowedProjects,
      requiresProjectSelection,
      projectCode: activeProjectCode,
      activeProjectCode,
      projectName: activeProjectCode ? getProjectName(activeProjectCode) : "",
      projectBrandName: activeProjectCode ? getProjectBrandName(activeProjectCode) : "",
      expiresAt: Number.isFinite(Number(session?.expiresAt))
        ? new Date(Number(session.expiresAt)).toISOString()
        : null,
      ...extra,
    };
  }

  app.get("/login", (req, res) => {
    sendLoginFile(req, res);
  });

  app.get("/login.html", (_req, res) => {
    res.redirect("/login");
  });

  app.get("/api/auth/status", (req, res) => {
    const session = getAuthSessionFromRequest(req);
    if (!session) {
      res.json({ authenticated: false });
      return;
    }

    res.json(buildAuthResponse(session));
  });

  app.patch("/api/auth/profile", async (req, res) => {
    const session = getAuthSessionFromRequest(req);
    if (!session) {
      res.status(401).json({ error: "Nao autenticado. Faca login para continuar." });
      return;
    }

    if (
      typeof getAuthUsersFn !== "function" ||
      typeof setAuthUsersFn !== "function" ||
      typeof schedulePersistAuthUsersFn !== "function" ||
      typeof synchronizeAuthSessionsForUserFn !== "function" ||
      typeof normalizeLoginIdentifierFn !== "function" ||
      typeof normalizeAuthUserDefinitionFn !== "function" ||
      typeof validateBoundedStringFn !== "function" ||
      typeof validateAuthUserPasswordInputFn !== "function" ||
      typeof createPbkdf2CredentialFn !== "function"
    ) {
      res.status(503).json({ error: "Atualizacao de perfil indisponivel no servidor." });
      return;
    }

    const body = parseJsonBody(req, res);
    if (!body) return;

    const currentUsers = Array.isArray(getAuthUsersFn()) ? getAuthUsersFn() : [];
    const currentUser = getAuthUserByUsernameFn?.(session.username);
    if (!currentUser) {
      res.status(404).json({ error: "Usuario atual nao encontrado." });
      return;
    }

    const usernameValidation = validateBoundedStringFn(
      body.username !== undefined ? body.username : currentUser.username,
      {
        fieldLabel: "Username",
        required: true,
        maxLength: 120,
      }
    );
    if (!usernameValidation.ok) {
      res.status(400).json({ error: usernameValidation.error });
      return;
    }
    const nextUsername = usernameValidation.value;

    const currentUserId = String(currentUser?.id ?? "").trim();
    const nextUsernameKey = normalizeLoginIdentifierFn(nextUsername);
    if (!nextUsernameKey) {
      res.status(400).json({ error: "Username invalido." });
      return;
    }
    const usernameConflict = currentUsers.some(
      (user) =>
        String(user?.id ?? "").trim() !== currentUserId &&
        normalizeLoginIdentifierFn(user?.username) === nextUsernameKey
    );
    if (usernameConflict) {
      res.status(409).json({ error: "Ja existe um usuario com este username." });
      return;
    }

    const password = typeof body.password === "string" ? body.password : "";
    const confirmPassword = typeof body.confirmPassword === "string" ? body.confirmPassword : "";
    const passwordTouched = password.length > 0 || confirmPassword.length > 0;
    if (passwordTouched && password !== confirmPassword) {
      res.status(400).json({ error: "Confirmacao de senha nao confere." });
      return;
    }

    let nextPasswordHash = String(currentUser.passwordHash ?? "");
    let nextPasswordResetAt = currentUser.lastPasswordResetAt ?? null;
    if (password.length > 0) {
      const passwordValidation = validateAuthUserPasswordInputFn(password);
      if (!passwordValidation.ok) {
        res.status(400).json({ error: passwordValidation.error });
        return;
      }
      nextPasswordHash = createPbkdf2CredentialFn(passwordValidation.value);
      nextPasswordResetAt = new Date().toISOString();
    }

    const nowIso = new Date().toISOString();
    const normalized = normalizeAuthUserDefinitionFn({
      ...currentUser,
      username: nextUsername,
      passwordHash: nextPasswordHash,
      updatedAt: nowIso,
      lastPasswordResetAt: nextPasswordResetAt,
    });
    if (!normalized) {
      res.status(400).json({ error: "Dados de usuario invalidos." });
      return;
    }

    const updatedUsers = currentUsers.map((item) =>
      String(item?.id ?? "").trim() === currentUserId ? normalized : item
    );
    setAuthUsersFn(updatedUsers);
    await schedulePersistAuthUsersFn();

    const usernameChanged =
      normalizeLoginIdentifierFn(currentUser.username) !==
      normalizeLoginIdentifierFn(normalized.username);
    const passwordChanged = password.length > 0;
    const requiresReauth = usernameChanged || passwordChanged;

    if (requiresReauth) {
      await synchronizeAuthSessionsForUserFn(currentUser.username, { revoke: true });
      req._authSessionCache = null;
      clearAuthCookie(req, res);
    } else {
      await synchronizeAuthSessionsForUserFn(normalized.username);
    }

    await writeAuditLog(
      req,
      "auth.profile.update",
      "auth_user",
      String(normalized.id ?? ""),
      { username: String(currentUser.username ?? "") },
      {
        username: String(normalized.username ?? ""),
        passwordChanged,
      }
    );

    res.json({
      ok: true,
      username: String(normalized.username ?? ""),
      requiresReauth,
    });
  });

  app.post("/api/auth/login", async (req, res) => {
    const body = parseJsonBody(req, res);
    if (!body) return;

    const username = String(body.username ?? "").trim();
    const password = String(body.password ?? "");
    if (isLoginRateLimited(req, username)) {
      res.status(429).json({
        error: "Muitas tentativas de login. Aguarde alguns minutos e tente novamente.",
      });
      return;
    }

    const authenticatedAccount = authenticateUser(username, password);
    if (!authenticatedAccount) {
      registerLoginAttempt(req, username, false);
      res.status(401).json({ error: "Credenciais inválidas." });
      return;
    }

    registerLoginAttempt(req, username, true);
    const created = await createAuthSession(authenticatedAccount);
    if (!created?.token || !created?.session) {
      res.status(500).json({ error: "Falha ao iniciar sessao." });
      return;
    }

    req._authSessionCache = created.session;
    setAuthCookie(req, res, created.token);
    await writeAuditLog(req, "auth.login", "session", created.session.sessionId, null, {
      username: created.session.username,
      role: created.session.role,
    });

    res.json({
      ok: true,
      ...buildAuthResponse(created.session),
    });
  });

  app.post("/api/auth/active-project", async (req, res) => {
    const session = getAuthSessionFromRequest(req);
    if (!session) {
      res.status(401).json({ error: "Não autenticado. Faça login para continuar." });
      return;
    }

    const body = parseJsonBody(req, res);
    if (!body) return;
    const projectCode = String(body.projectCode ?? "").trim();
    if (!projectCode) {
      res.status(400).json({ error: "Informe o codigo do projeto." });
      return;
    }

    const updated = await setActiveProjectForSession(session.sessionId, projectCode);
    if (!updated?.session || !updated?.token) {
      res.status(403).json({ error: "Projeto inválido ou sem permissão para o usuário." });
      return;
    }

    req._authSessionCache = updated.session;
    setAuthCookie(req, res, updated.token);
    await writeAuditLog(
      req,
      "auth.active_project.update",
      "session",
      updated.session.sessionId,
      {
        previousProjectCode: getProjectCodeFromSession(session),
      },
      {
        activeProjectCode: getProjectCodeFromSession(updated.session),
      }
    );

    res.json({
      ok: true,
      ...buildAuthResponse(updated.session),
    });
  });

  app.post("/api/auth/logout", async (req, res) => {
    const session = getAuthSessionFromRequest(req);
    await removeAuthSessionByRequest(req);
    clearAuthCookie(req, res);
    if (session) {
      await writeAuditLog(
        req,
        "auth.logout",
        "session",
        session.sessionId,
        {
          username: session.username,
          role: session.role,
        },
        null
      );
    }
    res.json({ ok: true });
  });
}
