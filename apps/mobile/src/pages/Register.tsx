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
import { register } from "../lib/auth";
import { logActivity } from "../lib/api";

import "./Register.css";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await register(form.firstName, form.lastName, form.email, form.password);

      if (result.success) {
        try {
          await logActivity('account_created', form.email);
        } catch (activityError) {
          console.error("logActivity failed (non-blocking):", activityError);
        }

        navigate("/onboarding");
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
      <IonContent fullscreen className="register-content">
        <div className="register-shell">

          {/* LEFT: form */}
          <div className="register-container">

            {/* Logo */}
            <header className="register-header">
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
            <section className="register-heading">
              <h2>LET'S GET TO <br/> WORK.</h2>
              <p>Start your grind with Fit Planner. No excuses.</p>
            </section>

            {/* Form */}
            <form onSubmit={handleSubmit} className="register-form">
              {error && (
                <div className="error-message">{error}</div>
              )}

              <div className="name-row">
                <div className="input-group">
                  <IonLabel className="input-label">First Name</IonLabel>
                  <IonItem className="input-item" lines="none">
                    <IonInput
                      type="text"
                      placeholder="John"
                      value={form.firstName}
                      onIonInput={(e) => handleInputChange("firstName", e.detail.value!)}
                    />
                  </IonItem>
                </div>
                <div className="input-group">
                  <IonLabel className="input-label">Last Name</IonLabel>
                  <IonItem className="input-item" lines="none">
                    <IonInput
                      type="text"
                      placeholder="Doe"
                      value={form.lastName}
                      onIonInput={(e) => handleInputChange("lastName", e.detail.value!)}
                    />
                  </IonItem>
                </div>
              </div>

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
                <p className="input-hint">Must be at least 8 characters</p>
              </div>

              <div className="input-group">
                <IonLabel className="input-label">Confirm Password</IonLabel>
                <IonItem className="input-item" lines="none">
                  <IonInput
                    type="password"
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onIonInput={(e) => handleInputChange("confirmPassword", e.detail.value!)}
                  />
                </IonItem>
              </div>

              <label className="terms-checkbox">
                <IonCheckbox />
                <span>
                  I agree to the{" "}
                  <a href="#">Terms of Service</a>{" "}
                  and{" "}
                  <a href="#">Privacy Policy</a>
                </span>
              </label>

              <IonButton
                type="submit"
                expand="block"
                className="register-button"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create account"}
              </IonButton>
            </form>

            {/* Sign In Link */}
            <p className="signin-link">
              Already part of the pack?{" "}
              <IonButton
                fill="clear"
                routerLink="/login"
                className="link-button"
              >
                Sign in
              </IonButton>
            </p>

          </div>

          {/* RIGHT: illustration panel */}
          <div className="register-visual-panel">
            <div className="visual-glow"></div>

            <img
              src="/assets/register-hero.png"
              alt="Athlete checking workout progress on FitPlanner"
              className="lifter-photo"
            />

            <p className="visual-caption">
              <strong>Every rep logged. Every week planned.</strong><br />Join thousands training with a system, not guesswork.
            </p>
          </div>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default Register;