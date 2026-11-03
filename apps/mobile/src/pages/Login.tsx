import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonCheckbox,
} from "@ionic/react";
import { barbellOutline } from "ionicons/icons";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../lib/auth";
import { logActivity } from "../lib/api";

import "./Login.css";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(form.email, form.password);

      if (result.success) {
        try {
          await logActivity('user_login', form.email);
        } catch (activityError) {
          console.error("logActivity failed (non-blocking):", activityError);
        }

        navigate(result.user?.role === "admin" ? "/admin" : "/dashboard");
      } else {
        setError(result.message);
        setIsLoading(false);
      }
    } catch {
      setError("Cannot connect to the server. Start Apache and MySQL in XAMPP.");
      setIsLoading(false);
    }
  };
  
  return (
    <IonPage>
      <IonContent fullscreen className="login-content">
        <div className="login-split">
        <div className="login-container">

          {/* Logo */}
          <header className="login-header">
            <a href="/home" className="brand-logo">
              <div className="brand-icon">
                <IonIcon icon={barbellOutline} />
              </div>
              <div>
                <h1>
                  Fit<span>Planner</span>
                </h1>
                <p>Train Hardcore</p>
              </div>
            </a>
          </header>

          {/* Heading */}
          <section className="login-heading">
            <h2>Work Hard <br/>or Go Home</h2>
            <p>Sign in to continue your grind.</p>
          </section>

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="error-message">{error}</div>
            )}

            <div className="input-group">
              <IonLabel className="input-label">Email Address</IonLabel>
              <IonItem className="input-item" lines="none">
                <IonInput
                  type="email"
                  placeholder="athlete@fitplanner.com"
                  value={form.email}
                  onIonInput={(e) => handleInputChange("email", e.detail.value!)}
                />
              </IonItem>
            </div>

            <div className="input-group">
              <IonLabel className="input-label">Password</IonLabel>
              <IonItem className="input-item" lines="none">
                <IonInput
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onIonInput={(e) => handleInputChange("password", e.detail.value!)}
                />
              </IonItem>
            </div>

            <div className="login-options">
              <label className="remember-me">
                <IonCheckbox />
                <span>Remember Me</span>
              </label>
              <a href="#" className="forgot-password">
                Forgot Password?
              </a>
            </div>

            <IonButton
              type="submit"
              expand="block"
              className="signin-button"
              disabled={isLoading}
            >
              {isLoading ? "Entering..." : "Log in"}
            </IonButton>
          </form>

          {/* Divider */}
          <div className="divider">
            <div className="divider-line"></div>
            <span>or</span>
            <div className="divider-line"></div>
          </div>

        
          <p className="signup-link">
            Don't have an account?{" "}
            <IonButton
              fill="clear"
              routerLink="/register"
              className="link-button"
            >
              Sign up for free
            </IonButton>
          </p>

        </div>

        <div className="login-visual">
          <img
            src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80"
            alt="Athlete training"
          />
        </div>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;