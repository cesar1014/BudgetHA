export function registerAdminRoutes(app, deps) {
  const {
    getAuthSessionFromRequest,
    getAuthUserByUsername,
    getAuthUserById,
    getAllowedProjectsFromUser,
    sanitizeAuthUserForList,
    normalizeAuthUserDefinition,
    normalizeAllowedProjectsInput,
    normalizeProjectCode,
    normalizeAuthRole,
    normalizeAccountType: normalizeAccountTypeFn,
    normalizeLoginIdentifier,
    normalizeProjectCodesList,
    pickDefaultProjectCode,
    slugifyId,
    createPbkdf2Credential,
    validateBoundedString,
    validateAuthUserPasswordInput,
    parseJsonBody,
    setAuthUsers,
    schedulePersistAuthUsers,
    synchronizeAuthSessionsForUser,
    writeAuditLog,
    requireSuperAdmin,
    invalidateActiveProjectsCache,
    getKnownProjectCodes,
    normalizeRolesByProject,
    supabase,
    SUPABASE_ENABLED,
    SUPABASE_PROJECTS_TABLE,
    SUPABASE_DEPARTMENTS_TABLE,
    APP_PROJECT_CODE,
    AUTH_ROLE_VIEWER,
    authUsers: getAuthUsers,
  } = deps;

  const PROJECT_STATUS_VALUES = new Set(["ativo", "inativo", "concluido"]);

  function normalizeProjectStatus(value, fallback = "ativo") {
    const normalized = String(value ?? "")
      .trim()
      .toLowerCase();
    return PROJECT_STATUS_VALUES.has(normalized) ? normalized : fallback;
  }

  function normalizeAccountType(value, fallback = "user") {
    if (typeof normalizeAccountTypeFn === "function") {
      return normalizeAccountTypeFn(value, fallback);
    }
    const normalized = String(value ?? "")
      .trim()
      .toLowerCase();
    return normalized === "project" ? "project" : fallback;
  }

  function countActiveSuperAdmins(users = []) {
    return (Array.isArray(users) ? users : []).filter(
      (user) => user?.isSuperAdmin === true && user?.isActive !== false
    ).length;
  }

  function missingColumn(error, columnName) {
    const code = String(error?.code ?? "");
    const message = String(error?.message ?? "").toLowerCase();
    if (code === "42703") return message.includes(String(columnName).toLowerCase());
    return message.includes(String(columnName).toLowerCase()) && message.includes("column");
  }

  function missingTable(error, tableName) {
    const code = String(error?.code ?? "");
    const message = String(error?.message ?? "").toLowerCase();
    if (code === "42P01") return message.includes(String(tableName).toLowerCase());
    return (
      message.includes(String(tableName).toLowerCase()) &&
      (message.includes("table") || message.includes("relation") || message.includes("schema"))
    );
  }

  async function readDepartments() {
    if (!SUPABASE_ENABLED || !supabase) return { available: false, rows: [] };
    const { data, error } = await supabase
      .from(SUPABASE_DEPARTMENTS_TABLE)
      .select("id, name, phone_extension")
      .order("name", { ascending: true });
    if (error) {
      if (missingTable(error, SUPABASE_DEPARTMENTS_TABLE)) return { available: false, rows: [] };
      throw new Error(error.message);
    }
    return { available: true, rows: Array.isArray(data) ? data : [] };
  }

  async function readProjects() {
    if (!SUPABASE_ENABLED || !supabase) return { rows: [] };
    let includeStatus = true;
    let includeDepartment = true;
    let includeDepartmentId = true;
    while (true) {
      const fields = ["code", "name", "is_active"];
      if (includeStatus) fields.push("status");
      if (includeDepartment) fields.push("department");
      if (includeDepartmentId) fields.push("department_id");
      const { data, error } = await supabase
        .from(SUPABASE_PROJECTS_TABLE)
        .select(fields.join(", "))
        .order("name", { ascending: true });
      if (!error) return { rows: Array.isArray(data) ? data : [] };
      if (missingColumn(error, "status") && includeStatus) {
        includeStatus = false;
        continue;
      }
      if (missingColumn(error, "department_id") && includeDepartmentId) {
        includeDepartmentId = false;
        continue;
      }
      if (missingColumn(error, "department") && includeDepartment) {
        includeDepartment = false;
        continue;
      }
      if (missingTable(error, SUPABASE_PROJECTS_TABLE)) return { rows: [] };
      throw new Error(error.message);
    }
  }

  function mapProjects(rows, departmentsById = new Map()) {
    return (rows ?? [])
      .map((row) => {
        const code = String(row?.code ?? "")
          .trim()
          .toUpperCase();
        if (!code) return null;
        const name = String(row?.name ?? code).trim() || code;
        const status = normalizeProjectStatus(
          row?.status,
          row?.is_active === false ? "inativo" : "ativo"
        );
        const departmentId = String(row?.department_id ?? "").trim() || null;
        const departmentFromTable = departmentId ? departmentsById.get(departmentId) : null;
        const departmentName = String(departmentFromTable?.name ?? row?.department ?? "").trim();
        return {
          code,
          name,
          status,
          isActive: status === "ativo",
          departmentId,
          departmentName,
          departmentPhoneExtension: String(departmentFromTable?.phone_extension ?? "").trim(),
          department: departmentName,
        };
      })
      .filter(Boolean)
      .sort(
        (a, b) =>
          String(a.name).localeCompare(String(b.name), "pt-BR") ||
          String(a.code).localeCompare(String(b.code), "pt-BR")
      );
  }

  function buildDepartmentsFromProjects(projects) {
    const map = new Map();
    for (const project of projects) {
      const name = String(project?.departmentName ?? "").trim();
      if (!name) continue;
      const id = String(project?.departmentId ?? "").trim() || null;
      const key = id || `legacy:${name.toLowerCase()}`;
      if (!map.has(key)) {
        map.set(key, {
          id,
          name,
          phoneExtension: String(project?.departmentPhoneExtension ?? "").trim(),
          projectCount: 0,
        });
      }
      map.get(key).projectCount += 1;
    }
    return [...map.values()].sort((a, b) => String(a.name).localeCompare(String(b.name), "pt-BR"));
  }

  async function readDepartmentById(id) {
    const result = await readDepartments();
    if (!result.available) return { available: false, row: null };
    const row = (result.rows ?? []).find((item) => String(item?.id ?? "") === String(id ?? ""));
    return { available: true, row: row ?? null };
  }

  app.get("/api/admin/overview", requireSuperAdmin, async (_req, res) => {
    const users = (typeof getAuthUsers === "function" ? getAuthUsers() : [])
      .map((user) => sanitizeAuthUserForList(user))
      .filter(Boolean)
      .sort((a, b) => String(a.username).localeCompare(String(b.username), "pt-BR"));

    let departmentsAvailable = false;
    let projects = [];
    let departments = [];

    try {
      const departmentResult = await readDepartments();
      const departmentMap = new Map(
        (departmentResult.rows ?? []).map((row) => [String(row?.id ?? ""), row])
      );
      projects = mapProjects((await readProjects()).rows, departmentMap);
      departmentsAvailable = departmentResult.available;
      departments = departmentResult.available
        ? (departmentResult.rows ?? []).map((row) => ({
            id: String(row?.id ?? ""),
            name: String(row?.name ?? "").trim(),
            phoneExtension: String(row?.phone_extension ?? "").trim(),
            projectCount: projects.filter(
              (project) => String(project?.departmentId ?? "") === String(row?.id ?? "")
            ).length,
          }))
        : buildDepartmentsFromProjects(projects);
    } catch (error) {
      res.status(500).json({
        error: `Falha ao carregar overview administrativo: ${error?.message || "erro interno"}`,
      });
      return;
    }

    if (projects.length === 0) {
      projects = getKnownProjectCodes()
        .map((code) => ({
          code,
          name: code,
          status: "ativo",
          isActive: true,
          departmentId: null,
          departmentName: "",
          departmentPhoneExtension: "",
          department: "",
        }))
        .sort((a, b) => String(a.name).localeCompare(String(b.name), "pt-BR"));
      departments = [];
    }

    res.json({
      projects,
      users,
      departments,
      departmentCatalogWritable: Boolean(SUPABASE_ENABLED && supabase && departmentsAvailable),
    });
  });

  app.get("/api/admin/departments", requireSuperAdmin, async (_req, res) => {
    if (!SUPABASE_ENABLED || !supabase) {
      res.status(501).json({ error: "Gerenciamento de departamentos requer Supabase habilitado." });
      return;
    }
    const result = await readDepartments();
    if (!result.available) {
      res.status(500).json({
        error: "Falha ao carregar departamentos. Execute a migracao supabase/005_departments.sql.",
      });
      return;
    }
    const projects = mapProjects(
      (await readProjects()).rows,
      new Map((result.rows ?? []).map((row) => [String(row?.id ?? ""), row]))
    );
    const departments = (result.rows ?? [])
      .map((row) => ({
        id: String(row?.id ?? ""),
        name: String(row?.name ?? "").trim(),
        phoneExtension: String(row?.phone_extension ?? "").trim(),
        projectCount: projects.filter(
          (project) => String(project?.departmentId ?? "") === String(row?.id ?? "")
        ).length,
      }))
      .sort((a, b) => String(a.name).localeCompare(String(b.name), "pt-BR"));
    res.json({ departments });
  });

  app.post("/api/admin/departments/upsert", requireSuperAdmin, async (req, res) => {
    if (!SUPABASE_ENABLED || !supabase) {
      res.status(501).json({ error: "Gerenciamento de departamentos requer Supabase habilitado." });
      return;
    }
    const body = parseJsonBody(req, res);
    if (!body) return;
    const id = String(body.id ?? "").trim();
    const nameValidation = validateBoundedString(body.name, {
      fieldLabel: "Nome do departamento",
      required: true,
      maxLength: 120,
    });
    if (!nameValidation.ok) {
      res.status(400).json({ error: nameValidation.error });
      return;
    }
    const phoneExtension = String(body.phoneExtension ?? "").trim();
    if (phoneExtension.length > 20) {
      res.status(400).json({ error: "Ramal invalido. Use ate 20 caracteres." });
      return;
    }

    const result = await readDepartments();
    if (!result.available) {
      res.status(500).json({
        error: "Falha ao gravar departamento. Execute a migracao supabase/005_departments.sql.",
      });
      return;
    }

    const payload = {
      name: nameValidation.value,
      phone_extension: phoneExtension || null,
      updated_at: new Date().toISOString(),
    };
    const query = id
      ? supabase.from(SUPABASE_DEPARTMENTS_TABLE).update(payload).eq("id", id)
      : supabase.from(SUPABASE_DEPARTMENTS_TABLE).insert(payload);
    const { data, error } = await query.select("id, name, phone_extension").maybeSingle();
    if (error) {
      if (String(error?.code ?? "") === "23505") {
        res.status(409).json({ error: "Ja existe um departamento com este nome." });
        return;
      }
      res.status(500).json({ error: `Falha ao gravar departamento: ${error.message}` });
      return;
    }
    if (!data) {
      res.status(404).json({ error: "Departamento nao encontrado." });
      return;
    }
    await writeAuditLog(req, "admin.department.upsert", "department", String(data.id), null, {
      id: String(data.id),
      name: String(data.name),
      phoneExtension: String(data.phone_extension ?? ""),
    });
    res.json({
      ok: true,
      department: {
        id: String(data.id),
        name: String(data.name),
        phoneExtension: String(data.phone_extension ?? ""),
      },
    });
  });

  app.delete("/api/admin/departments/:id", requireSuperAdmin, async (req, res) => {
    if (!SUPABASE_ENABLED || !supabase) {
      res.status(501).json({ error: "Gerenciamento de departamentos requer Supabase habilitado." });
      return;
    }
    const id = String(req.params.id ?? "").trim();
    if (!id) {
      res.status(400).json({ error: "Departamento invalido." });
      return;
    }
    const result = await readDepartments();
    if (!result.available) {
      res.status(500).json({
        error: "Falha ao remover departamento. Execute a migracao supabase/005_departments.sql.",
      });
      return;
    }
    const { count, error: countError } = await supabase
      .from(SUPABASE_PROJECTS_TABLE)
      .select("code", { count: "exact", head: true })
      .eq("department_id", id);
    if (countError) {
      if (missingColumn(countError, "department_id")) {
        res.status(500).json({
          error: "Falha ao remover departamento. Execute a migracao supabase/005_departments.sql.",
        });
        return;
      }
      res.status(500).json({ error: `Falha ao validar vinculos: ${countError.message}` });
      return;
    }
    if (Number(count ?? 0) > 0) {
      res
        .status(409)
        .json({ error: "Nao e possivel remover departamento com projetos vinculados." });
      return;
    }
    const existing = (result.rows ?? []).find((row) => String(row?.id ?? "") === id) ?? null;
    const { error } = await supabase.from(SUPABASE_DEPARTMENTS_TABLE).delete().eq("id", id);
    if (error) {
      res.status(500).json({ error: `Falha ao remover departamento: ${error.message}` });
      return;
    }
    await writeAuditLog(req, "admin.department.delete", "department", id, existing, null);
    res.json({ ok: true, removedId: id });
  });

  app.post("/api/admin/projects/upsert", requireSuperAdmin, async (req, res) => {
    const body = parseJsonBody(req, res);
    if (!body) return;
    const codeRaw = normalizeProjectCode(body.code, "");
    if (!codeRaw || !/^[A-Z0-9_-]{1,64}$/.test(codeRaw)) {
      res.status(400).json({ error: "Codigo do projeto invalido. Use apenas A-Z, 0-9, _ ou -." });
      return;
    }
    const nameValidation = validateBoundedString(body.name ?? codeRaw, {
      fieldLabel: "Nome do projeto",
      required: true,
      maxLength: 120,
    });
    if (!nameValidation.ok) {
      res.status(400).json({ error: nameValidation.error });
      return;
    }
    const status = normalizeProjectStatus(
      body.status,
      body.isActive === false ? "inativo" : "ativo"
    );
    const isActive = status === "ativo";
    let departmentId = String(body.departmentId ?? "").trim() || null;
    let departmentName =
      String(body.department ?? "")
        .trim()
        .slice(0, 120) || null;

    if (!SUPABASE_ENABLED || !supabase) {
      res.status(501).json({ error: "Gerenciamento de projetos requer Supabase habilitado." });
      return;
    }
    if (departmentId) {
      const byId = await readDepartmentById(departmentId);
      if (!byId.available) {
        res.status(500).json({
          error: "Falha ao gravar departmentId. Execute a migracao supabase/005_departments.sql.",
        });
        return;
      }
      if (!byId.row) {
        res.status(400).json({ error: "Departamento informado nao encontrado." });
        return;
      }
      departmentName = String(byId.row.name ?? "").trim() || null;
    }

    const base = {
      code: codeRaw,
      name: nameValidation.value,
      is_active: isActive,
      status,
      department: departmentName,
      department_id: departmentId,
      updated_at: new Date().toISOString(),
    };
    let includeStatus = true;
    let includeDepartmentId = true;
    let includeDepartment = true;
    while (true) {
      const payload = { ...base };
      if (!includeStatus) delete payload.status;
      if (!includeDepartmentId) delete payload.department_id;
      if (!includeDepartment) delete payload.department;
      const { error } = await supabase
        .from(SUPABASE_PROJECTS_TABLE)
        .upsert(payload, { onConflict: "code" });
      if (!error) break;
      if (missingColumn(error, "status") && includeStatus) {
        if (status === "concluido") {
          res.status(500).json({
            error:
              "Falha ao gravar status 'concluido'. Execute a migracao supabase/004_project_status.sql.",
          });
          return;
        }
        includeStatus = false;
        continue;
      }
      if (missingColumn(error, "department_id") && includeDepartmentId) {
        if (departmentId) {
          res.status(500).json({
            error: "Falha ao gravar departmentId. Execute a migracao supabase/005_departments.sql.",
          });
          return;
        }
        includeDepartmentId = false;
        continue;
      }
      if (missingColumn(error, "department") && includeDepartment) {
        includeDepartment = false;
        continue;
      }
      res.status(500).json({ error: `Falha ao gravar projeto: ${error.message}` });
      return;
    }
    invalidateActiveProjectsCache();
    await writeAuditLog(req, "admin.project.upsert", "project", codeRaw, null, {
      code: codeRaw,
      name: nameValidation.value,
      isActive,
      status,
      departmentId,
      departmentName: departmentName ?? "",
    });
    res.json({
      ok: true,
      project: {
        code: codeRaw,
        name: nameValidation.value,
        isActive,
        status,
        departmentId,
        departmentName: departmentName ?? "",
        departmentPhoneExtension: "",
        department: departmentName ?? "",
      },
    });
  });

  app.post("/api/admin/users/create", requireSuperAdmin, async (req, res) => {
    const body = parseJsonBody(req, res);
    if (!body) return;
    const usernameValidation = validateBoundedString(body.username, {
      fieldLabel: "Username",
      required: true,
      maxLength: 120,
    });
    if (!usernameValidation.ok) {
      res.status(400).json({ error: usernameValidation.error });
      return;
    }
    const username = usernameValidation.value;
    const key = normalizeLoginIdentifier(username);
    const currentUsers = typeof getAuthUsers === "function" ? getAuthUsers() : [];
    if (currentUsers.some((user) => normalizeLoginIdentifier(user?.username) === key)) {
      res.status(409).json({ error: "Ja existe um usuario com este username." });
      return;
    }
    const passwordValidation = validateAuthUserPasswordInput(body.password);
    if (!passwordValidation.ok) {
      res.status(400).json({ error: passwordValidation.error });
      return;
    }

    const rolesByProject = normalizeRolesByProject(body.rolesByProject ?? {});
    const fromRoles = Object.keys(rolesByProject);
    const allowedProjects =
      fromRoles.length > 0
        ? normalizeProjectCodesList(fromRoles, [])
        : normalizeAllowedProjectsInput(body.allowedProjects ?? body.projects, [APP_PROJECT_CODE]);
    const accountType = normalizeAccountType(body.accountType, "user");
    const isSuperAdmin = body.isSuperAdmin === true;
    if (accountType === "project") {
      if (isSuperAdmin) {
        res.status(400).json({ error: "Conta de projeto nao pode ser super admin." });
        return;
      }
      if (allowedProjects.length !== 1) {
        res
          .status(400)
          .json({ error: "Conta de projeto deve ter exatamente 1 projeto permitido." });
        return;
      }
    } else if (allowedProjects.length === 0 && !isSuperAdmin) {
      res.status(400).json({ error: "Informe ao menos um projeto permitido." });
      return;
    }

    const nowIso = new Date().toISOString();
    const normalized = normalizeAuthUserDefinition({
      id: body.id ?? slugifyId(username, "user"),
      username,
      password: passwordValidation.value,
      role: normalizeAuthRole(body.role, AUTH_ROLE_VIEWER),
      isActive: body.isActive !== false,
      isSuperAdmin,
      accountType,
      allowedProjects,
      rolesByProject,
      defaultProjectCode:
        accountType === "project"
          ? allowedProjects[0]
          : pickDefaultProjectCode(allowedProjects, body.defaultProjectCode),
      createdAt: nowIso,
      updatedAt: nowIso,
      lastPasswordResetAt: nowIso,
    });
    if (!normalized) {
      res.status(400).json({ error: "Dados de usuario invalidos." });
      return;
    }
    if (
      accountType === "project" &&
      normalizeAccountType(normalized.accountType, "user") !== "project"
    ) {
      res.status(400).json({ error: "Conta de projeto deve ter exatamente 1 projeto permitido." });
      return;
    }
    setAuthUsers([...currentUsers, normalized]);
    await schedulePersistAuthUsers();
    const created = getAuthUserByUsername(username);
    await writeAuditLog(
      req,
      "admin.user.create",
      "auth_user",
      normalized.id,
      null,
      sanitizeAuthUserForList(created)
    );
    res.status(201).json({ ok: true, user: sanitizeAuthUserForList(created) });
  });

  app.patch("/api/admin/users/:id", requireSuperAdmin, async (req, res) => {
    const body = parseJsonBody(req, res);
    if (!body) return;
    const userId = String(req.params.id ?? "").trim();
    const currentUsers = typeof getAuthUsers === "function" ? getAuthUsers() : [];
    const current = getAuthUserById(userId);
    if (!current) {
      res.status(404).json({ error: "Usuario nao encontrado." });
      return;
    }

    const nextRolesByProject =
      body.rolesByProject !== undefined
        ? normalizeRolesByProject(body.rolesByProject)
        : (current.rolesByProject ?? {});
    const fromRoles = Object.keys(nextRolesByProject);
    const nextAllowedProjects =
      fromRoles.length > 0
        ? normalizeProjectCodesList(fromRoles, [])
        : body.allowedProjects !== undefined || body.projects !== undefined
          ? normalizeAllowedProjectsInput(body.allowedProjects ?? body.projects, [])
          : getAllowedProjectsFromUser(current);
    const nextAccountType = normalizeAccountType(
      body.accountType !== undefined ? body.accountType : current.accountType,
      "user"
    );
    const nextIsSuperAdmin =
      body.isSuperAdmin !== undefined ? body.isSuperAdmin === true : current.isSuperAdmin === true;
    const nextIsActive =
      body.isActive !== undefined ? body.isActive === true : current.isActive !== false;
    if (nextAccountType === "project") {
      if (nextIsSuperAdmin) {
        res.status(400).json({ error: "Conta de projeto nao pode ser super admin." });
        return;
      }
      if (nextAllowedProjects.length !== 1) {
        res
          .status(400)
          .json({ error: "Conta de projeto deve ter exatamente 1 projeto permitido." });
        return;
      }
    } else if (nextAllowedProjects.length === 0 && !nextIsSuperAdmin) {
      res.status(400).json({ error: "Informe ao menos um projeto permitido." });
      return;
    }
    if (
      current.isSuperAdmin === true &&
      current.isActive !== false &&
      (nextIsSuperAdmin !== true || nextIsActive === false) &&
      countActiveSuperAdmins(currentUsers) <= 1
    ) {
      res
        .status(400)
        .json({ error: "Nao e permitido remover o privilegio do ultimo super admin ativo." });
      return;
    }

    const passwordProvided = typeof body.password === "string" && body.password.length > 0;
    let nextPasswordHash = String(current.passwordHash ?? "");
    let nextPasswordResetAt = current.lastPasswordResetAt ?? null;
    if (passwordProvided) {
      const pv = validateAuthUserPasswordInput(body.password);
      if (!pv.ok) {
        res.status(400).json({ error: pv.error });
        return;
      }
      nextPasswordHash = createPbkdf2Credential(pv.value);
      nextPasswordResetAt = new Date().toISOString();
    }

    const normalized = normalizeAuthUserDefinition({
      ...current,
      username: body.username !== undefined ? body.username : current.username,
      role: body.role !== undefined ? normalizeAuthRole(body.role, current.role) : current.role,
      isActive: nextIsActive,
      isSuperAdmin: nextIsSuperAdmin,
      accountType: nextAccountType,
      allowedProjects: nextAllowedProjects,
      rolesByProject: nextRolesByProject,
      defaultProjectCode:
        nextAccountType === "project"
          ? nextAllowedProjects[0]
          : pickDefaultProjectCode(
              nextAllowedProjects,
              body.defaultProjectCode ?? current.defaultProjectCode
            ),
      passwordHash: nextPasswordHash,
      updatedAt: new Date().toISOString(),
      lastPasswordResetAt: nextPasswordResetAt,
    });
    if (!normalized) {
      res.status(400).json({ error: "Dados de usuario invalidos." });
      return;
    }
    if (
      nextAccountType === "project" &&
      normalizeAccountType(normalized.accountType, "user") !== "project"
    ) {
      res.status(400).json({ error: "Conta de projeto deve ter exatamente 1 projeto permitido." });
      return;
    }

    const usernameChanged =
      normalizeLoginIdentifier(current.username) !== normalizeLoginIdentifier(normalized.username);
    const before = sanitizeAuthUserForList(current);
    setAuthUsers(currentUsers.map((item) => (String(item?.id) === userId ? normalized : item)));
    await schedulePersistAuthUsers();
    await synchronizeAuthSessionsForUser(usernameChanged ? current.username : normalized.username, {
      revoke: usernameChanged || normalized.isActive === false || passwordProvided,
    });
    const updated = getAuthUserById(userId) ?? getAuthUserByUsername(normalized.username);
    await writeAuditLog(
      req,
      "admin.user.update",
      "auth_user",
      userId,
      before,
      sanitizeAuthUserForList(updated)
    );
    res.json({ ok: true, user: sanitizeAuthUserForList(updated) });
  });

  app.delete("/api/admin/users/:id", requireSuperAdmin, async (req, res) => {
    const userId = String(req.params.id ?? "").trim();
    if (!userId) {
      res.status(400).json({ error: "Usuario invalido." });
      return;
    }
    const currentUsers = typeof getAuthUsers === "function" ? getAuthUsers() : [];
    const target = getAuthUserById(userId);
    if (!target) {
      res.status(404).json({ error: "Usuario nao encontrado." });
      return;
    }
    const session = getAuthSessionFromRequest(req);
    const actor = getAuthUserByUsername(session?.username);
    if (String(actor?.id ?? "") === userId) {
      res.status(400).json({ error: "Nao e permitido remover o usuario atualmente logado." });
      return;
    }
    if (target.isSuperAdmin === true) {
      const activeSuperAdmins = currentUsers.filter(
        (user) => user?.isSuperAdmin === true && user?.isActive !== false
      );
      if (activeSuperAdmins.length <= 1) {
        res.status(400).json({ error: "Nao e permitido remover o ultimo super admin ativo." });
        return;
      }
    }
    const before = sanitizeAuthUserForList(target);
    setAuthUsers(currentUsers.filter((user) => String(user?.id ?? "") !== userId));
    await schedulePersistAuthUsers();
    await synchronizeAuthSessionsForUser(target.username, { revoke: true });
    await writeAuditLog(req, "admin.user.delete", "auth_user", userId, before, null);
    res.json({ ok: true, removedId: userId });
  });

  app.put("/api/admin/users/:id/memberships", requireSuperAdmin, async (req, res) => {
    const body = parseJsonBody(req, res);
    if (!body) return;
    const userId = String(req.params.id ?? "").trim();
    const currentUsers = typeof getAuthUsers === "function" ? getAuthUsers() : [];
    const current = getAuthUserById(userId);
    if (!current) {
      res.status(404).json({ error: "Usuario nao encontrado." });
      return;
    }
    const rolesByProject = normalizeRolesByProject(body.rolesByProject ?? {});
    const allowedProjects = Object.keys(rolesByProject);
    const accountType = normalizeAccountType(current.accountType, "user");
    if (accountType === "project" && allowedProjects.length !== 1) {
      res.status(400).json({ error: "Conta de projeto deve ter exatamente 1 projeto permitido." });
      return;
    }
    if (
      accountType !== "project" &&
      allowedProjects.length === 0 &&
      current.isSuperAdmin !== true
    ) {
      res.status(400).json({ error: "Informe ao menos um projeto com role." });
      return;
    }
    const before = sanitizeAuthUserForList(current);
    const normalized = normalizeAuthUserDefinition({
      ...current,
      allowedProjects,
      rolesByProject,
      defaultProjectCode:
        accountType === "project"
          ? allowedProjects[0]
          : pickDefaultProjectCode(allowedProjects, current.defaultProjectCode),
      updatedAt: new Date().toISOString(),
    });
    if (!normalized) {
      res.status(400).json({ error: "Dados de usuario invalidos." });
      return;
    }
    if (
      accountType === "project" &&
      normalizeAccountType(normalized.accountType, "user") !== "project"
    ) {
      res.status(400).json({ error: "Conta de projeto deve ter exatamente 1 projeto permitido." });
      return;
    }
    setAuthUsers(currentUsers.map((item) => (String(item?.id) === userId ? normalized : item)));
    await schedulePersistAuthUsers();
    await synchronizeAuthSessionsForUser(normalized.username);
    const updated = getAuthUserById(userId) ?? getAuthUserByUsername(normalized.username);
    await writeAuditLog(
      req,
      "admin.membership.set",
      "auth_user",
      userId,
      before,
      sanitizeAuthUserForList(updated)
    );
    res.json({ ok: true, user: sanitizeAuthUserForList(updated) });
  });
}
