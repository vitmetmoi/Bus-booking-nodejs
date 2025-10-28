
import { authorize } from "@/common/middleware/auth/authMiddleware";
import { ROLES } from "@/common/constants/role";

export const permission = authorize([ROLES.ADMIN]);
