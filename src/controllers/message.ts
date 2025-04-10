// import { Hono } from "hono";
// import { createKeyMiddleware } from "../middlewares/key.middleware";
// import { requestValidator } from "../middlewares/validation.middleware";
// import { z } from "zod";
// import * as whatsapp from "wa-multi-session";
// import { HTTPException } from "hono/http-exception";

// export const createMessageController = () => {
//   const app = new Hono();

//   const sendMessageSchema = z.object({
//     session: z.string(),
//     to: z.string(),
//     text: z.string(),
//   });

//   app.post(
//     "/send-text",
//     createKeyMiddleware(),
//     requestValidator("json", sendMessageSchema),
//     async (c) => {
//       const payload = c.req.valid("json");
//       const isExist = whatsapp.getSession(payload.session);
//       if (!isExist) {
//         throw new HTTPException(400, {
//           message: "Session does not exist",
//         });
//       }

//       await whatsapp.sendTyping({
//         sessionId: payload.session,
//         to: payload.to,
//         duration: Math.min(5000, payload.text.length * 50),
//       });

//       const response = await whatsapp.sendTextMessage({
//         sessionId: payload.session,
//         to: payload.to,
//         text: payload.text,
//       });

//       return c.json({
//         data: response,
//       });
//     }
//   );

//   app.get(
//     "/send-text",
//     createKeyMiddleware(),
//     requestValidator("query", sendMessageSchema),
//     async (c) => {
//       const payload = c.req.valid("query");
//       const isExist = whatsapp.getSession(payload.session);
//       if (!isExist) {
//         throw new HTTPException(400, {
//           message: "Session does not exist",
//         });
//       }

//       const response = await whatsapp.sendTextMessage({
//         sessionId: payload.session,
//         to: payload.to,
//         text: payload.text,
//       });

//       return c.json({
//         data: response,
//       });
//     }
//   );

//   app.post(
//     "/send-image",
//     createKeyMiddleware(),
//     requestValidator(
//       "json",
//       sendMessageSchema.merge(
//         z.object({
//           image_url: z.string(),
//         })
//       )
//     ),
//     async (c) => {
//       const payload = c.req.valid("json");
//       const isExist = whatsapp.getSession(payload.session);
//       if (!isExist) {
//         throw new HTTPException(400, {
//           message: "Session does not exist",
//         });
//       }

//       await whatsapp.sendTyping({
//         sessionId: payload.session,
//         to: payload.to,
//         duration: Math.min(5000, payload.text.length * 50),
//       });

//       const response = await whatsapp.sendImage({
//         sessionId: payload.session,
//         to: payload.to,
//         text: payload.text,
//         media: payload.image_url,
//       });

//       return c.json({
//         data: response,
//       });
//     }
//   );
//   app.post(
//     "/send-document",
//     createKeyMiddleware(),
//     requestValidator(
//       "json",
//       sendMessageSchema.merge(
//         z.object({
//           document_url: z.string(),
//           document_name: z.string(),
//         })
//       )
//     ),
//     async (c) => {
//       const payload = c.req.valid("json");
//       const isExist = whatsapp.getSession(payload.session);
//       if (!isExist) {
//         throw new HTTPException(400, {
//           message: "Session does not exist",
//         });
//       }

//       await whatsapp.sendTyping({
//         sessionId: payload.session,
//         to: payload.to,
//         duration: Math.min(5000, payload.text.length * 50),
//       });

//       const response = await whatsapp.sendDocument({
//         sessionId: payload.session,
//         to: payload.to,
//         text: payload.text,
//         media: payload.document_url,
//         filename: payload.document_name,
//       });

//       return c.json({
//         data: response,
//       });
//     }
//   );

//   app.post(
//     "/send-sticker",
//     createKeyMiddleware(),
//     requestValidator(
//       "json",
//       sendMessageSchema.merge(
//         z.object({
//           image_url: z.string(),
//         })
//       )
//     ),
//     async (c) => {
//       const payload = c.req.valid("json");
//       const isExist = whatsapp.getSession(payload.session);
//       if (!isExist) {
//         throw new HTTPException(400, {
//           message: "Session does not exist",
//         });
//       }

