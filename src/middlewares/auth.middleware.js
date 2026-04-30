const prisma = require("../lib/prisma");
const { verifyAccessToken } = require("../utils/jwt");

async function authenticate(req, res, next) {
  try {
    console.log("Middleware triggered")
    const header = req.headers.authorization || "";
    const [type, token] = header.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const payload = verifyAccessToken(token);
    const user = await prisma.userAccount.findUnique({
      where: { id: payload.sub },
      include: {
        employee: true,
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user || user.status !== "ACTIVE") {
      return res.status(401).json({ message: "Account is not active" });
    }

    const roleCodes = user.roles.map((item) => item.role.code);
    const permissions = [
      ...new Set(
        user.roles.flatMap((item) =>
          item.role.permissions.map((permissionItem) => permissionItem.permission.key)
        )
      ),
    ];

    req.user = {
      id: user.id,
      email: user.email,
      employeeId: user.employeeId,
      employeeName: user.employee.fullName,
      roleCodes,
      permissions,
    };

    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

function authorize(requiredPermissions = []) {
  return (req, res, next) => {
    const userPermissions = req.user?.permissions || [];
    const hasPermission = requiredPermissions.every((permission) =>
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return next();
  };
}

module.exports = {
  authenticate,
  authorize,
};
