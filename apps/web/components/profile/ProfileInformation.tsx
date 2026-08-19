"use client";

import { useState } from "react";

type ProfileInformationProps = {
  email: string | null;
  fullName: string;
  title: string | null;
  username: string | null;
  avatarUrl: string | null;

  onUpdate: (data: {
    fullName?: string;
    title?: string;
    username?: string;
  }) => Promise<void>;

  onAvatarUpload: (
    file: File,
  ) => Promise<void>;
};

export default function ProfileInformation({
  email,
  fullName,
  title,
  username,
  avatarUrl,
  onUpdate,
  onAvatarUpload,
}: ProfileInformationProps) {
  const [
    editingField,
    setEditingField,
  ] = useState<
    "fullName" | "title" | "username" | null
  >(null);

  const [value, setValue] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [
    uploadingAvatar,
    setUploadingAvatar,
  ] = useState(false);

  const startEditing = (
    field:
      | "fullName"
      | "title"
      | "username",
    currentValue: string | null,
  ) => {
    setEditingField(field);
    setValue(currentValue ?? "");
  };

  const saveField = async () => {
    if (!editingField) {
      return;
    }

    setSaving(true);

    try {
      await onUpdate({
        [editingField]: value,
      });

      setEditingField(null);
    } catch (error) {
      console.error(
        "Profile update failed:",
        error,
      );
    } finally {
      setSaving(false);
    }
  };

  const cancelEditing = () => {
    setEditingField(null);
    setValue("");
  };

  const handleAvatarChange =
    async (
      event: React.ChangeEvent<HTMLInputElement>,
    ) => {
      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }

      setUploadingAvatar(true);

      try {
        await onAvatarUpload(file);
      } catch (error) {
        console.error(
          "Avatar upload failed:",
          error,
        );
      } finally {
        setUploadingAvatar(false);
      }

      event.target.value = "";
    };

  return (
    <div className="w-full min-w-0 overflow-hidden rounded-xl border border-ui-border bg-ui-surface">

      {/* =========================
          PROFILE PICTURE
      ========================= */}

      <div className="flex items-center justify-between gap-4 border-b border-ui-border px-4 py-4 sm:px-5 sm:py-5">

        <span className="min-w-0 text-sm text-ui-text">
          Profile picture
        </span>

        <label className="relative flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-gray-800 text-sm text-white">

          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={fullName}
              className="h-full w-full object-cover"
            />
          ) : (
            fullName
              .charAt(0)
              .toUpperCase()
          )}

          {uploadingAvatar && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs">
              ...
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={
              handleAvatarChange
            }
            className="hidden"
            disabled={
              uploadingAvatar
            }
          />

        </label>

      </div>

      {/* =========================
          EMAIL
      ========================= */}

      <div className="flex items-center justify-between gap-4 border-b border-ui-border px-4 py-4 sm:px-5 sm:py-5">

        <span className="shrink-0 text-sm text-ui-text">
          Email
        </span>

        <div className="flex min-w-0 items-center gap-2 sm:gap-3">

          <span className="min-w-0 truncate text-right text-sm text-ui-text">
            {email ?? "No email"}
          </span>

          <button
            type="button"
            disabled
            className="shrink-0 cursor-not-allowed text-ui-text-muted opacity-50"
            title="Email changes are not available yet"
          >
            ✎
          </button>

        </div>

      </div>

      {/* =========================
          FULL NAME
      ========================= */}

      <ProfileField
        label="Full name"
        value={fullName}
        field="fullName"
        editingField={editingField}
        editValue={value}
        saving={saving}
        onEdit={startEditing}
        onChange={setValue}
        onSave={saveField}
        onCancel={cancelEditing}
      />

      {/* =========================
          TITLE
      ========================= */}

      <ProfileField
        label="Title"
        description="Your job title or role"
        value={title}
        field="title"
        editingField={editingField}
        editValue={value}
        saving={saving}
        onEdit={startEditing}
        onChange={setValue}
        onSave={saveField}
        onCancel={cancelEditing}
      />

      {/* =========================
          USERNAME
      ========================= */}

      <ProfileField
        label="Username"
        description="One word, like a nickname or first name"
        value={username}
        field="username"
        editingField={editingField}
        editValue={value}
        saving={saving}
        onEdit={startEditing}
        onChange={setValue}
        onSave={saveField}
        onCancel={cancelEditing}
      />

    </div>
  );
}

type ProfileFieldProps = {
  label: string;
  description?: string;
  value: string | null;
  field:
    | "fullName"
    | "title"
    | "username";

  editingField:
    | "fullName"
    | "title"
    | "username"
    | null;

  editValue: string;
  saving: boolean;

  onEdit: (
    field:
      | "fullName"
      | "title"
      | "username",
    value: string | null,
  ) => void;

  onChange: (
    value: string,
  ) => void;

  onSave: () => void;
  onCancel: () => void;
};

function ProfileField({
  label,
  description,
  value,
  field,
  editingField,
  editValue,
  saving,
  onEdit,
  onChange,
  onSave,
  onCancel,
}: ProfileFieldProps) {
  const isEditing =
    editingField === field;

  return (
    <div className="border-b border-ui-border px-4 py-4 last:border-b-0 sm:px-5 sm:py-5">

      <div
        className="
          flex
          min-w-0
          flex-col
          gap-3
          sm:flex-row
          sm:items-center
          sm:justify-between
          sm:gap-6
        "
      >

        {/* FIELD INFORMATION */}

        <div className="min-w-0">

          <p className="text-sm text-ui-text">
            {label}
          </p>

          {description && (
            <p className="mt-1 text-xs text-ui-text-muted">
              {description}
            </p>
          )}

        </div>

        {/* FIELD VALUE / EDIT */}

        {isEditing ? (

          <div
            className="
              flex
              min-w-0
              flex-col
              gap-2
              sm:flex-row
              sm:items-center
            "
          >

            <input
              autoFocus
              value={editValue}
              onChange={(event) =>
                onChange(
                  event.target.value,
                )
              }
              className="
                w-full
                min-w-0
                rounded-lg
                border
                border-ui-border
                bg-ui-surface
                px-3
                py-2
                text-sm
                text-ui-text
                outline-none
                placeholder:text-ui-text-muted
                focus:border-ui-text-muted
                sm:w-48
              "
            />

            <div className="flex w-full gap-2 sm:w-auto">

              <button
                type="button"
                onClick={onSave}
                disabled={saving}
                className="
                  flex-1
                  rounded-lg
                  bg-gray-900
                  px-3
                  py-2
                  text-xs
                  font-medium
                  text-white
                  disabled:opacity-50
                  sm:flex-none
                "
              >
                {saving
                  ? "Saving..."
                  : "Save"}
              </button>

              <button
                type="button"
                onClick={onCancel}
                disabled={saving}
                className="
                  flex-1
                  rounded-lg
                  px-3
                  py-2
                  text-xs
                  text-ui-text-muted
                  hover:bg-ui-surface-muted
                  sm:flex-none
                "
              >
                Cancel
              </button>

            </div>

          </div>

        ) : (

          <button
            type="button"
            onClick={() =>
              onEdit(
                field,
                value,
              )
            }
            className="
              max-w-full
              self-start
              truncate
              rounded-lg
              bg-ui-surface-muted
              px-3
              py-2
              text-left
              text-sm
              text-ui-text-secondary
              hover:bg-ui-border
              sm:self-auto
              sm:text-right
            "
          >
            {value ||
              `Add ${label.toLowerCase()}`}
          </button>

        )}

      </div>

    </div>
  );
}