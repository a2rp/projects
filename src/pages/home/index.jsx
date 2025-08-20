import React, { useMemo, useState } from "react";
import { Styled } from "./styled";

const projects = [
    {
        name: "Projects Index",
        desc: "Directory of all my projects with search and quick links.",
        tech: ["React", "Vite", "Styled Components"],
        live: "https://a2rp.github.io/projects",
        code: [{ label: "Repo", url: "https://github.com/a2rp/projects" }],
    },
    {
        name: "Public Resume (Releases)",
        desc: "Versioned resume with a permanent download link.",
        tech: ["React", "Vite", "Styled Components", "GitHub Releases"],
        live: "https://a2rp.github.io/resume/",
        code: [{ label: "Repo", url: "https://github.com/a2rp/resume" }],
    },
    {
        name: "Modal/Drawer Pro",
        desc: "Accessible modal & drawer with nesting (z-stack), ESC/backdrop close, scroll-lock, localStorage, confirm dialog, and toasts.",
        tech: ["React", "Vite", "Styled Components", "React Toastify"],
        live: "https://a2rp.github.io/modal-pro/",
        code: [{ label: "Repo", url: "https://github.com/a2rp/modal-pro" }],
    },
    {
        name: "Tooltip Pro",
        desc: "Dependency-free tooltips & popovers with smart positioning (flip/shift/arrow), hover/focus/click triggers, and accessible ARIA wiring.",
        tech: ["React", "Vite", "Styled Components"],
        live: "https://a2rp.github.io/tooltip-pro/",
        code: [{ label: "Repo", url: "https://github.com/a2rp/tooltip-pro" }],
    },
    {
        name: "Tabs Pro",
        desc: "Accessible tabs with add/close and localStorage persistence (no keyboard shortcuts).",
        tech: ["React", "Vite", "Styled Components"],
        live: "https://a2rp.github.io/tabs-pro/",
        code: [{ label: "Repo", url: "https://github.com/a2rp/tabs-pro" }],
    },
    {
        name: "Accordion Pro",
        desc: "Click-only accordion (no keyboard controls) with localStorage persistence and expand/collapse helpers.",
        tech: ["React", "Vite", "Styled Components"],
        live: "https://a2rp.github.io/accordion-pro/",
        code: [{ label: "Repo", url: "https://github.com/a2rp/accordion-pro" }],
    },
    {
        name: "Dropdown/Menu Pro",
        desc: "Click-only dropdown with one-level submenu, smart placement (flip & clamp), outside-click close. No portals used.",
        tech: ["React", "Vite", "Styled Components"],
        live: "https://a2rp.github.io/dropdown-pro/",
        code: [{ label: "Repo", url: "https://github.com/a2rp/dropdown-pro" }],
    }, {
        name: "KYC Verification",
        desc: "React KYC verification UI with styled-components, RHF+Yup validation, image preview & clear, header actions, toasts, and localStorage draft save.",
        tech: ["React", "Vite", "Styled Components", "React Hook Form", "Yup", "React Toastify"],
        live: "https://a2rp.github.io/kyc-verification/",
        code: [{ label: "Repo", url: "https://github.com/a2rp/kyc-verification" }],
    }, {
        name: "Blob Generator",
        desc: "CSS blob generator with size controls, 4-corner radii, gradient angle & colors, live preview, Copy CSS, and Randomize/Reset.",
        tech: ["React", "Vite", "Styled Components"],
        live: "https://a2rp.github.io/blob-generator/",
        code: [{ label: "Repo", url: "https://github.com/a2rp/blob-generator" }],
    }, {
        name: "Blood Bank",
        desc: "Frontend-only blood bank app: donor search/filters, register form (RHF + Zod), contact messages with confirm modal, donor details modal with edit, dark/light theme, localStorage persistence.",
        tech: ["React", "Vite", "Styled Components", "React Router", "React Hook Form", "Zod"],
        live: "https://a2rp.github.io/blood-bank/",
        code: [{ label: "Repo", url: "https://github.com/a2rp/blood-bank" }],
    }
];




const Home = () => {
    const [q, setQ] = useState("");

    const filtered = useMemo(() => {
        const v = q.trim().toLowerCase();
        if (!v) return projects;
        return projects.filter((p) => {
            const hay =
                (p.name || "") +
                " " +
                (p.desc || "") +
                " " +
                (Array.isArray(p.tech) ? p.tech.join(" ") : "") +
                " " +
                (Array.isArray(p.code) ? p.code.map((c) => c.label).join(" ") : "");
            return hay.toLowerCase().includes(v);
        });
    }, [q]);

    const list = useMemo(() => [...filtered].reverse(), [filtered]);

    return (
        <>
            <Styled.Wrapper>
                <Styled.Head>
                    <div>
                        <Styled.Title>Projects Index</Styled.Title>
                        <Styled.Sub>Search by name, description, or tech stack</Styled.Sub>
                    </div>
                    <Styled.Search
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search projects…"
                    />
                </Styled.Head>

                {filtered.length > 0 ? (
                    <Styled.TableWrapper>
                        <Styled.Table>
                            <thead>
                                <tr>
                                    <th style={{ width: 56 }}>#</th>
                                    <th>Project Name</th>
                                    <th>Project Description</th>
                                    <th>Tech Stack</th>
                                    <th>Live Link</th>
                                    <th>GitHub Code</th>
                                </tr>
                            </thead>
                            <tbody>
                                {list.map((p, i) => (
                                    <tr key={p.name + i}>
                                        <td>{String(list.length - i).padStart(3, "0")}</td>
                                        <td>{p.name}</td>
                                        <td>{p.desc}</td>
                                        <td>
                                            <Styled.Tags>
                                                {(p.tech || []).map((t) => (
                                                    <Styled.Tag key={t}>{t}</Styled.Tag>
                                                ))}
                                            </Styled.Tags>
                                        </td>
                                        <td>
                                            {p.live ? (
                                                <a href={p.live} target="_blank" rel="noopener noreferrer">Open</a>
                                            ) : "—"}
                                        </td>
                                        <td>
                                            {(p.code || []).length
                                                ? p.code.map((c, idx) => (
                                                    <React.Fragment key={c.url}>
                                                        <a href={c.url} target="_blank" rel="noopener noreferrer">
                                                            {c.label || "Repo"}
                                                        </a>
                                                        {idx < p.code.length - 1 ? " · " : ""}
                                                    </React.Fragment>
                                                ))
                                                : "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Styled.Table>
                    </Styled.TableWrapper>
                ) : (
                    <div style={{ width: "100%", padding: 15, textAlign: "center", backgroundColor: "#0f1320", borderRadius: 6 }}>
                        No project found
                    </div>
                )}

            </Styled.Wrapper>
        </>
    );
};

export default Home;

