import styled from "styled-components";

export const Styled = {
    Wrapper: styled.div`
        max-width: 1100px;
        margin: 0 auto;
        padding: 40px 20px;
        color: #e6e9f0;
    `,

    Head: styled.div`
        display: flex;
        justify-content: space-between;
        gap: 12px;
        align-items: center;
        margin-bottom: 16px;
        flex-wrap: wrap;
    `,

    Title: styled.h2`
        margin: 0;
        font-size: 22px;
    `,

    Sub: styled.p`
        margin: 4px 0 0;
        color: #9aa4b2;
        font-size: 14px;
    `,

    Search: styled.input`
        width: 320px;
        max-width: 100%;
        padding: 10px 12px;
        border-radius: 10px;
        border: 1px solid #222634;
        background: #0b0d12;
        color: #e6e9f0;
        outline: none;
    `,

    TableWrapper: styled.div`
        width: 100%;
        overflow-x: auto;
        border-radius: 14px;
    `,

    Table: styled.table`
        width: 100%;
        min-width: 860px;
        border-collapse: separate;
        border-spacing: 0;
        background: #151821;
        border: 1px solid #222634;
        border-radius: 14px;
        overflow: hidden;

        th,
        td {
            padding: 12px 14px;
            text-align: left;
            border-bottom: 1px solid #222634;
            vertical-align: top;
            font-size: 14px;
        }
        thead th {
            background: #0f1320;
            color: #cdd6e3;
            font-weight: 600;
        }
        tbody tr:last-child td {
            border-bottom: 0;
        }
        a {
            color: #4f8cff;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
    `,

    Tags: styled.div`
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
    `,

    Tag: styled.span`
        font-size: 12px;
        padding: 4px 8px;
        border: 1px solid #222634;
        border-radius: 999px;
        color: #cfd6e6;
        background: #0f1115;
    `,
};
