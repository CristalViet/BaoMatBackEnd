const APP_PERMISSIONS = [
  { key: "dashboard.read", name: "View dashboard", group: "dashboard" },
  { key: "employees.read", name: "View employees", group: "employees" },
  { key: "employees.create", name: "Create employee", group: "employees" },
  { key: "employees.update", name: "Update employee", group: "employees" },
  { key: "employees.delete", name: "Delete employee", group: "employees" },
  { key: "employees.qualifications.manage", name: "Manage qualifications", group: "employees" },
  { key: "employees.documents.manage", name: "Manage documents", group: "employees" },
  { key: "employees.emergency.manage", name: "Manage emergency contacts", group: "employees" },
  { key: "accounts.read", name: "View accounts", group: "accounts" },
  { key: "accounts.manage", name: "Manage accounts", group: "accounts" },
  { key: "roles.read", name: "View roles", group: "roles" },
  { key: "roles.manage", name: "Manage roles", group: "roles" },
];

module.exports = { APP_PERMISSIONS };
