export const canModifyRole = (requestingRoleId, targetRoleId) => {
    const roleHierarchy = {
      1: ["2", "3"], // SuperAdmin can modify Admin & Moderator
      2: ["3"],      // Admin can modify only Moderator
      3: [],         // Moderator cannot modify any role
    };
  
    return roleHierarchy[requestingRoleId]?.includes(targetRoleId.toString());
  };
  