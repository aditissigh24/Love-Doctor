"use client";

import { useState, useEffect, useRef } from "react";
import "./CoachProfilePanel.css";

interface CoachProfile {
    id: number;
    name: string;
    title: string;
    specialty: string;
    bio: string;
    imageUrl: string;
    tags: string[];
}

interface CoachProfilePanelProps {
    initialProfile: CoachProfile;
}

export function CoachProfilePanel({ initialProfile }: CoachProfilePanelProps) {
    const [profile, setProfile] = useState<CoachProfile>(initialProfile);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);
    const [newTag, setNewTag] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Optionally fetch profile from API (for now we use initialProfile)
    const fetchProfile = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(
                `/api/coach/profile?id=${initialProfile.id}`
            );
            if (response.ok) {
                const data = await response.json();
                // Only update if we got actual data from API
                if (data.name) {
                    setProfile(data);
                }
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            setMessage(null);
            const response = await fetch("/api/coach/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profile),
            });
            if (response.ok) {
                setMessage({
                    type: "success",
                    text: "Profile saved successfully!",
                });
                setTimeout(() => setMessage(null), 3000);
            } else {
                throw new Error("Failed to save profile");
            }
        } catch (error) {
            setMessage({
                type: "error",
                text: "Failed to save profile. Please try again.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // For now, create a local preview URL
            // In production, you'd upload to a storage service
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfile((prev) => ({
                    ...prev,
                    imageUrl: reader.result as string,
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddTag = () => {
        if (newTag.trim() && !profile.tags.includes(newTag.trim())) {
            setProfile((prev) => ({
                ...prev,
                tags: [...prev.tags, newTag.trim()],
            }));
            setNewTag("");
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setProfile((prev) => ({
            ...prev,
            tags: prev.tags.filter((tag) => tag !== tagToRemove),
        }));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddTag();
        }
    };

    if (isLoading) {
        return (
            <div className="profile-panel">
                <div className="profile-loading">
                    <div className="loading-spinner" />
                    <p>Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-panel">
            <div className="profile-header">
                <h2>Profile Settings</h2>
            </div>

            <div className="profile-content">
                {/* Profile Picture */}
                <div className="profile-picture-section">
                    <div
                        className="profile-picture"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {profile.imageUrl ? (
                            <img src={profile.imageUrl} alt="Profile" />
                        ) : (
                            <div className="profile-picture-placeholder">
                                <svg
                                    width="48"
                                    height="48"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                >
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </div>
                        )}
                        <div className="profile-picture-overlay">
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                <circle cx="12" cy="13" r="4" />
                            </svg>
                        </div>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: "none" }}
                    />
                    <p className="profile-picture-hint">
                        Click to upload photo
                    </p>
                </div>

                {/* Form Fields */}
                <div className="profile-form">
                    <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <input
                            id="name"
                            type="text"
                            value={profile.name}
                            onChange={(e) =>
                                setProfile((prev) => ({
                                    ...prev,
                                    name: e.target.value,
                                }))
                            }
                            placeholder="Your full name"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="title">Title</label>
                        <input
                            id="title"
                            type="text"
                            value={profile.title}
                            onChange={(e) =>
                                setProfile((prev) => ({
                                    ...prev,
                                    title: e.target.value,
                                }))
                            }
                            placeholder="e.g., Relationship Coach"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="specialty">Specialty</label>
                        <input
                            id="specialty"
                            type="text"
                            value={profile.specialty}
                            onChange={(e) =>
                                setProfile((prev) => ({
                                    ...prev,
                                    specialty: e.target.value,
                                }))
                            }
                            placeholder="e.g., Dating & Attachment Styles"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="bio">Bio / Description</label>
                        <textarea
                            id="bio"
                            value={profile.bio}
                            onChange={(e) =>
                                setProfile((prev) => ({
                                    ...prev,
                                    bio: e.target.value,
                                }))
                            }
                            placeholder="Tell clients about yourself, your experience, and approach..."
                            rows={4}
                        />
                    </div>

                    <div className="form-group">
                        <label>Tags</label>
                        <div className="tags-container">
                            {profile.tags.map((tag) => (
                                <span key={tag} className="tag">
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveTag(tag)}
                                        className="tag-remove"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="tag-input-wrapper">
                            <input
                                type="text"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Add a tag and press Enter"
                            />
                            <button
                                type="button"
                                onClick={handleAddTag}
                                className="add-tag-btn"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>

                {/* Message */}
                {message && (
                    <div className={`profile-message ${message.type}`}>
                        {message.text}
                    </div>
                )}

                {/* Save Button */}
                <button
                    className="save-profile-btn"
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? "Saving..." : "Save Profile"}
                </button>
            </div>
        </div>
    );
}
