import { useEffect, useState } from "react";
import { FiArrowUp } from "react-icons/fi";
import styled from "styled-components";

const Button = styled.button`
    position: fixed;
    right: 24px;
    bottom: 24px;
    z-index: 8000;
    width: 42px;
    height: 42px;
    display: grid;
    place-items: center;
    border: 1px solid #39445a;
    border-radius: 50%;
    background: #111827;
    color: #f8fafc;
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.28);
    transition: border-color 0.18s ease, box-shadow 0.18s ease, text-shadow 0.18s ease;
    &:hover,
    &:focus-visible {
        border-color: #ff6b35;
        box-shadow: 0 0 18px rgba(255, 107, 53, 0.26);
        text-shadow: 0 0 10px rgba(255, 107, 53, 0.4);
    }
    &:focus-visible {
        outline: 2px solid #ff6b35;
        outline-offset: 3px;
    }
`;

export default function ScrollToTop() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const update = () => setVisible(window.scrollY > 280);
        update();
        window.addEventListener("scroll", update, { passive: true });
        return () => window.removeEventListener("scroll", update);
    }, []);

    if (!visible) return null;

    return (
        <Button type="button" aria-label="Scroll to top" title="Scroll to top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <FiArrowUp aria-hidden="true" />
        </Button>
    );
}
