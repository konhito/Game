// Better Auth completely disabled - using custom authentication only
export const authClient = {
  signIn: {
    social: async () => {
      console.log("Better Auth is disabled - use custom authentication");
      throw new Error("Better Auth is disabled - use custom authentication");
    }
  },
  getSession: async () => {
    console.log("Better Auth is disabled - use custom authentication");
    return null;
  }
};
