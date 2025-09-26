
import { useContext } from "react";
import { AuthContext } from "./AuthContext";

// Exporting as a NAMED export
export const useAuth = () => useContext(AuthContext);