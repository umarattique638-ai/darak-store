import { Router } from "express";
import { orderController as c } from "../controllers/order.controller.js";
import { requireAuth, requireStaff } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { orderLimiter, trackLimiter } from "../middlewares/security.middleware.js";
import { checkoutSchema, orderStatusSchema, quoteSchema, trackSchema } from "../validators/order.validator.js";

const r = Router();
r.post("/quote", validateBody(quoteSchema), c.quote);
r.post("/track", trackLimiter, validateBody(trackSchema), c.track);
r.post("/", requireAuth, orderLimiter, validateBody(checkoutSchema), c.checkout);
r.get("/mine", requireAuth, c.mine);
r.get("/mine/:number", requireAuth, c.mineOne);
r.post("/mine/:number/cancel", requireAuth, c.cancelMine);
// admin
r.get("/", ...requireStaff, c.list);
r.get("/:id", ...requireStaff, c.get);
r.patch("/:id/status", ...requireStaff, validateBody(orderStatusSchema), c.setStatus);
export default r;
