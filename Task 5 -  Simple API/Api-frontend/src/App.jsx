import { BrowserRouter as Router,Routes,Route,Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider, useAuth } from "./components/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Tasks from "./components/Tasks";
import Login from "./components/Login";
import Register from "./components/Register";

const App = () => {
  // const { token } = useAuth();

  return (
    <AuthProvider>
      <Router>
        <ToastContainer />
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <Tasks />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/tasks" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
