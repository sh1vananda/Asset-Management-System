// ==========================================
// ROLE DEFINITIONS (MATCH BACKEND EXACTLY)
// ==========================================

export const ROLES = {
  ADMIN: "admin",
  IT_MANAGER: "it_manager",
  EMPLOYEE: "employee",
};

// ==========================================
// PERMISSIONS LIST
// ==========================================

export const PERMISSIONS = {
  // Assets
  ADD_ASSET: "add_asset",
  EDIT_ASSET: "edit_asset",
  DELETE_ASSET: "delete_asset",
  VIEW_ALL_ASSETS: "view_all_assets",
  VIEW_OWN_ASSETS: "view_own_assets",

  // Assignments
  ASSIGN_ASSET: "assign_asset",
  RETURN_ASSET: "return_asset",

  // Issues
  REPORT_ISSUE: "report_issue",
  UPDATE_ISSUE_STATUS: "update_issue_status",
  CLOSE_ISSUE: "close_issue",

  // Users
  VIEW_ALL_USERS: "view_all_users",
  UPDATE_USER_ROLES: "update_user_roles",

  // Dashboard
  VIEW_DASHBOARD: "view_dashboard",
};

// ==========================================
// ROLE → PERMISSIONS MAPPING
// ==========================================

export const ROLE_PERMISSIONS = {
  // 🔥 ADMIN → FULL ACCESS
  [ROLES.ADMIN]: Object.values(PERMISSIONS),

  // 🔧 IT MANAGER → LIMITED ADMIN
  [ROLES.IT_MANAGER]: [
    PERMISSIONS.ADD_ASSET,
    PERMISSIONS.EDIT_ASSET,
    PERMISSIONS.VIEW_ALL_ASSETS,
    PERMISSIONS.ASSIGN_ASSET,
    PERMISSIONS.RETURN_ASSET,
    PERMISSIONS.REPORT_ISSUE,
    PERMISSIONS.UPDATE_ISSUE_STATUS,
    PERMISSIONS.CLOSE_ISSUE,
    PERMISSIONS.VIEW_DASHBOARD,
  ],

  // 👤 EMPLOYEE → LIMITED ACCESS
  [ROLES.EMPLOYEE]: [
    PERMISSIONS.VIEW_OWN_ASSETS,
    PERMISSIONS.REPORT_ISSUE,
  ],
};