//       const response = await whatsapp.sendSticker({
//         sessionId: payload.session,
//         to: payload.to,
//         media: payload.image_url,
//       });

//       return c.json({
//         data: response,
//       });
//     }
//   );

//   return app;
// };







import { Hono } from "hono";
import { createKeyMiddleware } from "../middlewares/key.middleware";
import { customValidator } from "../middlewares/validation.middleware";
import { z } from "zod";
import * as whatsapp from "wa-multi-session";
import { HTTPException } from "hono/http-exception";

export const createMessageController = () => {
  const app = new Hono();

  const sendMessageSchema = z.object({
    session: z.string(),
    to: z.string(),
    text: z.string(),
  });

  app.post(
    "/send-text",
    createKeyMiddleware(),
    customValidator("json", sendMessageSchema),
    async (c) => {
      const payload = c.req.valid("json");
      const isExist = whatsapp.getSession(payload.session);
      if (!isExist) {
        throw new HTTPException(400, {
          message: "Session does not exist",
        });
      }

      const response = await whatsapp.sendTextMessage({
        sessionId: payload.session,
        to: payload.to,
        text: payload.text,
      });

      return c.json({
        data: response,
      });
    }
  );

  app.get(
    "/send-text",
    createKeyMiddleware(),
    customValidator("query", sendMessageSchema),
    async (c) => {
      const payload = c.req.valid("query");
      const isExist = whatsapp.getSession(payload.session);
      if (!isExist) {
        throw new HTTPException(400, {
          message: "Session does not exist",
        });
      }

      const response = await whatsapp.sendTextMessage({
        sessionId: payload.session,
        to: payload.to,
        text: payload.text,
      });

      return c.json({
        data: response,
      });
    }
  );


  const sendBulkMessageSchema = z.object({
    session: z.string(),
    to: z.array(z.string()), // Accepts multiple numbers
    text: z.string(),
  });
  


  app.get(
    "/send-bulk-text",
    createKeyMiddleware(),
    customValidator("query", sendBulkMessageSchema), // Updated schema
    async (c) => {
      const payload = c.req.valid("query");
      const isExist = whatsapp.getSession(payload.session);
      if (!isExist) {
        throw new HTTPException(400, {
          message: "Session does not exist",
        });
      }
  
      const numbers = Array.isArray(payload.to) ? payload.to : [payload.to]; // Ensure it's an array
      const responses = [];
  
      for (const number of numbers) {
        try {
          const response = await whatsapp.sendTextMessage({
            sessionId: payload.session,
            to: number,
            text: payload.text,
          });
          responses.push({ number, status: "sent", response });
        } catch (error) {
          responses.push({ number, status: "failed", error: "error" });
        }
      }
  
      return c.json({
        data: responses,
      });
    }
  );
  

const sendBulkDocumentSchema = z.object({
  session: z.string(),
  to: z.array(z.string()), // Accepts multiple numbers
  file_url: z.string(),   // URL of the file
  file_name: z.string(),  // Name of the file
  caption: z.string().optional(), // Optional caption for the file
});


// app.post(
//   "/send-document-Bulk",
//   createKeyMiddleware(),
//   customValidator(
//     "json",
//     sendMessageSchema.merge(
//       z.object({
//         document_url: z.string(),
//         document_name: z.string(),
//         to: z.array(z.string()), // Accept an array of phone numbers
//       })
//     )
//   ),
//   async (c) => {
//     const payload = c.req.valid("json");
//     const isExist = whatsapp.getSession(payload.session);
//     if (!isExist) {
//       throw new HTTPException(400, {
//         message: "Session does not exist",
//       });
//     }

//     // Array to store responses for each number
//     const responses = [];

//     // Iterate over each number and send the document
//     for (const number of payload.to) {
//       try {
//         const response = await whatsapp.sendDocument({
//           sessionId: payload.session,
//           to: number, // Send to the current number in the loop
//           text: payload.text,
//           media: payload.document_url,
//           filename: payload.document_name,
//         });
//         responses.push({ number, success: true, response });
//       } catch (error) {
//         responses.push({ number, success: false, error: "error" });
//       }
//     }

//     return c.json({
//       data: responses,
//     });
//   }
// );

app.post(
  "/send-document-Bulk",
  createKeyMiddleware(),
  customValidator(
    "json",
    sendMessageSchema.merge(
      z.object({
        document_url: z.string(),
        document_name: z.string(),
        to: z.array(z.string()), // Accept an array of phone numbers
      })
    )
  ),
  async (c) => {
    const payload = c.req.valid("json");
    const isExist = whatsapp.getSession(payload.session);
    if (!isExist) {
      throw new HTTPException(400, {
        message: "Session does not exist",
      });
    }

    const retryAttempts = 3; // Retry failed requests up to 3 times
    const responses = [];

    // Function to send document with retry logic
    const sendDocumentWithRetry = async (number, attemptsLeft) => {
      try {
        const response = await whatsapp.sendDocument({
          sessionId: payload.session,
          to: number,
          text: payload.text,
          media: payload.document_url,
          filename: payload.document_name,
        });
        return { number, success: true, response };
      } catch (error) {
        if (attemptsLeft > 0) {
          console.log(`Retrying number ${number}, attempts left: ${attemptsLeft}`);
          return sendDocumentWithRetry(number, attemptsLeft - 1); // Retry
        } else {
          return { number, success: false, error: error.message };
        }
      }
    };

    // Process numbers sequentially
    for (const number of payload.to) {
      const result = await sendDocumentWithRetry(number, retryAttempts);
      responses.push(result);
    }

    return c.json({
      data: responses,
    });
  }
);



  app.post(
    "/send-image",
    createKeyMiddleware(),
    customValidator(
      "json",
      sendMessageSchema.merge(
        z.object({
          image_url: z.string(),
        })
      )
    ),
    async (c) => {
      const payload = c.req.valid("json");
      const isExist = whatsapp.getSession(payload.session);
      if (!isExist) {
        throw new HTTPException(400, {
          message: "Session does not exist",
        });
      }

      const response = await whatsapp.sendImage({
        sessionId: payload.session,
        to: payload.to,
        text: payload.text,
        media: payload.image_url,
      });

      return c.json({
        data: response,
      });
    }
  );
  app.post(
    "/send-document",
    createKeyMiddleware(),
    customValidator(
      "json",
      sendMessageSchema.merge(
        z.object({
          document_url: z.string(),
          document_name: z.string(),
        })
      )
    ),
    async (c) => {
      const payload = c.req.valid("json");
      const isExist = whatsapp.getSession(payload.session);
      if (!isExist) {
        throw new HTTPException(400, {
          message: "Session does not exist",
        });
      }

      const response = await whatsapp.sendDocument({
        sessionId: payload.session,
        to: payload.to,
        text: payload.text,
        media: payload.document_url,
        filename: payload.document_name,
      });

      return c.json({
        data: response,
      });
    }
  );
  

 app.post(
  "/send-document-Bulk-files",
  createKeyMiddleware(),
  customValidator(
    "json",
    sendMessageSchema.merge(
      z.object({
        documents: z.array(
          z.object({
            document_url: z.string(),
            document_name: z.string(),
          })
        ),
        to: z.array(z.string()), // Accept an array of phone numbers
      })
    )
  ),
  async (c) => {
    const payload = c.req.valid("json");
    const isExist = whatsapp.getSession(payload.session);
    if (!isExist) {
      throw new HTTPException(400, {
        message: "Session does not exist",
      });
    }

    const retryAttempts = 3; // Retry failed requests up to 3 times
    const responses = [];

    // Function to send document with retry logic
    const sendDocumentWithRetry = async (number, document, attemptsLeft) => {
      try {
        const response = await whatsapp.sendDocument({
          sessionId: payload.session,
          to: number,
          text: payload.text,
          media: document.document_url,
          filename: document.document_name,
        });
        return { number, document: document.document_name, success: true, response };
      } catch (error) {
        if (attemptsLeft > 0) {
          console.log(`Retrying number ${number} for document ${document.document_name}, attempts left: ${attemptsLeft}`);
          return sendDocumentWithRetry(number, document, attemptsLeft - 1); // Retry
        } else {
          return { number, document: document.document_name, success: false, error: error.message };
        }
      }
    };

    // Process numbers and documents sequentially
    for (const number of payload.to) {
      for (const document of payload.documents) {
        const result = await sendDocumentWithRetry(number, document, retryAttempts);
        responses.push(result);
      }
    }

    return c.json({
      data: responses,
    });
  }
);

  const sendMessageAndDocumentSchema = z.object({
    session: z.string(),
    to: z.array(z.string()), // Multiple recipients
    text: z.string(), // Required text message
    documents: z.array(
      z.object({
        document_url: z.string(),
        document_name: z.string(),
      })
    ), // Required documents
  });

  app.post(
    "/send-message-then-document",
    createKeyMiddleware(),
    customValidator("json", sendMessageAndDocumentSchema),
    async (c) => {
      const payload = c.req.valid("json");

      // Check if the session exists
      const isExist = whatsapp.getSession(payload.session);
      if (!isExist) {
        throw new HTTPException(400, {
          message: "Session does not exist",
        });
      }

      const responses = [];
      const retryAttempts = 3; // Number of retries for failed document sends

      // Function to send document with retry logic
      const sendDocumentWithRetry = async (number, document, attemptsLeft) => {
        try {
          const response = await whatsapp.sendDocument({
            sessionId: payload.session,
            to: number,
            text: "", // No text needed since we already sent it
            media: document.document_url,
            filename: document.document_name,
          });
          return { number, document: document.document_name, success: true, response };
        } catch (error) {
          if (attemptsLeft > 0) {
            console.log(`Retrying ${number} for ${document.document_name}, attempts left: ${attemptsLeft}`);
            return sendDocumentWithRetry(number, document, attemptsLeft - 1);
          } else {
            return { number, document: document.document_name, success: false, error: error.message };
          }
        }
      };

      try {
        for (const number of payload.to) {
          try {
            // Send text message first
            const textResponse = await whatsapp.sendTextMessage({
              sessionId: payload.session,
              to: number,
              text: payload.text,
            });
            responses.push({ type: "text", number, success: true, response: textResponse });

            // Send documents to the same number
            for (const document of payload.documents) {
              const result = await sendDocumentWithRetry(number, document, retryAttempts);
              responses.push(result);
            }
          } catch (error) {
            responses.push({ type: "error", number, success: false, error: error.message });
          }
        }

        return c.json({ data: responses });
      } catch (error) {
        throw new HTTPException(500, {
          message: "Error while sending messages or documents",
          details: error.message,
        });
      }
    }
  );

app.post(
  "/send-document-Bulk1",
  createKeyMiddleware(),
  customValidator(
    "json",
    sendMessageSchema.merge(
      z.object({
        document_url: z.string(),
        document_name: z.string(),
        to: z.array(z.string()), // Accept an array of phone numbers
      })
    )
  ),
  async (c) => {
    const payload = c.req.valid("json");
    const isExist = whatsapp.getSession(payload.session);
    if (!isExist) {
      throw new HTTPException(400, {
        message: "Session does not exist",
      });
    }

    const retryAttempts = 3; // Retry failed requests up to 3 times
    const responses = [];

    // Function to send document with retry logic
    const sendDocumentWithRetry = async (number, attemptsLeft) => {
      try {
        const response = await whatsapp.sendDocument({
          sessionId: payload.session,
          to: number,
          text: payload.text,
          media: payload.document_url,
          filename: payload.document_name,
        });
        return { number, success: true, response };
      } catch (error) {
        if (attemptsLeft > 0) {
          console.log(`Retrying number ${number}, attempts left: ${attemptsLeft}`);
          return sendDocumentWithRetry(number, attemptsLeft - 1); // Retry
        } else {
          return { number, success: false, error: error.message };
        }
      }
    };

    // Process numbers sequentially
    for (const number of payload.to) {
      const result = await sendDocumentWithRetry(number, retryAttempts);
      responses.push(result);
    }

    return c.json({
      data: responses,
    });
  }
);

  
  return app;
};

