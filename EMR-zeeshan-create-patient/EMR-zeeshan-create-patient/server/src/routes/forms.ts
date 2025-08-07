import express from "express";
import { z } from "zod";
import { FormDAL } from "../models/Forms/formDAL";
import { createResponse } from "../utils/helpers";
import { authMiddleware as authenticateToken } from "../middleware/authMiddleware";
import {
  formTemplateValidation,
  formSubmissionValidation,
} from "../models/Forms/formSchema";

const router = express.Router();

// --- Form Templates ---

router.get("/form-templates", authenticateToken, async (req, res) => {
  try {
    const templates = await FormDAL.getAllTemplates(req.query);
    res.json(createResponse(true, "Templates fetched", templates));
  } catch (error: any) {
    res.status(500).json(
      createResponse(false, "Failed to fetch form-templates", null, {
        error: error.message,
      })
    );
  }
});

router.get("/form-templates/:id", authenticateToken, async (req, res) => {
  try {
    const template = await FormDAL.getTemplateById(Number(req.params.id));
    if (!template)
      return res.status(404).json(createResponse(false, "Template not found"));
    res.json(createResponse(true, "Template retrieved", template));
  } catch (error: any) {
    res.status(500).json(
      createResponse(false, "Failed to fetch template", null, {
        error: error.message,
      })
    );
  }
});

router.post("/form-templates", authenticateToken, async (req, res) => {
  try {
    const parsed = formTemplateValidation.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(
        createResponse(false, "Validation failed", null, {
          errors: parsed.error.errors,
        })
      );
    }
    
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(400).json(
        createResponse(false, "User ID is required", null)
      );
    }
    
    const template = await FormDAL.createTemplate({
      ...parsed.data,
      createdBy: Number(userId),
    });
    res.status(201).json(createResponse(true, "Template created", template));
  } catch (error: any) {
    res.status(500).json(
      createResponse(false, "Failed to create template", null, {
        error: error.message,
      })
    );
  }
});

router.patch("/form-templates/:id", authenticateToken, async (req, res) => {
  try {
    const updated = await FormDAL.updateTemplate(
      Number(req.params.id),
      req.body
    );
    if (!updated.length)
      return res.status(404).json(createResponse(false, "Template not found"));
    res.json(createResponse(true, "Template updated", updated[0]));
  } catch (error: any) {
    res.status(500).json(
      createResponse(false, "Failed to update template", null, {
        error: error.message,
      })
    );
  }
});

router.delete("/form-templates/:id", authenticateToken, async (req, res) => {
  try {
    await FormDAL.deleteTemplate(Number(req.params.id));
    res.json(createResponse(true, "Template deleted"));
  } catch (error: any) {
    res.status(500).json(
      createResponse(false, "Failed to delete template", null, {
        error: error.message,
      })
    );
  }
});

// --- Form Submissions ---

router.get("/form-submissions", authenticateToken, async (req, res) => {
  try {
    const submissions = await FormDAL.getAllSubmissions(req.query);
    res.json(createResponse(true, "Submissions fetched", submissions));
  } catch (error: any) {
    res.status(500).json(
      createResponse(false, "Failed to fetch submissions", null, {
        error: error.message,
      })
    );
  }
});

router.get("/form-submissions/:id", authenticateToken, async (req, res) => {
  try {
    const submission = await FormDAL.getSubmissionById(Number(req.params.id));
    if (!submission)
      return res
        .status(404)
        .json(createResponse(false, "Submission not found"));
    res.json(createResponse(true, "Submission retrieved", submission));
  } catch (error: any) {
    res.status(500).json(
      createResponse(false, "Failed to fetch submission", null, {
        error: error.message,
      })
    );
  }
});

router.post("/form-submissions", authenticateToken, async (req, res) => {
  try {
    const parsed = formSubmissionValidation.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(
        createResponse(false, "Validation failed", null, {
          errors: parsed.error.errors,
        })
      );
    }
    
    // Use authenticated user's ID if userId not provided
    const userId = parsed.data.userId || (req as any).userId;
    if (!userId) {
      return res.status(400).json(
        createResponse(false, "User ID is required", null)
      );
    }
    
    const submission = await FormDAL.createSubmission({
      ...parsed.data,
      userId: Number(userId),
    });
    res
      .status(201)
      .json(createResponse(true, "Submission created", submission));
  } catch (error: any) {
    res.status(500).json(
      createResponse(false, "Failed to create submission", null, {
        error: error.message,
      })
    );
  }
});

router.patch("/form-submissions/:id", authenticateToken, async (req, res) => {
  try {
    const updated = await FormDAL.updateSubmission(
      Number(req.params.id),
      req.body
    );
    if (!updated.length)
      return res
        .status(404)
        .json(createResponse(false, "Submission not found"));
    res.json(createResponse(true, "Submission updated", updated[0]));
  } catch (error: any) {
    res.status(500).json(
      createResponse(false, "Failed to update submission", null, {
        error: error.message,
      })
    );
  }
});

router.delete("/form-submissions/:id", authenticateToken, async (req, res) => {
  try {
    await FormDAL.deleteSubmission(Number(req.params.id));
    res.json(createResponse(true, "Submission deleted"));
  } catch (error: any) {
    res.status(500).json(
      createResponse(false, "Failed to delete submission", null, {
        error: error.message,
      })
    );
  }
});

export default router;
