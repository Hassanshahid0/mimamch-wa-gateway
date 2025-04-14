

import { Hono } from "hono";
import { createKeyMiddleware } from "../middlewares/key.middleware";
import { customValidator } from "../middlewares/validation.middleware";
import { z } from "zod";
import * as whatsapp from "wa-multi-session";
import { HTTPException } from "hono/http-exception";

export const createMessageController = () => {
  const app = new Hono();

  // Schema for sending text message
  const sendMessageSchema = z.object({
    session: z.string(),
    to: z.string(),
    text: z.string(),
  });

  // POST /send-text
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

  // GET /send-text
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

  // // Schema for sending bulk text messages
  // const sendBulkMessageSchema = z.object({
  //   session: z.string(),
  //   to: z.array(z.string()), // Accepts multiple numbers
  //   text: z.string(),
  // });

  // // GET /send-bulk-text
  // app.get(
  //   "/send-bulk-text",
  //   createKeyMiddleware(),
  //   customValidator("query", sendBulkMessageSchema),
  //   async (c) => {
  //     const payload = c.req.valid("query");
  //     const isExist = whatsapp.getSession(payload.session);
  //     if (!isExist) {
  //       throw new HTTPException(400, {
  //         message: "Session does not exist",
  //       });
  //     }

  //     const numbers = Array.isArray(payload.to) ? payload.to : [payload.to];
  //     const responses = [];

  //     for (const number of numbers) {
  //       try {
  //         const response = await whatsapp.sendTextMessage({
  //           sessionId: payload.session,
  //           to: number,
  //           text: payload.text,
  //         });
  //         responses.push({ number, status: "sent", response });
  //       } catch (error) {
  //         responses.push({ number, status: "failed", error: "error" });
  //       }
  //     }

  //     return c.json({
  //       data: responses,
  //     });
  //   }
  // );

  // Schema for sending bulk text messages with scheduling
const sendBulkMessageSchema = z.object({
  session: z.string(),
  to: z.array(z.string()), // Accepts multiple numbers
  text: z.string(),
  executions: z.number().positive(), // Number of times to repeat
  maxDelay: z.number().positive().optional(), // User-defined max delay (default: 10)
});

// Helper function to generate random delay between 1 and maxDelay
const getRandomDelay = (maxDelay: number) => {
  return Math.floor(Math.random() * maxDelay) + 1; // Returns 1 to maxDelay seconds
};

// GET /send-bulk-text
app.get(
  "/send-bulk-text",
  createKeyMiddleware(),
  customValidator("query", sendBulkMessageSchema),
  async (c) => {
    const payload = c.req.valid("query");
    const isExist = whatsapp.getSession(payload.session);
    if (!isExist) {
      throw new HTTPException(400, {
        message: "Session does not exist",
      });
    }

    const numbers = Array.isArray(payload.to) ? payload.to : [payload.to];
    const allResponses = []; // Collect responses from all executions
    const maxDelay = payload.maxDelay || 10; // Default to 10 seconds if not provided

    // Execute message sending for specified number of times
    for (let exec = 1; exec <= payload.executions; exec++) {
      const executionResponses = []; // Responses for current execution
      console.log(`Starting execution ${exec} of ${payload.executions}`);

      for (const [index, number] of numbers.entries()) {
        try {
          // Send message
          const response = await whatsapp.sendTextMessage({
            sessionId: payload.session,
            to: number,
            text: payload.text,
          });
          
          executionResponses.push({
            number,
            status: "sent",
            response,
            execution: exec,
            timestamp: new Date().toISOString(),
          });

          // Add random delay between messages (except after last message)
          if (index < numbers.length - 1) {
            const delay = getRandomDelay(maxDelay);
            console.log(`Waiting ${delay} seconds before next message`);
            await new Promise(resolve => setTimeout(resolve, delay * 1000));
          }
        } catch (error) {
          executionResponses.push({
            number,
            status: "failed",
            error: error.message || "Unknown error",
            execution: exec,
            timestamp: new Date().toISOString(),
          });
        }
      }

      // Add current execution's responses to the main array
      allResponses.push(...executionResponses);
    }

    return c.json({
      data: allResponses,
      summary: {
        totalExecutions: payload.executions,
        totalMessages: allResponses.length,
        successCount: allResponses.filter(r => r.status === "sent").length,
        failureCount: allResponses.filter(r => r.status === "failed").length,
        maxDelayUsed: maxDelay,
      }
    });
  }
);


  
  // Schema for sending documents in bulk
  const sendBulkDocumentSchema = z.object({
    session: z.string(),
    to: z.array(z.string()), // Accepts multiple numbers
    file_url: z.string(),    // URL of the file
    file_name: z.string(),   // Name of the file
    caption: z.string().optional(), // Optional caption for the file
  });

  // POST /send-document-Bulk
  app.post(
    "/send-document-Bulk",
    createKeyMiddleware(),
    customValidator("json", sendBulkDocumentSchema),
    async (c) => {
      const payload = c.req.valid("json");
      const isExist = whatsapp.getSession(payload.session);
      if (!isExist) {
        throw new HTTPException(400, {
          message: "Session does not exist",
        });
      }

      const retryAttempts = 3;
      const responses = [];

      const sendDocumentWithRetry = async (number: string, attemptsLeft: number) => {
        try {
          const response = await whatsapp.sendDocument({
            sessionId: payload.session,
            to: number,
            text: payload.caption || "",
            media: payload.file_url,
            filename: payload.file_name,
          });
          return { number, success: true, response };
        } catch (error) {
          if (attemptsLeft > 0) {
            console.log(`Retrying number ${number}, attempts left: ${attemptsLeft}`);
            return sendDocumentWithRetry(number, attemptsLeft - 1);
          } else {
            return { number, success: false, error: "error" };
          }
        }
      };

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


