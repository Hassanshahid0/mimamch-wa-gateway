// import * as whatsapp from "wa-multi-session";
// import { Hono } from "hono";
// import { requestValidator } from "../middlewares/validation.middleware";
// import { z } from "zod";
// import { createKeyMiddleware } from "../middlewares/key.middleware";
// import { toDataURL } from "qrcode";
// import { HTTPException } from "hono/http-exception";

// export const createSessionController = () => {
//   const app = new Hono();

//   app.get("/", createKeyMiddleware(), async (c) => {
//     return c.json({
//       data: whatsapp.getAllSession(),
//     });
//   });

//   const startSessionSchema = z.object({
//     session: z.string(),
//   });

//   app.post(
//     "/start",
//     createKeyMiddleware(),
//     requestValidator("json", startSessionSchema),
//     async (c) => {
//       const payload = c.req.valid("json");

//       const isExist = whatsapp.getSession(payload.session);
//       if (isExist) {
//         throw new HTTPException(400, {
//           message: "Session already exist",
//         });
//       }

//       const qr = await new Promise<string | null>(async (r) => {
//         await whatsapp.startSession(payload.session, {
//           onConnected() {
//             r(null);
//           },
//           onQRUpdated(qr) {
//             r(qr);
//           },
//         });
//       });

//       if (qr) {
//         return c.json({
//           qr: qr,
//         });
//       }

//       return c.json({
//         data: {
//           message: "Connected",
//         },
//       });
//     }
//   );
//   app.get(
//     "/start",
//     createKeyMiddleware(),
//     requestValidator("query", startSessionSchema),
//     async (c) => {
//       const payload = c.req.valid("query");

//       const isExist = whatsapp.getSession(payload.session);
//       if (isExist) {
//         throw new HTTPException(400, {
//           message: "Session already exist",
//         });
//       }

//       const qr = await new Promise<string | null>(async (r) => {
//         await whatsapp.startSession(payload.session, {
//           onConnected() {
//             r(null);
//           },
//           onQRUpdated(qr) {
//             r(qr);
//           },
//         });
//       });

//       if (qr) {
//         return c.render(`
//             <div id="qrcode"></div>

//             <script type="text/javascript">
//                 let qr = '${await toDataURL(qr)}'
//                 let image = new Image()
//                 image.src = qr
//                 document.body.appendChild(image)
//             </script>
//             `);
//       }

//       return c.json({
//         data: {
//           message: "Connected",
//         },
//       });
//     }
//   );

//   app.all("/logout", createKeyMiddleware(), async (c) => {
//     await whatsapp.deleteSession(
//       c.req.query().session || (await c.req.json()).session || ""
//     );
//     return c.json({
//       data: "success",
//     });
//   });

//   return app;
// };



import * as whatsapp from "wa-multi-session";
import { Hono } from "hono";
import { customValidator } from "../middlewares/validation.middleware";
import { z } from "zod";
import { createKeyMiddleware } from "../middlewares/key.middleware";
import { toDataURL } from "qrcode";
import { HTTPException } from "hono/http-exception";
export const createSessionController = () => {
  const app = new Hono();
  const sessionStatus: Record<string, boolean> = {}; // Stores session states
  app.get("/", createKeyMiddleware(), async (c) => {
    return c.json({ data: whatsapp.getAllSession() });
  });
  const startSessionSchema = z.object({ session: z.string() });
  app.post(
    "/start",
    createKeyMiddleware(),
    customValidator("json", startSessionSchema),
    async (c) => {
      const payload = c.req.valid("json");
      const sessionId = payload.session;
      const existingSession = whatsapp.getSession(sessionId);
      if (existingSession && sessionStatus[sessionId]) {
        return c.json({ data: { message: "Already Connected" } });
      }
      if (existingSession) {
        await whatsapp.deleteSession(sessionId);
        sessionStatus[sessionId] = false;
      }
      const qr = await new Promise<string | null>(async (resolve) => {
        await whatsapp.startSession(sessionId, {
          onConnected() {
            sessionStatus[sessionId] = true;
            resolve(null);
          },
          onQRUpdated(qr) {
            resolve(qr);
          },
        });
      });
      if (qr) return c.json({ qr });
      return c.json({ data: { message: "Connected" } });
    }
  );
  app.get(
    "/start",
    createKeyMiddleware(),
    customValidator("query", startSessionSchema),
    async (c) => {
      const payload = c.req.valid("query");
      const sessionId = payload.session;
      const existingSession = whatsapp.getSession(sessionId);
      if (existingSession && sessionStatus[sessionId]) {
        return c.json({ data: { message: "Authenticate" , status:"1"} });
      }
      if (existingSession) {
        await whatsapp.deleteSession(sessionId);
        sessionStatus[sessionId] = false;
      }
      const qr = await new Promise<string | null>(async (resolve) => {
        await whatsapp.startSession(sessionId, {
          onConnected() {
            sessionStatus[sessionId] = true;
            resolve(null);
          },
          onQRUpdated(qr) {
            resolve(qr);
          },
        });
      });
      if (qr) {
        return c.render(`
          <div id="qrcode"></div>
          <script type="text/javascript">
            let qr = '${await toDataURL(qr)}';
            let image = new Image();
            image.src = qr;
            document.body.appendChild(image);
          </script>
        `);
      }
      return c.json({ data: { message: "Connected" } });
    }
  );
  app.all("/logout", createKeyMiddleware(), async (c) => {
    const sessionId = c.req.query().session || (await c.req.json()).session || "";
    if (whatsapp.getSession(sessionId)) {
      await whatsapp.deleteSession(sessionId);
      sessionStatus[sessionId] = false;
      return c.json({ data: "Logged out successfully" });
    }
    return c.json({ data: "Session not found or already logged out" });
  });
  return app;
};
