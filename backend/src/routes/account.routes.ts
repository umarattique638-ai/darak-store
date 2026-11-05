import { Router } from "express";
import { accountController as c } from "../controllers/account.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { addressSchema } from "../validators/order.validator.js";
import { designSchema, profileSchema } from "../validators/misc.validator.js";
import { orderLimiter } from "../middlewares/security.middleware.js";

/** Everything here belongs to the signed-in customer. */
const r = Router();
r.use(requireAuth);
r.patch("/profile", validateBody(profileSchema), c.updateProfile);
r.post("/addresses", validateBody(addressSchema), c.addAddress);
r.put("/addresses/:id", validateBody(addressSchema), c.updateAddress);
r.delete("/addresses/:id", c.deleteAddress);
r.get("/wishlist", c.wishlist);
r.get("/wishlist/ids", c.wishlistIds);
r.post("/wishlist/:id", c.toggleWishlist);
r.get("/designs", c.myDesigns);
r.post("/designs", orderLimiter, validateBody(designSchema), c.createDesign);
export default r;
