import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

import Card from "../../components/ui/card";
import Input from "../../components/ui/input";
import Label from "../../components/ui/label";
import Button from "../../components/ui/button";

const EditProfile = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.email) {
      axios
        .get("http://localhost:8000/general_user/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then((res) => setForm(res.data))
        .catch((err) => {
          console.error("Failed to fetch profile", err);
          toast.error("Failed to load profile.");
        });
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const doSave = async () => {
    try {
      setSaving(true);
      await axios.put("http://localhost:8000/general_user/profile", form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      toast.success("Profile updated!");
      navigate("/profile");
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Update failed: " + (err.response?.data?.detail || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => {
    toast.info(
      ({ closeToast }) => (
        <div
          style={{
            background: "#ffffff",
            borderRadius: 8,
            padding: "16px",
            width: "280px",
            fontFamily: "sans-serif",
          }}
        >
          <div style={{ fontWeight: "600", fontSize: "16px", marginBottom: "8px", color: "#333" }}>
            Confirm Profile Edit
          </div>
          <p style={{ fontSize: "14px", marginBottom: "16px", color: "#555" }}>
            Are you sure you want to save these changes?
          </p>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => {
                closeToast?.();
                doSave();
              }}
              disabled={saving}
              style={{
                flex: 1,
                background: "#1d4ed8",
                color: "#fff",
                padding: "8px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              {saving ? "Saving..." : "Confirm"}
            </button>
            <button
              onClick={() => closeToast?.()}
              disabled={saving}
              style={{
                flex: 1,
                background: "#fff",
                color: "#333",
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
        draggable: false,
      }
    );
  };

  if (!user) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md p-8 rounded-xl shadow-md bg-white">
        <h2 className="text-2xl font-semibold text-center text-blue-900 mb-6">
          Edit Profile
        </h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              name="first_name"
              value={form.first_name || ""}
              onChange={handleChange}
              placeholder="Enter your first name"
            />
          </div>
          <div>
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              name="last_name"
              value={form.last_name || ""}
              onChange={handleChange}
              placeholder="Enter your last name"
            />
          </div>
          <div>
            <Label htmlFor="contact">Contact</Label>
            <Input
              id="contact"
              name="contact"
              value={form.contact || ""}
              onChange={handleChange}
              placeholder="Enter contact number"
            />
          </div>
          <div>
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={form.password || ""}
              onChange={handleChange}
              placeholder="Enter new password"
            />
          </div>
          <Button
            type="button"
            className="w-full mt-2"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default EditProfile;
