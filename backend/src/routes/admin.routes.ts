import { Router } from "express";
import { adminController as c } from "../controllers/admin.controller.js";
import { requireAdmin, requireStaff } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { customerUpdateSchema, designUpdateSchema, leadStatusSchema } from "../validators/misc.validator.js";

const r = Router();
r.get("/stats", ...requireStaff, c.stats);
r.get("/customers", ...requireStaff, c.customers);
r.patch("/customers/:id", ...requireAdmin, validateBody(customerUpdateSchema), c.updateCustomer);
r.get("/designs", ...requireStaff, c.designs);
r.patch("/designs/:id", ...requireStaff, validateBody(designUpdateSchema), c.updateDesign);
r.get("/leads", ...requireStaff, c.leads);
r.patch("/leads/:id", ...requireStaff, validateBody(leadStatusSchema), c.updateLead);
r.delete("/leads/:id", ...requireAdmin, c.deleteLead);
export default r;
