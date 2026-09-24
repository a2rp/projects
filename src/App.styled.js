import { NavLink } from "react-router-dom";
import styled from "styled-components";

export const Styled = {
    Wrapper: styled.div`
        min-height: 100vh;
        background: #07090d;
        color: #e6e9f0;
    `,
    Header: styled.header`
        position: fixed;
        top: 0;
        left: 0;
        z-index: 9999;
        width: 100%;
        min-height: 72px;
        display: flex;
        justify-content: center;
        border-bottom: 1px solid #242a38;
        background: rgba(7, 9, 13, 0.94);
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.22);
        backdrop-filter: blur(12px);
    `,
    HeaderMain: styled.div`
        width: min(100%, 1440px);
        min-height: 72px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        padding: 0 32px;
        @media (max-width: 720px) {
            padding: 0 16px;
        }
    `,
    BrandLink: styled(NavLink)`
        display: inline-flex;
        align-items: center;
        gap: 10px;
        color: #f8fafc;
        text-decoration: none;
        transition: text-shadow 0.18s ease;
        img {
            width: 38px;
            height: 38px;
            border-radius: 10px;
            object-fit: cover;
            border: 1px solid #343b4b;
        }
        span {
            display: grid;
            gap: 2px;
        }
        small {
            color: #748097;
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 0.14em;
        }
        strong {
            font-size: 15px;
            letter-spacing: 0.02em;
        }
        &:hover,
        &:focus-visible {
            text-shadow: 0 0 12px rgba(95, 149, 255, 0.55);
        }
    `,
    HeaderNav: styled.nav`
        display: flex;
        align-items: center;
        gap: 26px;
        @media (max-width: 720px) {
            display: none;
        }
    `,
    NavLink: styled(NavLink)`
        color: #aeb7c8;
        text-decoration: none;
        font-size: 14px;
        font-weight: 600;
        transition: color 0.18s ease, text-shadow 0.18s ease;
        &.active,
        &:hover,
        &:focus-visible {
            color: #ff6b35;
            text-shadow: 0 0 12px rgba(255, 107, 53, 0.35);
        }
        &:focus-visible {
            outline: 2px solid #ff6b35;
            outline-offset: 4px;
        }
    `,
    HeaderActions: styled.div`
        display: flex;
        align-items: center;
        gap: 10px;
        .sourceLink {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            min-height: 38px;
            padding: 0 12px;
            border: 1px solid #30384a;
            border-radius: 10px;
            color: #dbe4f2;
            font-size: 12px;
            text-decoration: none;
            transition: border-color 0.18s ease, box-shadow 0.18s ease, text-shadow 0.18s ease;
        }
        .sourceLink:hover,
        .sourceLink:focus-visible {
            border-color: #ff6b35;
            box-shadow: 0 0 16px rgba(255, 107, 53, 0.2);
            text-shadow: 0 0 10px rgba(255, 107, 53, 0.35);
        }
        @media (max-width: 520px) {
            .sourceLink span {
                display: none;
            }
        }
    `,
    MenuButton: styled.button`
        display: none;
        width: 40px;
        height: 40px;
        place-items: center;
        border: 1px solid #30384a;
        border-radius: 10px;
        background: #0d111a;
        color: #e6e9f0;
        transition: border-color 0.18s ease, box-shadow 0.18s ease, text-shadow 0.18s ease;
        &:hover,
        &:focus-visible {
            border-color: #ff6b35;
            box-shadow: 0 0 16px rgba(255, 107, 53, 0.2);
            text-shadow: 0 0 10px rgba(255, 107, 53, 0.35);
        }
        &:focus-visible {
            outline: 2px solid #ff6b35;
            outline-offset: 3px;
        }
        @media (max-width: 720px) {
            display: grid;
        }
    `,
    MobileMenu: styled.nav`
        position: absolute;
        top: calc(100% + 8px);
        right: 16px;
        width: min(280px, calc(100% - 32px));
        display: grid;
        gap: 4px;
        padding: 12px;
        border: 1px solid #30384a;
        border-radius: 14px;
        background: #101521;
        box-shadow: 0 18px 36px rgba(0, 0, 0, 0.36);
        a {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 11px 10px;
            border-radius: 8px;
            color: #dbe4f2;
            text-decoration: none;
            transition: border-color 0.18s ease, box-shadow 0.18s ease, text-shadow 0.18s ease;
        }
        a:hover,
        a:focus-visible {
            border-color: #ff6b35;
            box-shadow: 0 0 14px rgba(255, 107, 53, 0.16);
            text-shadow: 0 0 10px rgba(255, 107, 53, 0.35);
        }
    `,
    Main: styled.main`
        min-height: 100vh;
        padding: 112px 32px 48px;
        @media (max-width: 720px) {
            padding: 100px 16px 36px;
        }
    `,
    Footer: styled.footer`
        border-top: 1px solid #242a38;
        background: #05070a;
    `,
    FooterMain: styled.div`
        width: min(100%, 1440px);
        margin: 0 auto;
        display: grid;
        grid-template-columns: 1fr auto auto;
        align-items: center;
        gap: 28px;
        padding: 22px 32px;
        @media (max-width: 820px) {
            grid-template-columns: 1fr;
            gap: 18px;
            padding: 22px 16px;
        }
    `,
    FooterCol: styled.div`
        display: grid;
        gap: 8px;
        color: #8f9aae;
        font-size: 12px;
        a {
            color: #f3f6fb;
            text-decoration: none;
            transition: color 0.18s ease, text-shadow 0.18s ease;
            &:hover,
            &:focus-visible {
                color: #ff6b35;
                text-shadow: 0 0 10px rgba(255, 107, 53, 0.35);
            }
        }
        small {
            color: #748097;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.12em;
            text-transform: uppercase;
        }
        .iconLinks {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        .iconLinks a {
            width: 34px;
            height: 34px;
            display: grid;
            place-items: center;
            border: 1px solid #30384a;
            border-radius: 9px;
            background: #0d111a;
            color: #c8d1df;
            font-size: 15px;
            font-weight: 700;
            transition: border-color 0.18s ease, box-shadow 0.18s ease, text-shadow 0.18s ease;
        }
        .iconLinks a:hover,
        .iconLinks a:focus-visible {
            border-color: #ff6b35;
            box-shadow: 0 0 16px rgba(255, 107, 53, 0.2);
            text-shadow: 0 0 10px rgba(255, 107, 53, 0.35);
        }
    `,
    Loading: styled.div`
        min-height: 60vh;
        display: grid;
        place-items: center;
    `,
};
