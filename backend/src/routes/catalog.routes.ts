import { Router } from "express";
import { catalogController as c } from "../controllers/catalog.controller.js";
import { optionalAuth, requireAdmin, requireStaff } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { categorySchema, productSchema, productUpdateSchema, stockAdjustSchema } from "../validators/catalog.validator.js";

const r = Router();
// categories
r.get("/categories", optionalAuth, c.categories);
r.post("/categories", ...requireStaff, validateBody(categorySchema), c.createCategory);
r.patch("/categories/:id", ...requireStaff, validateBody(categorySchema.partial()), c.updateCategory);
r.delete("/categories/:id", ...requireAdmin, c.deleteCategory);
// products
r.get("/products", optionalAuth, c.products);
r.get("/products/slug/:slug", c.productBySlug);
r.get("/products/:id", ...requireStaff, c.productById);
r.post("/products", ...requireStaff, validateBody(productSchema), c.createProduct);
r.patch("/products/:id", ...requireStaff, validateBody(productUpdateSchema), c.updateProduct);
r.delete("/products/:id", ...requireAdmin, c.deleteProduct);
r.post("/products/:id/stock", ...requireStaff, validateBody(stockAdjustSchema), c.adjustStock);
r.get("/products/:id/stock", ...requireStaff, c.stockHistory);
export default r;
