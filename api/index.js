let appPromise;

function getStartupErrorMessage(error) {
  const message = String(error?.message ?? error ?? "").trim();
  if (!message) {
    return "API indisponivel. Verifique as variaveis de ambiente na Vercel.";
  }

  if (
    /AUTH_TOKEN_SECRET|Nenhum usu[aá]rio|APP_LOGIN_USERS_JSON|ADMIN_USERNAME|ADMIN_PASSWORD/i.test(
      message
    )
  ) {
    return `Configuracao da API incompleta: ${message}`;
  }

  return "API indisponivel. Verifique os logs do deploy na Vercel.";
}

async function getApp() {
  if (!appPromise) {
    appPromise = import("../server.js")
      .then((serverModule) => serverModule.createServerApp())
      .catch((error) => {
        appPromise = null;
        throw error;
      });
  }
  return appPromise;
}

export default async function handler(req, res) {
  try {
    const app = await getApp();
    return app(req, res);
  } catch (error) {
    console.error("[api] Falha ao iniciar aplicacao:", error);
    res.statusCode = 503;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(
      JSON.stringify({
        error: getStartupErrorMessage(error),
      })
    );
  }
}
