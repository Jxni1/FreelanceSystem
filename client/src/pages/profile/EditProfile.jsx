import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../lib/apiClient";
import { useAuthorization } from "../../hooks/useAuthorization";

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { isFreelancer } = useAuthorization();

  const [form, setForm] = useState({
    name: "",
    surname: "",
    username: "",
    email: "",
    profilePhoto: "",
  });

  const [selectedPhotoFile, setSelectedPhotoFile] = useState(null);
  const [tempPhotoPreview, setTempPhotoPreview] = useState("");
  const [photoInputKey, setPhotoInputKey] = useState(Date.now());

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [formError, setFormError] = useState(null);

  const [allSkills, setAllSkills] = useState([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState([]);
  const [skillsSearch, setSkillsSearch] = useState("");
  const [isSavingSkills, setIsSavingSkills] = useState(false);
  const [skillsMessage, setSkillsMessage] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);

        const res = await apiClient.get("/api/users/me");
        const data = res.data?.value ?? res.data?.data ?? res.data;

        setForm({
          name: data?.name || "",
          surname: data?.surname || "",
          username: data?.username || "",
          email: data?.email || "",
          profilePhoto: data?.profilePhoto || "",
        });

        if (isFreelancer) {
          const currentSkillNames = data?.freelancerProfile?.skills ?? [];

          const [skillsRes] = await Promise.all([
            apiClient.get("/api/skills?pageSize=100"),
          ]);

          const skills = skillsRes.data?.items ?? skillsRes.data ?? [];
          setAllSkills(skills);

          const matchedIds = skills
            .filter((s) => currentSkillNames.includes(s.name))
            .map((s) => s.skillsID);

          setSelectedSkillIds(matchedIds);
        }
      } catch (err) {
        setFormError(err?.response?.data?.message || "Failed to load profile.");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [isFreelancer]);

  useEffect(() => {
    if (!selectedPhotoFile) {
      setTempPhotoPreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(selectedPhotoFile);
    setTempPhotoPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedPhotoFile]);

  const previewSrc = useMemo(
    () => tempPhotoPreview || form.profilePhoto || "",
    [tempPhotoPreview, form.profilePhoto]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0] || null;

    if (!file) {
      setSelectedPhotoFile(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setFormError("Please select a valid image file.");
      return;
    }

    setFormError(null);
    setSelectedPhotoFile(file);
  };

  const handleRemoveSelectedPhoto = () => {
    setSelectedPhotoFile(null);
    setTempPhotoPreview("");
    setPhotoInputKey(Date.now());
  };

  const handlePhotoUpload = async () => {
    if (!selectedPhotoFile) {
      setFormError("Please choose an image first.");
      return;
    }

    try {
      setFormError(null);
      setIsUploadingPhoto(true);

      const meRes = await apiClient.get("/api/users/me");
      const me = meRes.data?.value ?? meRes.data?.data ?? meRes.data;

      const userId = me?.userId || me?.userID || me?.id;
      if (!userId) {
        setFormError("Could not determine current user ID.");
        return;
      }

      const formData = new FormData();
      formData.append("Entity", "User");
      formData.append("EntityID", userId);
      formData.append("File", selectedPhotoFile);

      const uploadRes = await apiClient.post("/api/files", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploaded = uploadRes.data?.data ?? uploadRes.data;
      const uploadedPath =
        uploaded?.file_Path ||
        uploaded?.filePath ||
        uploaded?.path ||
        uploaded?.url;

      if (!uploadedPath) {
        setFormError("Upload succeeded but no file path was returned.");
        return;
      }

      setForm((prev) => ({
        ...prev,
        profilePhoto: uploadedPath,
      }));

      setSelectedPhotoFile(null);
      setTempPhotoPreview("");
      setPhotoInputKey(Date.now());
    } catch (err) {
      const raw = err?.response?.data;
      setFormError(
        raw?.error ||
          raw?.message ||
          raw?.title ||
          (typeof raw === "string" ? raw : "Failed to upload profile photo.")
      );
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setIsSaving(true);

    try {
      console.log("SUBMIT FORM", form);

      await apiClient.put("/api/users/me", {
        name: form.name.trim(),
        surname: form.surname.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        profilePhoto: form.profilePhoto?.trim() || null,
      });

      navigate("/profile");
    } catch (err) {
      const raw = err?.response?.data;
      setFormError(
        raw?.error ||
          raw?.message ||
          raw?.title ||
          (typeof raw === "string" ? raw : "Failed to update profile.")
      );
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSkill = (id) => {
    setSelectedSkillIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSaveSkills = async () => {
    setIsSavingSkills(true);
    setSkillsMessage(null);

    try {
      await apiClient.put("/api/users/me/skills", {
        skillIds: selectedSkillIds,
      });
      setSkillsMessage({ type: "success", text: "Skills updated." });
    } catch (err) {
      const raw = err?.response?.data;
      setSkillsMessage({
        type: "error",
        text:
          raw?.message ||
          (typeof raw === "string" ? raw : "Failed to save skills."),
      });
    } finally {
      setIsSavingSkills(false);
    }
  };

  const filteredSkills = allSkills.filter((s) =>
    s.name.toLowerCase().includes(skillsSearch.toLowerCase())
  );

  const inputClass =
    "w-full px-3 py-2.5 rounded-lg bg-white border border-slate-300 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500";

  const labelClass =
    "block text-[11px] font-semibold text-slate-400 uppercase mb-1.5";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-10 min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 lg:p-10 text-slate-100 space-y-6">
      <div className="bg-white text-slate-900 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-teal-500 to-emerald-400" />
        <div className="p-8">
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
            Edit Profile
          </h1>
          <p className="text-slate-500 mb-8 text-sm">
            Update your personal account information.
          </p>

          {formError && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Improved upload section */}
            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="shrink-0">
                {previewSrc ? (
                  <img
                    src={previewSrc}
                    alt="Profile preview"
                    className="w-24 h-24 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-slate-200"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-500 text-xs text-center px-2">
                    No Photo
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <label className={labelClass}>Profile Photo</label>

                  <input
                    id="profile-photo-upload"
                    key={photoInputKey}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />

                  <label
                    htmlFor="profile-photo-upload"
                    className="group flex cursor-pointer items-center justify-between rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 transition hover:border-teal-400 hover:bg-teal-50/40"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 group-hover:text-teal-700">
                        {selectedPhotoFile
                          ? "Change selected image"
                          : "Choose a profile image"}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {selectedPhotoFile
                          ? selectedPhotoFile.name
                          : "PNG, JPG, JPEG or WEBP"}
                      </p>
                    </div>

                    <span className="ml-4 inline-flex shrink-0 items-center rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 group-hover:bg-teal-100 group-hover:text-teal-700">
                      Browse
                    </span>
                  </label>
                </div>

                {selectedPhotoFile && (
                  <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
                    New image selected. Click{" "}
                    <span className="font-semibold">Upload Photo</span> to save
                    it.
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handlePhotoUpload}
                    disabled={!selectedPhotoFile || isUploadingPhoto}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold text-white disabled:bg-emerald-300"
                  >
                    {isUploadingPhoto ? "Uploading..." : "Upload Photo"}
                  </button>

                  <button
                    type="button"
                    onClick={handleRemoveSelectedPhoto}
                    disabled={!selectedPhotoFile}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                  >
                    Remove Selection
                  </button>
                </div>

                {form.profilePhoto && (
                  <span className="text-xs text-slate-500 break-all">
                    Saved path: {form.profilePhoto}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>First Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Last Name</label>
                <input
                  type="text"
                  name="surname"
                  value={form.surname}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Username</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className={labelClass}>Profile Photo Path</label>
              <input
                type="text"
                name="profilePhoto"
                value={form.profilePhoto}
                onChange={handleChange}
                className={inputClass}
                placeholder="Uploaded file path will appear here"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-sm font-semibold text-white disabled:bg-teal-300"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {isFreelancer && (
        <div className="bg-white text-slate-900 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="h-1 bg-linear-to-r from-teal-500 to-emerald-400" />
          <div className="p-8">
            <h2 className="text-xl font-extrabold text-slate-900 mb-1">
              Your Skills
            </h2>
            <p className="text-slate-500 mb-6 text-sm">
              Select the skills you offer. Projects matching your skills will be
              shown to you first.
            </p>

            {skillsMessage && (
              <div
                className={`mb-4 p-3 rounded-xl text-sm border ${
                  skillsMessage.type === "success"
                    ? "bg-teal-50 border-teal-200 text-teal-700"
                    : "bg-rose-50 border-rose-200 text-rose-700"
                }`}
              >
                {skillsMessage.text}
              </div>
            )}

            {selectedSkillIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {allSkills
                  .filter((s) => selectedSkillIds.includes(s.skillsID))
                  .map((s) => (
                    <span
                      key={s.skillsID}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200"
                    >
                      {s.name}
                      <button
                        type="button"
                        onClick={() => toggleSkill(s.skillsID)}
                        className="text-teal-500 hover:text-teal-700 leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
              </div>
            )}

            <input
              type="text"
              placeholder="Search skills..."
              value={skillsSearch}
              onChange={(e) => setSkillsSearch(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 mb-3"
            />

            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto mb-5">
              {filteredSkills.map((s) => (
                <button
                  key={s.skillsID}
                  type="button"
                  onClick={() => toggleSkill(s.skillsID)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    selectedSkillIds.includes(s.skillsID)
                      ? "bg-teal-600 border-teal-600 text-white"
                      : "bg-white border-slate-300 text-slate-600 hover:border-teal-400 hover:text-teal-600"
                  }`}
                >
                  {s.name}
                </button>
              ))}
              {filteredSkills.length === 0 && (
                <p className="text-xs text-slate-400">No skills found.</p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSaveSkills}
                disabled={isSavingSkills}
                className="px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-sm font-semibold text-white disabled:bg-teal-300"
              >
                {isSavingSkills ? "Saving..." : "Save Skills"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
